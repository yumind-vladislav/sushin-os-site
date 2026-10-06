'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MusicTrack } from '@/content/media-library';
import { renderDemoTrack } from '@/lib/demo-tracks';

const exclusiveEvent = 'sushin-os:media-play';

/**
 * One HTMLAudioElement per player. Starting playback in one player pauses the
 * others, so iPod and Winamp never talk over each other.
 */
export function useAudioPlayer(owner: string, tracks: readonly MusicTrack[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [failed, setFailed] = useState(false);
  const wantPlay = useRef(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;
    const sync = () => {
      setTime(audio.currentTime);
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const onPlay = () => {
      setPlaying(true);
      window.dispatchEvent(new CustomEvent(exclusiveEvent, { detail: owner }));
    };
    const onPause = () => setPlaying(false);
    const onError = () => {
      setFailed(true);
      setPlaying(false);
    };
    const onOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== owner) audio.pause();
    };
    audio.addEventListener('timeupdate', sync);
    audio.addEventListener('loadedmetadata', sync);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);
    window.addEventListener(exclusiveEvent, onOther);
    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.removeEventListener('timeupdate', sync);
      audio.removeEventListener('loadedmetadata', sync);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      window.removeEventListener(exclusiveEvent, onOther);
    };
  }, [owner]);

  const load = useCallback(
    async (nextIndex: number, autoplay: boolean) => {
      const audio = audioRef.current;
      const track = tracks[nextIndex];
      if (!audio || !track) return;
      setIndex(nextIndex);
      setFailed(false);
      setTime(0);
      wantPlay.current = autoplay;
      setLoading(true);
      try {
        const src = track.src ?? (await renderDemoTrack(track.demo));
        audio.src = src;
        if (wantPlay.current) await audio.play();
      } catch {
        setFailed(true);
      } finally {
        setLoading(false);
      }
    },
    [tracks],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => void load((index + 1) % tracks.length, true);
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [index, load, tracks.length]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !tracks.length) return;
    if (!audio.src) return load(index, true);
    if (audio.paused) await audio.play().catch(() => setFailed(true));
    else audio.pause();
  }, [index, load, tracks.length]);

  const next = useCallback(() => load((index + 1) % tracks.length, playing), [index, load, playing, tracks.length]);
  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    void load((index - 1 + tracks.length) % tracks.length, playing);
  }, [index, load, playing, tracks.length]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration)) audio.currentTime = Math.max(0, Math.min(seconds, audio.duration));
  }, []);

  const setVolume = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    if (audioRef.current) audioRef.current.volume = clamped;
    setVolumeState(clamped);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  return {
    track: tracks[index],
    index,
    playing,
    loading,
    failed,
    time,
    duration,
    volume,
    play: (target: number) => load(target, true),
    toggle,
    next,
    prev,
    seek,
    stop,
    setVolume,
  };
}

export const formatTime = (seconds: number) => {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
};
