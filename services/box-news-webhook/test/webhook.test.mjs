import assert from 'node:assert/strict';
import test from 'node:test';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import {
  coalesceAlbumEvents,
  mergePostRecords,
  normalizeTelegramUpdate,
  secureEqual,
} from '../src/core.mjs';
import { EventStore } from '../src/storage.mjs';
import {
  commitAndPush,
  createPublishQueue,
  writeEvent,
} from '../src/writer.mjs';

const execFileAsync = promisify(execFile);

function update(overrides = {}) {
  return {
    update_id: overrides.updateId ?? 901,
    channel_post: {
      message_id: overrides.messageId ?? 720,
      date: overrides.date ?? 1_788_182_400,
      chat: { id: -1001234567890 },
      text: overrides.text ?? 'A safe plaintext post',
      entities: overrides.entities ?? [],
      ...(overrides.groupId ? { media_group_id: overrides.groupId } : {}),
      ...(overrides.photo
        ? {
            photo: [
              { file_id: 'small' },
              { file_id: 'large', width: 1280, height: 720 },
            ],
          }
        : {}),
    },
  };
}

test('secret comparison rejects missing, different, and length-mismatched values', () => {
  assert.equal(secureEqual('same-value', 'same-value'), true);
  assert.equal(secureEqual('different', 'same-value'), false);
  assert.equal(secureEqual('short', 'much-longer'), false);
  assert.equal(secureEqual(undefined, 'same-value'), false);
});

test('normalizer enforces the configured channel', () => {
  assert.throws(
    () => normalizeTelegramUpdate(update(), '-1000000000000'),
    /wrong_chat/,
  );
});

test('normalizer preserves safe text entities and selects the largest photo', () => {
  const incoming = update({
    text: 'Read the source',
    entities: [
      { type: 'text_link', offset: 9, length: 6, url: 'https://example.com/' },
    ],
    photo: true,
  });
  const event = normalizeTelegramUpdate(incoming, '-1001234567890');
  assert.equal(event.post.id, '720');
  assert.equal(event.post.content, 'Read the source');
  assert.deepEqual(event.post.references, [
    { label: 'source', url: 'https://example.com/' },
  ]);
  assert.equal(event.photo.fileId, 'large');
  assert.equal(event.post.media[0].type, 'photo');
});

test('normalizer rejects empty and unsupported-media-only updates', () => {
  const empty = update({ updateId: 903, messageId: 724 });
  delete empty.channel_post.text;
  assert.throws(
    () => normalizeTelegramUpdate(empty, '-1001234567890'),
    /unsupported_update/,
  );

  const voiceOnly = update({ updateId: 904, messageId: 725 });
  delete voiceOnly.channel_post.text;
  voiceOnly.channel_post.voice = { file_id: 'unsupported' };
  assert.throws(
    () => normalizeTelegramUpdate(voiceOnly, '-1001234567890'),
    /unsupported_update/,
  );
});

test('normalizer publishes a poll question as marked plaintext', () => {
  const incoming = update({ updateId: 905, messageId: 726 });
  delete incoming.channel_post.text;
  incoming.channel_post.poll = { question: 'Какой вариант выбрать?' };
  const event = normalizeTelegramUpdate(incoming, '-1001234567890');
  assert.equal(event.post.content, 'ОПРОС TELEGRAM\nКакой вариант выбрать?');
});

test('edited channel posts replace the same stable ID when newer', () => {
  const incoming = update({ text: 'Edited' });
  incoming.edited_channel_post = {
    ...incoming.channel_post,
    edit_date: 1_788_182_500,
  };
  delete incoming.channel_post;
  const event = normalizeTelegramUpdate(incoming, '-1001234567890');
  assert.equal(event.post.editedAt, '2026-08-31T13:21:40.000Z');

  const older = {
    ...event.post,
    content: 'Older',
    editedAt: '2026-08-31T13:00:00.000Z',
  };
  const merged = mergePostRecords([event.post], older);
  assert.equal(merged[0].content, 'Edited');
});

test('album events coalesce by stable primary message and media types', () => {
  const first = normalizeTelegramUpdate(
    update({
      updateId: 910,
      messageId: 721,
      groupId: 'album_1',
      text: '',
      photo: true,
    }),
    '-1001234567890',
  );
  const second = normalizeTelegramUpdate(
    update({
      updateId: 911,
      messageId: 722,
      groupId: 'album_1',
      text: 'Album caption',
    }),
    '-1001234567890',
  );
  const album = coalesceAlbumEvents([first, second]);
  assert.equal(album.post.id, '722');
  assert.equal(album.post.content, 'Album caption');
  assert.equal(album.photo.fileId, 'large');
  assert.deepEqual(album.albumKeys, [first.key, second.key]);
});

test('event acceptance and pending albums survive a fresh store instance', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'box-news-webhook-'));
  try {
    const event = normalizeTelegramUpdate(
      update({
        updateId: 920,
        messageId: 723,
        groupId: 'album_2',
        photo: true,
      }),
      '-1001234567890',
    );
    const firstStore = new EventStore(directory);
    await firstStore.initialize();
    await firstStore.mark(event, 'accepted');
    await firstStore.appendAlbum(event);

    const restartedStore = new EventStore(directory);
    await restartedStore.initialize();
    assert.equal(await restartedStore.eventStatus(event.key), 'accepted');
    assert.deepEqual(await restartedStore.listAlbumIds(), ['album_2']);
    assert.equal((await restartedStore.readAlbum('album_2'))[0].key, event.key);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('album cleanup preserves events accepted during a flush', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'box-news-album-race-'));
  try {
    const store = new EventStore(directory);
    await store.initialize();
    const first = normalizeTelegramUpdate(
      update({ updateId: 920, messageId: 720, groupId: 'album-race' }),
      '-1001234567890',
    );
    const second = normalizeTelegramUpdate(
      update({ updateId: 921, messageId: 721, groupId: 'album-race' }),
      '-1001234567890',
    );
    await store.appendAlbum(first);
    const flushing = await store.readAlbum('album-race');
    await store.appendAlbum(second);
    await store.removeAlbum(
      'album-race',
      flushing.map(({ key }) => key),
    );
    const pending = await store.readAlbum('album-race');
    assert.deepEqual(pending.map(({ key }) => key), [second.key]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('publish queue preserves concurrent repository writes', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'box-news-writes-'));
  try {
    await mkdir(path.join(directory, 'content/box-news'), { recursive: true });
    await writeFile(
      path.join(directory, 'content/box-news/posts.json'),
      '[]\n',
    );
    const first = normalizeTelegramUpdate(
      update({ updateId: 930, messageId: 730, text: 'First concurrent post' }),
      '-1001234567890',
    );
    const second = normalizeTelegramUpdate(
      update({ updateId: 931, messageId: 731, text: 'Second concurrent post' }),
      '-1001234567890',
    );
    const queue = createPublishQueue();
    await Promise.all(
      [first, second].map((event) =>
        queue.run(() =>
          writeEvent({
            event,
            token: 'unused-without-photo',
            repositoryDirectory: directory,
          }),
        ),
      ),
    );
    const posts = JSON.parse(
      await readFile(
        path.join(directory, 'content/box-news/posts.json'),
        'utf8',
      ),
    );
    assert.deepEqual(
      posts.map(({ id }) => id),
      ['730', '731'],
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('failed push retry pushes an existing commit without a new diff', async () => {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), 'box-news-git-retry-'),
  );
  const repositoryDirectory = path.join(directory, 'repository');
  const remoteDirectory = path.join(directory, 'remote.git');
  const postsPath = path.join(
    repositoryDirectory,
    'content/box-news/posts.json',
  );
  try {
    await mkdir(path.dirname(postsPath), { recursive: true });
    await execFileAsync('git', ['init', '-b', 'main'], {
      cwd: repositoryDirectory,
    });
    await execFileAsync('git', ['config', 'user.name', 'Webhook Test'], {
      cwd: repositoryDirectory,
    });
    await execFileAsync(
      'git',
      ['config', 'user.email', 'webhook-test@example.invalid'],
      {
        cwd: repositoryDirectory,
      },
    );
    await execFileAsync('git', ['config', 'commit.gpgsign', 'false'], {
      cwd: repositoryDirectory,
    });
    await writeFile(postsPath, '[]\n');
    await execFileAsync('git', ['add', '--', 'content/box-news/posts.json'], {
      cwd: repositoryDirectory,
    });
    await execFileAsync('git', ['commit', '-m', 'initial'], {
      cwd: repositoryDirectory,
    });
    await execFileAsync('git', ['remote', 'add', 'origin', remoteDirectory], {
      cwd: repositoryDirectory,
    });
    await writeFile(postsPath, '[{"id":"732"}]\n');

    await assert.rejects(
      commitAndPush({
        repositoryDirectory,
        trackedPaths: ['content/box-news/posts.json'],
        postId: '732',
        branch: 'main',
        enabled: true,
      }),
    );
    const logAfterFailure = await execFileAsync(
      'git',
      ['rev-list', '--count', 'HEAD'],
      {
        cwd: repositoryDirectory,
      },
    );
    assert.equal(logAfterFailure.stdout.trim(), '2');

    await execFileAsync('git', ['init', '--bare', remoteDirectory], {
      cwd: directory,
    });
    const committed = await commitAndPush({
      repositoryDirectory,
      trackedPaths: ['content/box-news/posts.json'],
      postId: '732',
      branch: 'main',
      enabled: true,
    });
    assert.equal(committed, false);
    const localHead = await execFileAsync('git', ['rev-parse', 'HEAD'], {
      cwd: repositoryDirectory,
    });
    const remoteHead = await execFileAsync(
      'git',
      ['--git-dir', remoteDirectory, 'rev-parse', 'refs/heads/main'],
      { cwd: directory },
    );
    assert.equal(remoteHead.stdout.trim(), localHead.stdout.trim());
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
