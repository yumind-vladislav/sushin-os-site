'use client';

import { Search } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { appDefinitions, appIds, type AppId } from '@/content/apps';
import type { Locale } from '@/content/i18n';
import type { BoxNewsSummary } from '@/lib/box-news';
import { SystemIcon } from './system-icon';

type Result =
  | { kind: 'app'; id: AppId; label: string; hint: string }
  | { kind: 'news'; id: string; label: string; hint: string }
  | { kind: 'ask'; label: string; hint: string };

const labels = {
  ru: {
    placeholder: 'Поиск в Sushin OS',
    top: 'Лучшие результаты',
    apps: 'Приложения',
    news: 'Box News',
    ask: (query: string) => `Спросить Ровера «${query}»`,
    askHint: 'Ассистент',
    empty: 'Ничего не нашлось',
  },
  en: {
    placeholder: 'Search Sushin OS',
    top: 'Top hits',
    apps: 'Applications',
    news: 'Box News',
    ask: (query: string) => `Ask Rover “${query}”`,
    askHint: 'Assistant',
    empty: 'No results',
  },
} as const;

const suggested: readonly AppId[] = ['vladislav', 'cv', 'projects', 'news', 'fact'];

const normalize = (value: string) => value.toLowerCase().replaceAll('ё', 'е').trim();

export function Spotlight({
  locale,
  posts,
  onClose,
  onOpenApp,
  onAsk,
}: {
  locale: Locale;
  posts: readonly BoxNewsSummary[];
  onClose: () => void;
  onOpenApp: (id: AppId) => void;
  onAsk: (question: string) => void;
}) {
  const t = labels[locale];
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const groups = useMemo(() => {
    const q = normalize(query);
    if (!q) {
      return [
        {
          title: t.top,
          items: suggested.map<Result>((id) => ({
            kind: 'app',
            id,
            label: appDefinitions[id].title[locale],
            hint: appDefinitions[id].summary[locale],
          })),
        },
      ];
    }
    const apps = appIds
      .filter((id) => {
        const app = appDefinitions[id];
        return [app.title.ru, app.title.en, ...app.keywords].some((word) =>
          normalize(word).includes(q),
        );
      })
      .slice(0, 6)
      .map<Result>((id) => ({
        kind: 'app',
        id,
        label: appDefinitions[id].title[locale],
        hint: appDefinitions[id].summary[locale],
      }));
    const news = posts
      .filter((post) => normalize(`${post.title} ${post.preview}`).includes(q))
      .slice(0, 4)
      .map<Result>((post) => ({
        kind: 'news',
        id: post.id,
        label: post.title,
        hint: new Date(post.publishedAt).toLocaleDateString(locale),
      }));
    const ask: Result = { kind: 'ask', label: t.ask(query.trim()), hint: t.askHint };
    return [
      ...(apps.length ? [{ title: t.apps, items: apps }] : []),
      ...(news.length ? [{ title: t.news, items: news }] : []),
      { title: '', items: [ask] },
    ];
  }, [locale, posts, query, t]);

  const flat = groups.flatMap((group) => group.items);
  const active = Math.min(cursor, flat.length - 1);

  const choose = (result: Result | undefined) => {
    if (!result) return;
    if (result.kind === 'app') onOpenApp(result.id);
    if (result.kind === 'news') window.location.assign(`/box-news/${result.id}/`);
    if (result.kind === 'ask') onAsk(query.trim());
    onClose();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor((current) => Math.min(current + 1, flat.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(flat[active]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  let position = -1;

  return (
    <div className="spotlight-layer" onPointerDown={onClose}>
      <dialog
        aria-label={t.placeholder}
        className="spotlight"
        onPointerDown={(event) => event.stopPropagation()}
        open
      >
        <label className="spotlight-input">
          <Search aria-hidden="true" size={18} />
          <input
            aria-describedby="spotlight-results"
            onChange={(event) => {
              setQuery(event.target.value);
              setCursor(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={t.placeholder}
            ref={inputRef}
            value={query}
          />
        </label>
        <div className="spotlight-results" id="spotlight-results">
          {groups.map((group) => (
            <div className="spotlight-group" key={group.title || 'ask'}>
              {group.title && <small>{group.title}</small>}
              {group.items.map((item) => {
                position += 1;
                const index = position;
                return (
                  <button
                    aria-current={index === active}
                    className={`spotlight-item ${index === active ? 'is-active' : ''} is-${item.kind}`}
                    id={`spotlight-${index}`}
                    key={`${item.kind}-${'id' in item ? item.id : 'ask'}`}
                    onClick={() => choose(item)}
                    onPointerEnter={() => setCursor(index)}
                    tabIndex={-1}
                    type="button"
                  >
                    {item.kind === 'app' && (
                      <SystemIcon kind={appDefinitions[item.id].icon} size={28} />
                    )}
                    {item.kind === 'news' && <SystemIcon kind="news" size={28} />}
                    {item.kind === 'ask' && <SystemIcon kind="assistant" size={28} />}
                    <span>
                      <strong>{item.label}</strong>
                      <em>{item.hint}</em>
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </dialog>
    </div>
  );
}
