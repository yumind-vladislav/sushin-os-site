import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { BoxNewsPost, BoxNewsReference } from './box-news-schema';
import { isHttpUrl, validateBoxNewsCollection } from './box-news-schema';

type UnknownRecord = Record<string, unknown>;

export type ImportReport = {
  schemaVersion: 1;
  sourceMessages: number;
  serviceRecordsIgnored: number;
  importedIds: string[];
  mergedIds: string[];
  coversCopied: string[];
  postsWritten: number;
};

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? (value as UnknownRecord) : {};
}

export function flattenTelegramText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(flattenTelegramText).join('');
  const record = asRecord(value);
  return typeof record.text === 'string' ? record.text : '';
}

function normalizedText(value: unknown): string {
  return flattenTelegramText(value)
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function truncateAtWord(value: string, limit: number): string {
  if (value.length <= limit) return value;
  const slice = value.slice(0, limit - 1);
  const boundary = slice.lastIndexOf(' ');
  return `${slice.slice(0, boundary > limit * 0.6 ? boundary : slice.length).trim()}…`;
}

function titleFor(id: string, content: string, hasMedia: boolean): string {
  const firstLine = content.split('\n').find((line) => line.trim())?.trim();
  if (firstLine) return truncateAtWord(firstLine, 120);
  return hasMedia ? `Медиа-публикация ${id}` : `Публикация ${id}`;
}

function previewFor(content: string, hasMedia: boolean): string {
  const compact = content.replace(/\s+/g, ' ').trim();
  if (compact) return truncateAtWord(compact, 220);
  return hasMedia
    ? 'Медиа-публикация. Оригинал доступен в Telegram.'
    : 'Публикация Box News.';
}

function isoFromUnix(value: unknown, fallback?: unknown): string {
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds > 0) {
    return new Date(seconds * 1000).toISOString();
  }
  if (typeof fallback === 'string' && !Number.isNaN(Date.parse(fallback))) {
    return new Date(fallback).toISOString();
  }
  throw new TypeError('Telegram record has no valid timestamp');
}

function referencesFromEntities(value: unknown): BoxNewsReference[] {
  if (!Array.isArray(value)) return [];
  const references = new Map<string, BoxNewsReference>();
  for (const entityValue of value) {
    const entity = asRecord(entityValue);
    const text = typeof entity.text === 'string' ? entity.text.trim() : '';
    const href = typeof entity.href === 'string' ? entity.href : text;
    if (!text || !isHttpUrl(href)) continue;
    references.set(href, { label: truncateAtWord(text, 90), url: href });
  }
  return [...references.values()];
}

function mediaTypeFor(message: UnknownRecord): 'photo' | 'video' | 'file' | null {
  if (typeof message.photo === 'string') return 'photo';
  const mediaType = typeof message.media_type === 'string' ? message.media_type : '';
  const mimeType = typeof message.mime_type === 'string' ? message.mime_type : '';
  if (mediaType === 'video_file' || mediaType === 'animation' || mimeType.startsWith('video/')) {
    return 'video';
  }
  if (typeof message.file === 'string') return 'file';
  if (message.poll || message.rich_message) return 'file';
  return null;
}

function safePhotoSource(exportDirectory: string, relativePhoto: string): string {
  const root = path.resolve(exportDirectory);
  const source = path.resolve(root, relativePhoto);
  if (!source.startsWith(`${root}${path.sep}`)) {
    throw new TypeError('Telegram photo path leaves the export directory');
  }
  return source;
}

export async function normalizeDesktopExport(
  exportValue: unknown,
  exportDirectory: string,
  coverDirectory: string,
): Promise<{ posts: BoxNewsPost[]; report: Omit<ImportReport, 'mergedIds' | 'postsWritten'> }> {
  const root = asRecord(exportValue);
  if (root.type !== 'public_channel' || !Array.isArray(root.messages)) {
    throw new TypeError('Expected a Telegram public_channel export');
  }

  await mkdir(coverDirectory, { recursive: true });
  const posts: BoxNewsPost[] = [];
  const coversCopied: string[] = [];
  let serviceRecordsIgnored = 0;

  for (const rawMessage of root.messages) {
    const message = asRecord(rawMessage);
    if (message.type !== 'message') {
      serviceRecordsIgnored += 1;
      continue;
    }
    const rawId = message.id;
    const id = typeof rawId === 'string' || typeof rawId === 'number' ? String(rawId) : '';
    if (!/^\d+$/.test(id)) throw new TypeError('Telegram message has an invalid id');
    const telegramUrl = `https://t.me/yumind_reborn/${id}`;
    const content = normalizedText(message.text);
    const mediaType = mediaTypeFor(message);
    const photo = typeof message.photo === 'string' ? message.photo : null;
    let cover: BoxNewsPost['cover'];

    if (photo) {
      const extension = path.extname(photo).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
        throw new TypeError(`Box News ${id} has an unsupported photo extension`);
      }
      const fileName = `${id}${extension === '.jpeg' ? '.jpg' : extension}`;
      await copyFile(
        safePhotoSource(exportDirectory, photo),
        path.join(coverDirectory, fileName),
      );
      coversCopied.push(id);
      cover = {
        src: `/media/box-news/${fileName}`,
        alt: `Обложка публикации Box News ${id}`,
      };
    }

    posts.push({
      schemaVersion: 1,
      id,
      title: titleFor(id, content, Boolean(mediaType)),
      preview: previewFor(content, Boolean(mediaType)),
      content,
      publishedAt: isoFromUnix(message.date_unixtime, message.date),
      ...(message.edited_unixtime || message.edited
        ? { editedAt: isoFromUnix(message.edited_unixtime, message.edited) }
        : {}),
      telegramUrl,
      references: referencesFromEntities(message.text_entities),
      ...(cover ? { cover } : {}),
      media: mediaType ? [{ type: mediaType, telegramUrl }] : [],
      status: 'published',
    });
  }

  const validated = validateBoxNewsCollection(posts);
  return {
    posts: validated,
    report: {
      schemaVersion: 1,
      sourceMessages: validated.length,
      serviceRecordsIgnored,
      importedIds: validated.map(({ id }) => id),
      coversCopied,
    },
  };
}

export function normalizeLegacyPost(value: unknown): BoxNewsPost {
  const legacy = asRecord(value);
  const rawId = legacy.id;
  const id = typeof rawId === 'string' || typeof rawId === 'number' ? String(rawId) : '';
  if (!/^\d+$/.test(id)) throw new TypeError('Legacy post has an invalid id');
  const telegramUrl = `https://t.me/yumind_reborn/${id}`;
  const content = normalizedText(legacy.content);
  const mediaTypeValue = typeof legacy.mediaType === 'string' ? legacy.mediaType : '';
  const mediaType: 'photo' | 'video' | 'file' | null = mediaTypeValue.includes('photo')
    ? 'photo'
    : mediaTypeValue.includes('video') || mediaTypeValue.includes('animation')
      ? 'video'
      : legacy.hasMedia
        ? 'file'
        : null;
  const references = Array.isArray(legacy.references)
    ? legacy.references.flatMap((value): BoxNewsReference[] => {
        const reference = asRecord(value);
        const url = typeof reference.url === 'string' ? reference.url : '';
        const label = typeof reference.label === 'string' ? reference.label : url;
        return label.trim() && isHttpUrl(url) ? [{ label, url }] : [];
      })
    : [];

  return {
    schemaVersion: 1,
    id,
    title:
      typeof legacy.title === 'string' && legacy.title.trim()
        ? truncateAtWord(legacy.title.trim(), 120)
        : titleFor(id, content, Boolean(mediaType)),
    preview:
      typeof legacy.preview === 'string' && legacy.preview.trim()
        ? truncateAtWord(legacy.preview.replace(/\s+/g, ' ').trim(), 220)
        : previewFor(content, Boolean(mediaType)),
    content,
    publishedAt: isoFromUnix(undefined, legacy.date),
    telegramUrl,
    references,
    media: mediaType ? [{ type: mediaType, telegramUrl }] : [],
    status: 'published',
  };
}

export function mergeBoxNewsPosts(
  existing: readonly BoxNewsPost[],
  incoming: readonly BoxNewsPost[],
): BoxNewsPost[] {
  const merged = new Map(existing.map((post) => [post.id, post]));
  for (const post of incoming) {
    const current = merged.get(post.id);
    if (!current) {
      merged.set(post.id, post);
      continue;
    }
    const currentTime = Date.parse(current.editedAt ?? current.publishedAt);
    const incomingTime = Date.parse(post.editedAt ?? post.publishedAt);
    if (incomingTime < currentTime) continue;
    merged.set(post.id, {
      ...current,
      ...post,
      content: post.content || current.content,
      preview: post.preview || current.preview,
      cover: post.cover ?? current.cover,
      media: post.media.length ? post.media : current.media,
    });
  }
  return validateBoxNewsCollection(
    [...merged.values()].sort((a, b) => Number(a.id) - Number(b.id)),
  );
}
