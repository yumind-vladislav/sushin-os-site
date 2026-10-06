'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { Locale } from '@/content/i18n';
import { videoItems } from '@/content/media-library';
import { useAppCommand } from '@/lib/app-commands';

const labels = {
  ru: {
    empty: 'Плейлист пока пуст.',
    emptyHint: 'Видео добавляются в content/media-library.ts по id с YouTube.',
    prev: 'Предыдущее видео',
    next: 'Следующее видео',
    playlist: 'Плейлист',
    frame: 'Видеоплеер YouTube',
    consent: 'Видео загрузится с YouTube после нажатия.',
    load: 'Смотреть',
  },
  en: {
    empty: 'The playlist is empty.',
    emptyHint: 'Videos are added to content/media-library.ts by YouTube id.',
    prev: 'Previous video',
    next: 'Next video',
    playlist: 'Playlist',
    frame: 'YouTube video player',
    consent: 'The video loads from YouTube after you press play.',
    load: 'Watch',
  },
} as const;

export function VideosApp({ locale }: { locale: Locale }) {
  const t = labels[locale];
  const [index, setIndex] = useState(0);
  // Click-to-load, like the Spotify utility: no third-party request before intent.
  const [armed, setArmed] = useState(false);
  const current = videoItems[index];

  const shift = (delta: number) => {
    if (!videoItems.length) return;
    setIndex((value) => (value + delta + videoItems.length) % videoItems.length);
  };

  useAppCommand('videos', (command) => {
    if (command === 'next') shift(1);
    if (command === 'prev') shift(-1);
    if (command === 'toggle') setArmed(true);
  });

  if (!current) {
    return (
      <div className="videos-app is-empty">
        <div className="videos-screen">
          <p>{t.empty}</p>
          <small>{t.emptyHint}</small>
        </div>
      </div>
    );
  }

  return (
    <div className="videos-app">
      <div className="videos-screen">
        {armed ? (
          <iframe
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            key={current.youtubeId}
            src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?autoplay=1&rel=0`}
            title={`${t.frame}: ${current.title}`}
          />
        ) : (
          <button className="videos-poster" onClick={() => setArmed(true)} type="button">
            <strong>{current.title}</strong>
            <span>{t.load} ▶</span>
            <small>{t.consent}</small>
          </button>
        )}
      </div>
      <div className="videos-controls">
        <button aria-label={t.prev} className="app-tool" onClick={() => shift(-1)} type="button">
          <ChevronLeft aria-hidden="true" size={14} />
        </button>
        <strong>{current.title}</strong>
        <button aria-label={t.next} className="app-tool" onClick={() => shift(1)} type="button">
          <ChevronRight aria-hidden="true" size={14} />
        </button>
      </div>
      <ol aria-label={t.playlist} className="videos-playlist">
        {videoItems.map((item, position) => (
          <li key={item.id}>
            <button aria-current={position === index} onClick={() => setIndex(position)} type="button">
              {item.title}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
