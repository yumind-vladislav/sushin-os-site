import type { Metadata } from 'next';
import type { BoxNewsPost } from './box-news-schema';
import { absoluteUrl } from './site';

export function boxNewsCanonical(id: string): string {
  return absoluteUrl(`/box-news/${id}/`);
}

export function buildBoxNewsMetadata(post: BoxNewsPost): Metadata {
  const canonical = boxNewsCanonical(post.id);
  const images = post.cover ? [absoluteUrl(post.cover.src)] : [];
  return {
    title: `${post.title} — Box News`,
    description: post.preview,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: post.title,
      description: post.preview,
      publishedTime: post.publishedAt,
      ...(post.editedAt ? { modifiedTime: post.editedAt } : {}),
      images,
    },
    twitter: {
      card: images.length ? 'summary_large_image' : 'summary',
      title: post.title,
      description: post.preview,
      images,
    },
  };
}
