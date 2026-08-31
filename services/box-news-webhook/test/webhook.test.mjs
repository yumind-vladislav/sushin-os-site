import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  coalesceAlbumEvents,
  mergePostRecords,
  normalizeTelegramUpdate,
  secureEqual,
} from '../src/core.mjs';
import { EventStore } from '../src/storage.mjs';

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
        ? { photo: [{ file_id: 'small' }, { file_id: 'large', width: 1280, height: 720 }] }
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
    entities: [{ type: 'text_link', offset: 9, length: 6, url: 'https://example.com/' }],
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

test('edited channel posts replace the same stable ID when newer', () => {
  const incoming = update({ text: 'Edited' });
  incoming.edited_channel_post = {
    ...incoming.channel_post,
    edit_date: 1_788_182_500,
  };
  delete incoming.channel_post;
  const event = normalizeTelegramUpdate(incoming, '-1001234567890');
  assert.equal(event.post.editedAt, '2026-08-31T13:21:40.000Z');

  const older = { ...event.post, content: 'Older', editedAt: '2026-08-31T13:00:00.000Z' };
  const merged = mergePostRecords([event.post], older);
  assert.equal(merged[0].content, 'Edited');
});

test('album events coalesce by stable primary message and media types', () => {
  const first = normalizeTelegramUpdate(
    update({ updateId: 910, messageId: 721, groupId: 'album_1', text: '', photo: true }),
    '-1001234567890',
  );
  const second = normalizeTelegramUpdate(
    update({ updateId: 911, messageId: 722, groupId: 'album_1', text: 'Album caption' }),
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
      update({ updateId: 920, messageId: 723, groupId: 'album_2', photo: true }),
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
