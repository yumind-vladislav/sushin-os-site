'use client';

import { Pause, Play, SkipBack, SkipForward, Square } from 'lucide-react';
import type { Locale } from '@/content/i18n';
import { musicTracks } from '@/content/media-library';
import { formatTime, useAudioPlayer } from '@/hooks/use-audio-player';
import { useAppCommand } from '@/lib/app-commands';

const labels = {
  ru: { playlist: 'Плейлист', volume: 'Громкость', seek: 'Позиция', stop: 'Стоп', failed: 'Ошибка воспроизведения' },
  en: { playlist: 'Playlist', volume: 'Volume', seek: 'Position', stop: 'Stop', failed: 'Playback error' },
} as const;

export function WinampApp({ locale }: { locale: Locale }) {
  const t = labels[locale];
  const player = useAudioPlayer('winamp', musicTracks);

  useAppCommand('winamp', (command) => {
    if (command === 'toggle') void player.toggle();
    if (command === 'next') void player.next();
    if (command === 'prev') player.prev();
  });

  const title = player.track ? `${player.index + 1}. ${player.track.artist} — ${player.track.title}` : '';

  return (
    <div className="winamp-app">
      <div className="winamp-main">
        <div className="winamp-display">
          <output className="winamp-time">{formatTime(player.time)}</output>
          <div aria-hidden="true" className={`winamp-bars ${player.playing ? 'is-playing' : ''}`}>
            {Array.from({ length: 14 }, (_, index) => (
              <i key={index} style={{ animationDelay: `${(index * 73) % 400}ms` }} />
            ))}
          </div>
          <div className="winamp-marquee">
            <span className={player.playing ? 'is-scrolling' : ''}>
              {player.failed ? t.failed : `${title} (${formatTime(player.duration)})`}
            </span>
          </div>
          <small className="winamp-meta">22 kHz · mono</small>
        </div>
        <input
          aria-label={t.seek}
          className="winamp-seek"
          max={player.duration || 1}
          min={0}
          onChange={(event) => player.seek(Number(event.target.value))}
          step={0.1}
          type="range"
          value={player.time}
        />
        <div className="winamp-controls">
          <button aria-label="Previous" onClick={player.prev} type="button">
            <SkipBack aria-hidden="true" size={12} />
          </button>
          <button aria-label="Play / pause" onClick={() => void player.toggle()} type="button">
            {player.playing ? <Pause aria-hidden="true" size={12} /> : <Play aria-hidden="true" size={12} />}
          </button>
          <button aria-label={t.stop} onClick={player.stop} type="button">
            <Square aria-hidden="true" size={11} />
          </button>
          <button aria-label="Next" onClick={() => void player.next()} type="button">
            <SkipForward aria-hidden="true" size={12} />
          </button>
          <input
            aria-label={t.volume}
            className="winamp-volume"
            max={1}
            min={0}
            onChange={(event) => player.setVolume(Number(event.target.value))}
            step={0.05}
            type="range"
            value={player.volume}
          />
        </div>
      </div>
      <ol aria-label={t.playlist} className="winamp-playlist">
        {musicTracks.map((track, index) => (
          <li key={track.id}>
            <button
              aria-current={index === player.index}
              onDoubleClick={() => void player.play(index)}
              onKeyDown={(event) => event.key === 'Enter' && void player.play(index)}
              type="button"
            >
              <span>
                {index + 1}. {track.artist} — {track.title}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
