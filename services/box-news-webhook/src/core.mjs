import { timingSafeEqual } from 'node:crypto';

export function secureEqual(provided, expected) {
  if (
    typeof provided !== 'string' ||
    typeof expected !== 'string' ||
    !expected
  ) {
    return false;
  }
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  const size = Math.max(left.length, right.length, 1);
  const paddedLeft = Buffer.alloc(size);
  const paddedRight = Buffer.alloc(size);
  left.copy(paddedLeft);
  right.copy(paddedRight);
  return (
    left.length === right.length && timingSafeEqual(paddedLeft, paddedRight)
  );
}

function asRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {};
}

function isoFromSeconds(value) {
  if (!Number.isInteger(value) || value <= 0)
    throw new TypeError('invalid_timestamp');
  return new Date(value * 1000).toISOString();
}

function truncateAtWord(value, limit) {
  if (value.length <= limit) return value;
  const slice = value.slice(0, limit - 1);
  const boundary = slice.lastIndexOf(' ');
  return `${slice.slice(0, boundary > limit * 0.6 ? boundary : slice.length).trim()}…`;
}

function normalizeText(value) {
  return typeof value === 'string'
    ? value
        .replaceAll('\r\n', '\n')
        .replaceAll('\r', '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    : '';
}

function titleFor(id, content, hasMedia) {
  const firstLine = content
    .split('\n')
    .find((line) => line.trim())
    ?.trim();
  if (firstLine) return truncateAtWord(firstLine, 120);
  return hasMedia ? `Медиа-публикация ${id}` : `Публикация ${id}`;
}

function previewFor(content, hasMedia) {
  const compact = content.replace(/\s+/g, ' ').trim();
  if (compact) return truncateAtWord(compact, 220);
  return hasMedia
    ? 'Медиа-публикация. Оригинал доступен в Telegram.'
    : 'Публикация Box News.';
}

function extractReferences(text, entities) {
  if (!Array.isArray(entities)) return [];
  const references = new Map();
  for (const rawEntity of entities) {
    const entity = asRecord(rawEntity);
    const offset = Number(entity.offset);
    const length = Number(entity.length);
    if (!Number.isInteger(offset) || !Number.isInteger(length) || length <= 0)
      continue;
    const label = text.slice(offset, offset + length).trim();
    const url = typeof entity.url === 'string' ? entity.url : label;
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      continue;
    }
    if (!['http:', 'https:'].includes(parsed.protocol) || !label) continue;
    references.set(parsed.toString(), {
      label: truncateAtWord(label, 90),
      url: parsed.toString(),
    });
  }
  return [...references.values()];
}

function selectedPhoto(message) {
  if (!Array.isArray(message.photo) || message.photo.length === 0) return null;
  const valid = message.photo
    .map(asRecord)
    .filter((photo) => typeof photo.file_id === 'string');
  return valid.at(-1) ?? null;
}

function pollContent(value) {
  const question = normalizeText(asRecord(value).question);
  return question ? `ОПРОС TELEGRAM\n${question}` : '';
}

export function normalizeTelegramUpdate(updateValue, expectedChatId) {
  const update = asRecord(updateValue);
  if (!Number.isInteger(update.update_id))
    throw new TypeError('invalid_update_id');
  const edited = Boolean(update.edited_channel_post);
  const message = asRecord(update.edited_channel_post ?? update.channel_post);
  if (!message.message_id) throw new TypeError('unsupported_update');
  const chat = asRecord(message.chat);
  if (String(chat.id ?? '') !== String(expectedChatId))
    throw new TypeError('wrong_chat');
  if (!Number.isInteger(message.message_id))
    throw new TypeError('invalid_message_id');

  const id = String(message.message_id);
  const telegramUrl = `https://t.me/yumind_reborn/${id}`;
  const content =
    normalizeText(message.text ?? message.caption) || pollContent(message.poll);
  const entities = message.text ? message.entities : message.caption_entities;
  const photo = selectedPhoto(message);
  const media = [];
  if (photo) media.push({ type: 'photo', telegramUrl });
  if (message.video || message.animation)
    media.push({ type: 'video', telegramUrl });
  if (message.document) media.push({ type: 'file', telegramUrl });
  const hasMedia = media.length > 0;
  if (!content && !hasMedia) throw new TypeError('unsupported_update');

  return {
    key: `${update.update_id}:${chat.id}:${message.message_id}`,
    updateId: update.update_id,
    chatId: String(chat.id),
    messageId: message.message_id,
    mediaGroupId:
      typeof message.media_group_id === 'string'
        ? message.media_group_id
        : null,
    photo: photo
      ? {
          fileId: photo.file_id,
          width: Number.isInteger(photo.width) ? photo.width : undefined,
          height: Number.isInteger(photo.height) ? photo.height : undefined,
        }
      : null,
    post: {
      schemaVersion: 1,
      id,
      title: titleFor(id, content, hasMedia),
      preview: previewFor(content, hasMedia),
      content,
      publishedAt: isoFromSeconds(message.date),
      ...(edited
        ? { editedAt: isoFromSeconds(message.edit_date ?? message.date) }
        : {}),
      telegramUrl,
      references: extractReferences(content, entities),
      media,
      status: 'published',
    },
  };
}

export function coalesceAlbumEvents(events) {
  if (!Array.isArray(events) || events.length === 0) {
    throw new TypeError('empty_album');
  }
  const sorted = [...events].sort((a, b) => a.messageId - b.messageId);
  const primary = sorted.find(({ post }) => post.content) ?? sorted[0];
  const publishedAt = sorted
    .map(({ post }) => post.publishedAt)
    .toSorted((left, right) => left.localeCompare(right))
    .at(0);
  const editedAt = sorted
    .flatMap(({ post }) => (post.editedAt ? [post.editedAt] : []))
    .toSorted((left, right) => left.localeCompare(right))
    .at(-1);
  const photoEvent = sorted.find(({ photo }) => photo);
  const mediaTypes = new Set(
    sorted.flatMap(({ post }) => post.media.map(({ type }) => type)),
  );
  const telegramUrl = `https://t.me/yumind_reborn/${primary.messageId}`;
  return {
    ...primary,
    photo: photoEvent?.photo ?? null,
    post: {
      ...primary.post,
      id: String(primary.messageId),
      telegramUrl,
      publishedAt,
      ...(editedAt ? { editedAt } : {}),
      media: [...mediaTypes].map((type) => ({ type, telegramUrl })),
    },
    albumKeys: sorted.map(({ key }) => key),
  };
}

export function mergePostRecords(existing, incoming) {
  const current = existing.find((post) => post.id === incoming.id);
  if (current) {
    const currentTime = Date.parse(current.editedAt ?? current.publishedAt);
    const incomingTime = Date.parse(incoming.editedAt ?? incoming.publishedAt);
    if (incomingTime < currentTime) return [...existing];
  }
  const merged = existing.filter((post) => post.id !== incoming.id);
  merged.push({
    ...current,
    ...incoming,
    cover: incoming.cover ?? current?.cover,
  });
  return merged.toSorted((a, b) => Number(a.id) - Number(b.id));
}
