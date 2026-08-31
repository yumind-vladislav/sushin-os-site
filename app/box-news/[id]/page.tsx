import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
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
  const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Moscow',
  });
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
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replaceAll('<', '\\u003c'),
        }}
        type="application/ld+json"
      />
      <nav className="box-news-route-nav">
        <Link href="/">← Sushin OS</Link>
        <Link href="/rss.xml">RSS</Link>
      </nav>

      <article className="box-news-article">
        <header>
          <div className="box-news-article-meta">
            <span>BOX NEWS · #{post.id}</span>
            <time dateTime={post.publishedAt}>
              {dateFormatter.format(new Date(post.publishedAt))} МСК
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

        <div className="box-news-article-body">
          {post.content || post.preview}
        </div>

        {post.media.some(({ type }) => type !== 'photo') && (
          <aside className="box-news-media-note">
            Эта публикация содержит медиа. Видео и файлы открываются в оригинале
            Telegram.
          </aside>
        )}

        {post.references.length > 0 && (
          <section className="box-news-references">
            <h2>Ссылки из публикации</h2>
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
              Открыть оригинал в Telegram ↗
            </a>
            {post.editedAt && (
              <small>
                Обновлено {dateFormatter.format(new Date(post.editedAt))} МСК
              </small>
            )}
          </div>
          <nav aria-label="Соседние публикации">
            {newer ? (
              <Link href={`/box-news/${newer.id}/`}>← Новее: #{newer.id}</Link>
            ) : (
              <span />
            )}
            {older && (
              <Link href={`/box-news/${older.id}/`}>Старше: #{older.id} →</Link>
            )}
          </nav>
        </footer>
      </article>
    </main>
  );
}
