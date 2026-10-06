'use client';

import { FastForward, Pause, Play, Rewind } from 'lucide-react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useRef, useState } from 'react';
import type { Locale } from '@/content/i18n';
import { musicTracks } from '@/content/media-library';
import { formatTime, useAudioPlayer } from '@/hooks/use-audio-player';
import { useAppCommand } from '@/lib/app-commands';

type Screen = 'menu' | 'songs' | 'now';

const labels = {
  ru: {
    menu: 'Меню',
    music: 'Музыка',
    songs: 'Песни',
    now: 'Сейчас играет',
    shuffle: 'Перемешать песни',
    of: 'из',
    loading: 'Загрузка…',
    failed: 'Трек не воспроизводится',
    select: 'Выбрать',
  },
  en: {
    menu: 'Menu',
    music: 'Music',
    songs: 'Songs',
    now: 'Now Playing',
    shuffle: 'Shuffle Songs',
    of: 'of',
    loading: 'Loading…',
    failed: 'This track can’t play',
    select: 'Select',
  },
} as const;

export function IpodApp({ locale }: { locale: Locale }) {
  const t = labels[locale];
  const player = useAudioPlayer('ipod', musicTracks);
  const [screen, setScreen] = useState<Screen>('menu');
  const [cursor, setCursor] = useState(0);
  const wheel = useRef<{ angle: number } | null>(null);

  const menuItems = [t.songs, t.shuffle, t.now];
  const listLength = screen === 'menu' ? menuItems.length : screen === 'songs' ? musicTracks.length : 0;

  const move = (delta: number) => {
    if (screen === 'now') {
      player.setVolume(player.volume + delta * 0.05);
      return;
    }
    setCursor((value) => Math.max(0, Math.min(listLength - 1, value + delta)));
  };

  const select = () => {
    if (screen === 'menu') {
      if (cursor === 0) {
        setScreen('songs');
        setCursor(player.index);
      } else if (cursor === 1) {
        void player.play(Math.floor(Math.random() * musicTracks.length));
        setScreen('now');
      } else setScreen('now');
      return;
    }
    if (screen === 'songs') {
      void player.play(cursor);
      setScreen('now');
      return;
    }
    void player.toggle();
  };

  const back = () => {
    setScreen('menu');
    setCursor(0);
  };

  useAppCommand('ipod', (command) => {
    if (command === 'toggle') void player.toggle();
    if (command === 'next') void player.next();
    if (command === 'prev') player.prev();
  });

  const angleOf = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return Math.atan2(event.clientY - rect.top - rect.height / 2, event.clientX - rect.left - rect.width / 2);
  };

  const onWheelDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    wheel.current = { angle: angleOf(event) };
  };

  const onWheelMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!wheel.current) return;
    const angle = angleOf(event);
    let delta = angle - wheel.current.angle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    // One detent every ~24°, like the clicker on the original wheel.
    if (Math.abs(delta) > 0.42) {
      move(delta > 0 ? 1 : -1);
      wheel.current.angle = angle;
    }
  };

  const progress = player.duration ? (player.time / player.duration) * 100 : 0;

  return (
    <div className="ipod-app">
      <div className="ipod-body">
        <div aria-live="polite" className="ipod-screen">
          <div className="ipod-titlebar">
            <span>{screen === 'menu' ? 'iPod' : screen === 'songs' ? t.songs : t.now}</span>
            <span aria-hidden="true">{player.playing ? '▶' : '❚❚'}</span>
          </div>
          {screen === 'menu' && (
            <ul>
              {menuItems.map((item, index) => (
                <li className={cursor === index ? 'is-active' : ''} key={item}>
                  {item}
                  <span aria-hidden="true">›</span>
                </li>
              ))}
            </ul>
          )}
          {screen === 'songs' && (
            <ul>
              {musicTracks.map((track, index) => (
                <li className={cursor === index ? 'is-active' : ''} key={track.id}>
                  {track.title}
                </li>
              ))}
            </ul>
          )}
          {screen === 'now' && (
            <div className="ipod-now">
              <small>
                {player.index + 1} {t.of} {musicTracks.length}
              </small>
              <strong>{player.track?.title}</strong>
              <span>{player.track?.artist}</span>
              <em>{player.track?.album}</em>
              <div className="ipod-progress">
                <i style={{ width: `${progress}%` }} />
              </div>
              <div className="ipod-times">
                <span>{formatTime(player.time)}</span>
                <span>{player.loading ? t.loading : player.failed ? t.failed : `-${formatTime(player.duration - player.time)}`}</span>
              </div>
            </div>
          )}
        </div>
        <div
          className="ipod-wheel"
          onPointerCancel={() => (wheel.current = null)}
          onPointerDown={onWheelDown}
          onPointerMove={onWheelMove}
          onPointerUp={() => (wheel.current = null)}
          onWheel={(event) => move(event.deltaY > 0 ? 1 : -1)}
        >
          <button className="ipod-wheel-menu" onClick={back} type="button">
            {t.menu.toUpperCase()}
          </button>
          <button aria-label="Previous" className="ipod-wheel-prev" onClick={player.prev} type="button">
            <Rewind aria-hidden="true" size={13} />
          </button>
          <button aria-label="Next" className="ipod-wheel-next" onClick={() => void player.next()} type="button">
            <FastForward aria-hidden="true" size={13} />
          </button>
          <button aria-label="Play / pause" className="ipod-wheel-play" onClick={() => void player.toggle()} type="button">
            <Play aria-hidden="true" size={10} />
            <Pause aria-hidden="true" size={10} />
          </button>
          <button aria-label={t.select} className="ipod-wheel-center" onClick={select} type="button" />
        </div>
      </div>
    </div>
  );
}
