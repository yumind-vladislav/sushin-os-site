'use client';

import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { dictionaries, type Locale } from '@/content/i18n';
import type { BoxNewsSummary } from '@/lib/box-news';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { ServiceState } from './service-state';

const pageSize = 12;

export function BoxNewsPanel({
  locale,
  posts,
}: {
  locale: Locale;
  posts: readonly BoxNewsSummary[];
}) {
  const [page, setPage] = useState(1);
  const labels = dictionaries[locale].boxNews;
  const pageCount = Math.max(1, Math.ceil(posts.length / pageSize));
  const visiblePosts = posts.slice((page - 1) * pageSize, page * pageSize);
  const dateFormatter = new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  });

  if (posts.length === 0) {
    return (
      <ServiceState
        compact
        eyebrow="BOX NEWS"
        message={dictionaries[locale].states.empty}
        title={labels.title}
      />
    );
  }

  return (
    <div className="box-news-panel">
      <header>
        <small>{labels.eyebrow}</small>
        <h2>{labels.title}</h2>
        <p>{labels.copy}</p>
      </header>

      <div className="box-news-list">
        {visiblePosts.map((post) => (
          <article className="box-news-card" key={post.id}>
            <Link
              aria-label={`${labels.openArticle}: ${post.title}`}
              href={`/box-news/${post.id}/`}
              onClick={() =>
                trackAnalyticsEvent('box_news_open', { article_id: post.id })
              }
            >
              <div className="box-news-cover">
                {post.cover ? (
                  <Image
                    alt={post.cover.alt}
                    fill
                    sizes="(max-width: 700px) 40vw, 220px"
                    src={post.cover.src}
                  />
                ) : (
                  <span>{post.media.length ? labels.mediaOnly : 'BOX NEWS'}</span>
                )}
              </div>
              <div className="box-news-card-copy">
                <div>
                  <time dateTime={post.publishedAt}>
                    {dateFormatter.format(new Date(post.publishedAt))}
                  </time>
                  <span>#{post.id}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.preview}</p>
              </div>
            </Link>
            <a href={post.telegramUrl} rel="noreferrer" target="_blank">
              {labels.source}
              <ExternalLink aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>

      <footer className="box-news-pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          type="button"
        >
          {labels.previous}
        </button>
        <span>
          {labels.page} {page} / {pageCount}
        </span>
        <button
          disabled={page === pageCount}
          onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
          type="button"
        >
          {labels.next}
        </button>
      </footer>
    </div>
  );
}
