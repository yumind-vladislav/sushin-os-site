import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BoxNewsAnalyticsSignal } from '@/components/analytics/route-signals';
import { LocalizedCopy } from '@/components/sushin-os/service-state';
import { notFound } from 'next/navigation';
import {
  boxNewsPosts,
  getBoxNewsNeighbors,
  getBoxNewsPost,
} from '@/lib/box-news';
import {
  boxNewsCanonical,
  buildBoxNewsMetadata,
} from '@/lib/box-news-metadata';
import { absoluteUrl } from '@/lib/site';

export const dynamicParams = false;

const moscowDateFormatters = {
  ru: new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Moscow',
  }),
  en: new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Moscow',
  }),
};

export function generateStaticParams() {
  return boxNewsPosts.map(({ id }) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = getBoxNewsPost(id);
  return post ? buildBoxNewsMetadata(post) : {};
}

export default async function BoxNewsArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = getBoxNewsPost(id);
  if (!post) notFound();
  const { newer, older } = getBoxNewsNeighbors(post.id);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.preview,
    datePublished: post.publishedAt,
    ...(post.editedAt ? { dateModified: post.editedAt } : {}),
    mainEntityOfPage: boxNewsCanonical(post.id),
    author: {
      '@type': 'Person',
      name: 'Владислав Сушин',
      url: absoluteUrl('/'),
    },
    ...(post.cover ? { image: [absoluteUrl(post.cover.src)] } : {}),
  };

  return (
    <main className="box-news-route" lang="ru">
      <BoxNewsAnalyticsSignal articleId={post.id} />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replaceAll('<', '\\u003c'),
        }}
        type="application/ld+json"
      />
      <nav className="box-news-route-nav">
        <Link href="/">← Sushin OS</Link>
        <Link href="/rss.xml" prefetch={false}>
          RSS
        </Link>
      </nav>

      <article className="box-news-article">
        <header>
          <div className="box-news-article-meta">
            <span>
              BOX NEWS · #{post.id} ·{' '}
              <LocalizedCopy
                en="CONTENT IN RUSSIAN"
                ru="МАТЕРИАЛ НА РУССКОМ"
              />
            </span>
            <time dateTime={post.publishedAt}>
              <LocalizedCopy
                en={`${moscowDateFormatters.en.format(new Date(post.publishedAt))} MSK`}
                ru={`${moscowDateFormatters.ru.format(new Date(post.publishedAt))} МСК`}
              />
            </time>
          </div>
          <h1>{post.title}</h1>
          <p>{post.preview}</p>
        </header>

        {post.cover && (
          <figure>
            <Image
              alt={post.cover.alt}
              height={post.cover.height ?? 900}
              priority
              sizes="(max-width: 900px) 100vw, 900px"
              src={post.cover.src}
              width={post.cover.width ?? 1200}
            />
          </figure>
        )}

        <div className="box-news-article-body" lang="ru">
          {post.content || post.preview}
        </div>

        {post.media.some(({ type }) => type !== 'photo') && (
          <aside className="box-news-media-note">
            <LocalizedCopy
              en="This post contains media. Open videos and files in the original Telegram post."
              ru="Эта публикация содержит медиа. Видео и файлы открываются в оригинале Telegram."
            />
          </aside>
        )}

        {post.references.length > 0 && (
          <section className="box-news-references">
            <h2>
              <LocalizedCopy
                en="Links from the post"
                ru="Ссылки из публикации"
              />
            </h2>
            <ul>
              {post.references.map((reference) => (
                <li key={reference.url}>
                  <a href={reference.url} rel="noreferrer" target="_blank">
                    {reference.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="box-news-article-footer">
          <div>
            <a href={post.telegramUrl} rel="noreferrer" target="_blank">
              <LocalizedCopy
                en="Open the original on Telegram"
                ru="Открыть оригинал в Telegram"
              />{' '}
              <span aria-hidden="true">↗</span>
            </a>
            {post.editedAt && (
              <small>
                <LocalizedCopy
                  en={`Updated ${moscowDateFormatters.en.format(new Date(post.editedAt))} MSK`}
                  ru={`Обновлено ${moscowDateFormatters.ru.format(new Date(post.editedAt))} МСК`}
                />
              </small>
            )}
          </div>
          <nav aria-labelledby="box-news-neighbors-label">
            <span className="sr-only" id="box-news-neighbors-label">
              <LocalizedCopy en="Adjacent posts" ru="Соседние публикации" />
            </span>
            {newer ? (
              <Link href={`/box-news/${newer.id}/`}>
                <LocalizedCopy
                  en={`← Newer: #${newer.id}`}
                  ru={`← Новее: #${newer.id}`}
                />
              </Link>
            ) : (
              <span />
            )}
            {older && (
              <Link href={`/box-news/${older.id}/`}>
                <LocalizedCopy
                  en={`Older: #${older.id} →`}
                  ru={`Старше: #${older.id} →`}
                />
              </Link>
            )}
          </nav>
        </footer>
      </article>
    </main>
  );
}
