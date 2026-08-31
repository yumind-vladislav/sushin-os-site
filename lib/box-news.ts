import hiddenData from '@/content/box-news/hidden.json';
import postsData from '@/content/box-news/posts.json';
import {
  type BoxNewsPost,
  validateBoxNewsCollection,
} from './box-news-schema';

export const boxNewsPageSize = 12;

export function validateHiddenIds(value: unknown, posts: readonly BoxNewsPost[]): string[] {
  if (!Array.isArray(value) || !value.every((id) => /^\d+$/.test(String(id)))) {
    throw new TypeError('Box News hidden list must contain numeric ids');
  }
  const ids = [...new Set(value.map(String))];
  const knownIds = new Set(posts.map(({ id }) => id));
  for (const id of ids) {
    if (!knownIds.has(id)) throw new TypeError(`Hidden Box News id ${id} does not exist`);
  }
  return ids;
}

export function selectPublicBoxNews(
  posts: readonly BoxNewsPost[],
  hiddenIds: readonly string[],
): BoxNewsPost[] {
  const hidden = new Set(hiddenIds);
  return posts
    .filter((post) => post.status === 'published' && !hidden.has(post.id))
    .toSorted((a, b) => Number(b.id) - Number(a.id));
}

export const allBoxNewsPosts = validateBoxNewsCollection(postsData);
export const hiddenBoxNewsIds = validateHiddenIds(hiddenData, allBoxNewsPosts);
export const boxNewsPosts = selectPublicBoxNews(allBoxNewsPosts, hiddenBoxNewsIds);

export type BoxNewsSummary = Pick<
  BoxNewsPost,
  'id' | 'title' | 'preview' | 'publishedAt' | 'telegramUrl' | 'cover' | 'media'
>;

export function getBoxNewsSummaries(): BoxNewsSummary[] {
  return boxNewsPosts.map(
    ({ id, title, preview, publishedAt, telegramUrl, cover, media }) => ({
      id,
      title,
      preview,
      publishedAt,
      telegramUrl,
      ...(cover ? { cover } : {}),
      media,
    }),
  );
}

export function getBoxNewsPost(id: string): BoxNewsPost | undefined {
  return boxNewsPosts.find((post) => post.id === id);
}

export function getBoxNewsNeighbors(id: string): {
  newer?: BoxNewsPost;
  older?: BoxNewsPost;
} {
  const index = boxNewsPosts.findIndex((post) => post.id === id);
  if (index < 0) return {};
  return {
    ...(index > 0 ? { newer: boxNewsPosts[index - 1] } : {}),
    ...(index < boxNewsPosts.length - 1
      ? { older: boxNewsPosts[index + 1] }
      : {}),
  };
}

export function paginateBoxNews<T>(items: readonly T[], page: number, size = boxNewsPageSize) {
  const pageCount = Math.max(1, Math.ceil(items.length / size));
  const safePage = Math.min(Math.max(Math.trunc(page), 1), pageCount);
  return {
    items: items.slice((safePage - 1) * size, safePage * size),
    page: safePage,
    pageCount,
  };
}
