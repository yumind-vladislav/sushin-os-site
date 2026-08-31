import Link from 'next/link';
import type { ReactNode } from 'react';

export function LegalPage({
  eyebrow,
  title,
  summary,
  children,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <main className="legal-route" lang="ru">
      <nav aria-label="Юридические документы" className="legal-route-nav">
        <Link href="/">← Sushin OS</Link>
        <span>
          <Link href="/privacy/">Privacy</Link>
          <Link href="/terms/">Terms</Link>
        </span>
      </nav>
      <article className="legal-document">
        <header>
          <small>{eyebrow}</small>
          <h1>{title}</h1>
          <p>{summary}</p>
          <time dateTime="2026-08-31">Редакция от 31 августа 2026 года</time>
        </header>
        <div>{children}</div>
        <footer>
          Владелец сайта: Владислав Сушин, физическое лицо, Российская Федерация.
          По юридическим и privacy-вопросам:{' '}
          <a href="mailto:vladislav.sushin@icloud.com">
            vladislav.sushin@icloud.com
          </a>
          .
        </footer>
      </article>
    </main>
  );
}
