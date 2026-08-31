import { mkdir, readdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function atomicJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });
  await rename(temporary, filePath);
}

function safeGroupId(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new TypeError('invalid_media_group');
  return value;
}

export class EventStore {
  constructor(stateDirectory) {
    this.stateDirectory = path.resolve(stateDirectory);
    this.eventsPath = path.join(this.stateDirectory, 'events.json');
    this.albumDirectory = path.join(this.stateDirectory, 'pending-albums');
    this.writeChain = Promise.resolve();
  }

  async initialize() {
    await mkdir(this.albumDirectory, { recursive: true, mode: 0o700 });
  }

  async eventStatus(key) {
    const state = await readJson(this.eventsPath, { schemaVersion: 1, events: {} });
    return state.events[key]?.status ?? null;
  }

  async mark(event, status) {
    this.writeChain = this.writeChain.then(async () => {
      const state = await readJson(this.eventsPath, { schemaVersion: 1, events: {} });
      state.events[event.key] = {
        status,
        updateId: event.updateId,
        chatId: event.chatId,
        messageId: event.messageId,
        mediaGroupId: event.mediaGroupId,
        receivedAt: new Date().toISOString(),
      };
      await atomicJson(this.eventsPath, state);
    });
    return this.writeChain;
  }

  albumPath(groupId) {
    return path.join(this.albumDirectory, `${safeGroupId(groupId)}.json`);
  }

  async appendAlbum(event) {
    const filePath = this.albumPath(event.mediaGroupId);
    const events = await readJson(filePath, []);
    if (!events.some(({ key }) => key === event.key)) events.push(event);
    await atomicJson(filePath, events);
  }

  async readAlbum(groupId) {
    return readJson(this.albumPath(groupId), []);
  }

  async removeAlbum(groupId) {
    try {
      await unlink(this.albumPath(groupId));
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }

  async listAlbumIds() {
    const entries = await readdir(this.albumDirectory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => entry.name.slice(0, -'.json'.length))
      .filter((groupId) => /^[A-Za-z0-9_-]+$/.test(groupId));
  }
}

export { atomicJson };
