import { boxNewsPosts } from '@/lib/box-news';
import { buildBoxNewsRss } from '@/lib/rss';

export const dynamic = 'force-static';

export function GET() {
  return new Response(buildBoxNewsRss(boxNewsPosts), {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
