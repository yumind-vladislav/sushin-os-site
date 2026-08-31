import type { MetadataRoute } from 'next';
import { boxNewsPosts } from '@/lib/box-news';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl('/'),
      lastModified: new Date('2026-08-31T00:00:00Z'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/cv/'),
      lastModified: new Date('2026-08-31T00:00:00Z'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...boxNewsPosts.map((post) => ({
      url: absoluteUrl(`/box-news/${post.id}/`),
      lastModified: new Date(post.editedAt ?? post.publishedAt),
      changeFrequency: 'never' as const,
      priority: 0.65,
    })),
  ];
}
