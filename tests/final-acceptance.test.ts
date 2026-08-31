import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProjectsPanel } from '../components/sushin-os/projects-panel';
import {
  LocalizedCopy,
  ServiceState,
} from '../components/sushin-os/service-state';
import { localDevelopmentSiteUrl, resolveSiteUrl } from '../lib/site';
import {
  createVisitorClockFormatter,
  fallbackTimeZone,
  resolveVisitorTimeZone,
} from '../lib/time-zone';

async function source(relativePath: string): Promise<string> {
  return readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');
}

void describe('final acceptance blockers', () => {
  void it('uses an explicit local origin and accepts only configured HTTP(S) origins', () => {
    assert.equal(localDevelopmentSiteUrl, 'http://localhost:3000');
    assert.equal(resolveSiteUrl(), localDevelopmentSiteUrl);
    assert.equal(
      resolveSiteUrl('https://portfolio.example/'),
      'https://portfolio.example',
    );
    assert.throws(() => resolveSiteUrl('https://portfolio.example/path'));
    assert.throws(() => resolveSiteUrl('file:///tmp/site'));
  });

  void it('renders browser/manual-locale copies for shared service states', () => {
    const html = renderToStaticMarkup(
      createElement(ServiceState, {
        title: createElement(LocalizedCopy, { ru: 'Ошибка', en: 'Error' }),
        message: createElement(LocalizedCopy, {
          ru: 'Повторите',
          en: 'Try again',
        }),
      }),
    );
    assert.match(html, /data-service-locale="ru"/);
    assert.match(html, /data-service-locale="en"/);
    assert.match(html, /Ошибка/);
    assert.match(html, /Try again/);
  });

  void it('uses Europe/Moscow in both clock formatters when browser time zone is unavailable', () => {
    assert.equal(resolveVisitorTimeZone(), fallbackTimeZone);
    const clock = createVisitorClockFormatter('en');
    assert.equal(clock.timeZone, 'Europe/Moscow');
    assert.equal(clock.zoneLabel, 'Moscow');
    assert.equal(
      clock.format(new Date('2026-01-01T00:00:00.000Z')).time,
      '03:00',
    );
    assert.match(
      clock.format(new Date('2026-01-01T22:00:00.000Z')).date,
      /02 Jan/,
    );
  });

  void it('provides an accessible user interaction for every project card', () => {
    const html = renderToStaticMarkup(
      createElement(ProjectsPanel, { locale: 'en' }),
    );
    assert.equal(
      (html.match(/aria-controls="project-details-/g) ?? []).length,
      5,
    );
    assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, 5);
    assert.equal((html.match(/class="project-card"/g) ?? []).length, 5);
  });

  void it('emits box_news_open only from the article route signal', async () => {
    const [panel, signal, article] = await Promise.all([
      source('components/sushin-os/box-news-panel.tsx'),
      source('components/analytics/route-signals.tsx'),
      source('app/box-news/[id]/page.tsx'),
    ]);
    assert.doesNotMatch(panel, /box_news_open/);
    assert.equal((signal.match(/box_news_open/g) ?? []).length, 1);
    assert.match(
      signal,
      /href="\/cv\/vladislav-sushin-project-manager-2026\.pdf"[\s\S]*?prefetch=\{false\}/,
    );
    assert.match(
      article,
      /href="\/rss\.xml" prefetch=\{false\}/,
    );
  });

  void it('keeps Box News content Russian and article service chrome bilingual', async () => {
    const [article, panel, i18n] = await Promise.all([
      source('app/box-news/[id]/page.tsx'),
      source('components/sushin-os/box-news-panel.tsx'),
      source('content/i18n.ts'),
    ]);
    assert.match(panel, /labels\.languageNote/);
    assert.match(i18n, /Box News article content is available in Russian/);
    assert.match(
      article,
      /className="box-news-article-body" lang="ru"/,
    );
    assert.match(article, /CONTENT IN RUSSIAN/);
    assert.match(article, /Links from the post/);
    assert.match(article, /Open the original on Telegram/);
    assert.match(article, /Adjacent posts/);
    assert.match(article, /Newer:/);
    assert.match(article, /Older:/);
    assert.match(article, /moscowDateFormatters\.en/);
  });

  void it('keeps framework states localized and privacy links official', async () => {
    const [error, loading, notFound, privacy, analyticsDocs, unit] =
      await Promise.all([
        source('app/error.tsx'),
        source('app/loading.tsx'),
        source('app/not-found.tsx'),
        source('app/privacy/page.tsx'),
        source('docs/ANALYTICS_AND_LEGAL.md'),
        source('services/box-news-webhook/box-news-webhook.service'),
      ]);
    for (const routeState of [error, loading, notFound]) {
      assert.match(routeState, /LocalizedCopy/);
    }
    assert.match(
      privacy,
      /yandex\.com\/support\/metrica\/en\/code\/data-collected/,
    );
    assert.match(
      privacy,
      /https:\/\/yandex\.com\/legal\/metrica_termsofuse\/en\//,
    );
    assert.match(
      privacy,
      /developer\.spotify\.com\/documentation\/embeds\/terms/,
    );
    assert.match(privacy, /spotify\.com\/legal\/privacy-policy/);
    assert.match(privacy, /spotify\.com\/legal\/cookies-policy/);
    assert.match(analyticsDocs, /Do not set `NEXT_PUBLIC_YANDEX_METRICA_ID`/);
    assert.match(unit, /ReadWritePaths=.*\/opt\/sushin-os-site\/\.git(?:\s|$)/);
  });
});
