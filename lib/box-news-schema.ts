export type BoxNewsReference = { label: string; url: string };

export type BoxNewsPost = {
  schemaVersion: 1;
  id: string;
  title: string;
  preview: string;
  content: string;
  publishedAt: string;
  editedAt?: string;
  telegramUrl: string;
  references: BoxNewsReference[];
  cover?: {
    src: string;
    width?: number;
    height?: number;
    alt: string;
  };
  media: Array<{
    type: 'photo' | 'video' | 'file';
    telegramUrl: string;
  }>;
  status: 'published' | 'hidden';
};

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateBoxNewsPost(value: unknown): BoxNewsPost {
  if (!value || typeof value !== 'object') {
    throw new TypeError('Box News record must be an object');
  }
  const post = value as Partial<BoxNewsPost>;
  if (post.schemaVersion !== 1) throw new TypeError('Unsupported Box News schema');
  if (!post.id || !/^\d+$/.test(post.id)) throw new TypeError('Invalid Box News id');
  if (!post.title?.trim()) throw new TypeError(`Box News ${post.id} has no title`);
  if (!post.preview?.trim()) throw new TypeError(`Box News ${post.id} has no preview`);
  if (typeof post.content !== 'string') throw new TypeError(`Box News ${post.id} has invalid content`);
  if (!post.publishedAt || Number.isNaN(Date.parse(post.publishedAt))) {
    throw new TypeError(`Box News ${post.id} has an invalid publishedAt`);
  }
  if (post.editedAt && Number.isNaN(Date.parse(post.editedAt))) {
    throw new TypeError(`Box News ${post.id} has an invalid editedAt`);
  }
  if (post.telegramUrl !== `https://t.me/yumind_reborn/${post.id}`) {
    throw new TypeError(`Box News ${post.id} has an invalid Telegram URL`);
  }
  if (post.status !== 'published' && post.status !== 'hidden') {
    throw new TypeError(`Box News ${post.id} has an invalid status`);
  }
  if (!Array.isArray(post.references) || !post.references.every(
    (reference) =>
      Boolean(reference?.label?.trim()) && isHttpUrl(reference?.url ?? ''),
  )) {
    throw new TypeError(`Box News ${post.id} has invalid references`);
  }
  if (!Array.isArray(post.media) || !post.media.every(
    (media) =>
      ['photo', 'video', 'file'].includes(media?.type ?? '') &&
      media?.telegramUrl === post.telegramUrl,
  )) {
    throw new TypeError(`Box News ${post.id} has invalid media`);
  }
  if (!post.content.trim() && post.media.length === 0) {
    throw new TypeError(`Box News ${post.id} has neither content nor media`);
  }
  if (
    post.cover &&
    (!post.cover.src.startsWith(`/media/box-news/${post.id}.`) ||
      !post.cover.alt.trim())
  ) {
    throw new TypeError(`Box News ${post.id} has an invalid cover`);
  }
  return post as BoxNewsPost;
}

export function validateBoxNewsCollection(value: unknown): BoxNewsPost[] {
  if (!Array.isArray(value)) throw new TypeError('Box News data must be an array');
  const posts = value.map(validateBoxNewsPost);
  const ids = new Set<string>();
  for (const post of posts) {
    if (ids.has(post.id)) throw new TypeError(`Duplicate Box News id ${post.id}`);
    ids.add(post.id);
  }
  return posts;
}
