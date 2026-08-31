import http from 'node:http';
import path from 'node:path';
import {
  coalesceAlbumEvents,
  normalizeTelegramUpdate,
  secureEqual,
} from './core.mjs';
import { EventStore } from './storage.mjs';
import { commitAndPush, createPublishQueue, writeEvent } from './writer.mjs';

const BODY_LIMIT = 1024 * 1024;

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`missing_${name.toLowerCase()}`);
  return value;
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > BODY_LIMIT) {
        reject(new Error('body_too_large'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

function respond(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(`${JSON.stringify(payload)}\n`);
}

const config = {
  token: required('TELEGRAM_BOT_TOKEN'),
  secret: required('TELEGRAM_WEBHOOK_SECRET'),
  expectedChatId: required('TELEGRAM_CHANNEL_CHAT_ID'),
  webhookPath: process.env.WEBHOOK_PATH || '/telegram/webhook',
  port: Number(process.env.PORT || 8787),
  stateDirectory: path.resolve(required('BOX_NEWS_STATE_DIRECTORY')),
  repositoryDirectory: path.resolve(required('BOX_NEWS_REPOSITORY_DIRECTORY')),
  gitPush: process.env.BOX_NEWS_GIT_PUSH === '1',
  gitBranch: process.env.BOX_NEWS_GIT_BRANCH || 'main',
  albumDelayMs: Math.max(
    500,
    Number(process.env.BOX_NEWS_ALBUM_DELAY_MS || 2500),
  ),
};

if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error('invalid_port');
}

const store = new EventStore(config.stateDirectory);
const albumTimers = new Map();
const publishQueue = createPublishQueue();

async function publish(event) {
  return publishQueue.run(async () => {
    const result = await writeEvent({
      event,
      token: config.token,
      repositoryDirectory: config.repositoryDirectory,
    });
    await commitAndPush({
      repositoryDirectory: config.repositoryDirectory,
      trackedPaths: result.trackedPaths,
      postId: result.id,
      branch: config.gitBranch,
      enabled: config.gitPush,
    });
  });
}

async function flushAlbum(groupId) {
  albumTimers.delete(groupId);
  const events = await store.readAlbum(groupId);
  if (events.length === 0) return;
  const event = coalesceAlbumEvents(events);
  await publish(event);
  for (const albumEvent of events) await store.mark(albumEvent, 'applied');
  await store.removeAlbum(
    groupId,
    events.map(({ key }) => key),
  );
}

function scheduleAlbum(groupId) {
  const existing = albumTimers.get(groupId);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    flushAlbum(groupId).catch(() => {
      scheduleAlbum(groupId);
    });
  }, config.albumDelayMs);
  timer.unref();
  albumTimers.set(groupId, timer);
}

await store.initialize();
for (const groupId of await store.listAlbumIds()) scheduleAlbum(groupId);

const server = http.createServer(async (request, response) => {
  if (request.url === '/health' && request.method === 'GET') {
    respond(response, 200, { status: 'ok' });
    return;
  }
  if (request.url !== config.webhookPath) {
    respond(response, 404, { status: 'not_found' });
    return;
  }
  if (request.method !== 'POST') {
    response.setHeader('allow', 'POST');
    respond(response, 405, { status: 'method_not_allowed' });
    return;
  }
  const providedSecret = request.headers['x-telegram-bot-api-secret-token'];
  if (!secureEqual(providedSecret, config.secret)) {
    respond(response, 401, { status: 'unauthorized' });
    return;
  }

  try {
    const update = JSON.parse(await readRequestBody(request));
    const event = normalizeTelegramUpdate(update, config.expectedChatId);
    const status = await store.eventStatus(event.key);
    if (status === 'applied') {
      respond(response, 200, { status: 'duplicate' });
      return;
    }

    await store.mark(event, 'accepted');
    if (event.mediaGroupId) {
      await store.appendAlbum(event);
      scheduleAlbum(event.mediaGroupId);
      respond(response, 202, { status: 'accepted' });
      return;
    }

    await publish(event);
    await store.mark(event, 'applied');
    respond(response, 200, { status: 'applied' });
  } catch (error) {
    const knownStatus = {
      wrong_chat: 403,
      unsupported_update: 422,
      invalid_update_id: 422,
      invalid_message_id: 422,
      invalid_timestamp: 422,
      body_too_large: 413,
    }[error?.message];
    respond(response, knownStatus ?? 503, {
      status: knownStatus ? 'rejected' : 'retry',
    });
  }
});

server.listen(config.port, '127.0.0.1');
