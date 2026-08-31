import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  flattenTelegramText,
  mergeBoxNewsPosts,
  normalizeDesktopExport,
  normalizeLegacyPost,
} from '../lib/box-news-import';
import {
  boxNewsPosts,
  getBoxNewsPost,
  selectPublicBoxNews,
} from '../lib/box-news';
import { buildBoxNewsMetadata } from '../lib/box-news-metadata';
import { buildBoxNewsRss } from '../lib/rss';

void describe('Box News normalization', () => {
  void it('flattens Telegram entity text without HTML', () => {
    assert.equal(
      flattenTelegramText(['Plain ', { type: 'bold', text: 'safe' }, ' text']),
      'Plain safe text',
    );
  });

  void it('ignores service records and normalizes stable Telegram ids', async () => {
    const coverDirectory = await mkdtemp(
      path.join(tmpdir(), 'sushin-box-news-'),
    );
    const source = {
      type: 'public_channel',
      messages: [
        { type: 'service', id: 1 },
        {
          type: 'message',
          id: 575,
          date_unixtime: '1762963200',
          text: ['Test title\n', { type: 'bold', text: 'Body' }],
          text_entities: [],
        },
      ],
    };
    const result = await normalizeDesktopExport(
      source,
      coverDirectory,
      coverDirectory,
    );
    assert.equal(result.posts.length, 1);
    assert.equal(result.posts[0]?.id, '575');
    assert.equal(result.posts[0]?.content, 'Test title\nBody');
    assert.equal(result.report.serviceRecordsIgnored, 1);
  });

  void it('replaces an existing id only with an equally new or newer edit', () => {
    const original = normalizeLegacyPost({
      id: '719',
      title: 'Original',
      preview: 'Original preview',
      content: 'Original body',
      date: '2026-08-20T10:00:00Z',
      references: [],
    });
    const older = {
      ...original,
      title: 'Older',
      editedAt: '2026-08-20T09:00:00Z',
    };
    const newer = {
      ...original,
      title: 'Newer',
      editedAt: '2026-08-20T11:00:00Z',
    };
    assert.equal(mergeBoxNewsPosts([original], [older])[0]?.title, 'Original');
    assert.equal(mergeBoxNewsPosts([original], [newer])[0]?.title, 'Newer');
  });

  void it('keeps media-only legacy posts publishable', () => {
    const post = normalizeLegacyPost({
      id: '717',
      title: 'Video note',
      preview: 'Open the original video.',
      content: '',
      date: '2026-08-19T10:00:00Z',
      hasMedia: true,
      mediaType: 'video',
      references: [],
    });
    assert.equal(post.media[0]?.type, 'video');
    assert.equal(post.content, '');
  });

  void it('ships the retained history through id 719 as build-time data', () => {
    assert.equal(boxNewsPosts.length, 130);
    assert.equal(boxNewsPosts[0]?.id, '719');
    assert.equal(boxNewsPosts.at(-1)?.id, '575');
    assert.equal(boxNewsPosts.filter(({ cover }) => cover).length, 74);
    assert.ok(
      boxNewsPosts.every(
        (post) => !post.cover || post.cover.src.startsWith('/media/box-news/'),
      ),
    );
  });

  void it('removes hidden posts from discovery data', () => {
    const hidden = selectPublicBoxNews(boxNewsPosts, ['719']);
    assert.equal(
      hidden.some(({ id }) => id === '719'),
      false,
    );
    assert.equal(hidden.length, boxNewsPosts.length - 1);
  });

  void it('builds self-canonical article metadata and RSS', () => {
    const post = getBoxNewsPost('719');
    assert.ok(post);
    const metadata = buildBoxNewsMetadata(post);
    assert.equal(
      metadata.alternates?.canonical,
      'http://localhost:3000/box-news/719/',
    );
    assert.equal(
      (metadata.openGraph as { type?: string } | undefined)?.type,
      'article',
    );
    const rss = buildBoxNewsRss([post]);
    assert.match(rss, /http:\/\/localhost:3000\/box-news\/719\//);
    assert.match(rss, /<rss version="2\.0">/);
  });
});
