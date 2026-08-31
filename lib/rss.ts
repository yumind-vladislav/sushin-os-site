import type { BoxNewsPost } from './box-news-schema';
import { absoluteUrl } from './site';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function buildBoxNewsRss(posts: readonly BoxNewsPost[]): string {
  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(absoluteUrl(`/box-news/${post.id}/`))}</link>
      <guid isPermaLink="true">${escapeXml(absoluteUrl(`/box-news/${post.id}/`))}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.preview)}</description>
    </item>`,
    )
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Sushin OS — Box News</title>
    <link>${escapeXml(absoluteUrl('/'))}</link>
    <description>Публикации Telegram-блога YUMIND Reborn в статическом архиве Sushin OS.</description>
    <language>ru</language>
    <lastBuildDate>${new Date(posts[0]?.editedAt ?? posts[0]?.publishedAt ?? 0).toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>
`;
}
