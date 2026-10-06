'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/content/i18n';
import { useAppCommand } from '@/lib/app-commands';

type Wave = OscillatorType;
type Voice = { osc: OscillatorNode; gain: GainNode };

const waves: readonly Wave[] = ['sine', 'square', 'sawtooth', 'triangle'];
// Two octaves from C. Computer keys follow the classic tracker layout.
const notes = [
  { name: 'C', key: 'a' }, { name: 'C#', key: 'w' }, { name: 'D', key: 's' }, { name: 'D#', key: 'e' },
  { name: 'E', key: 'd' }, { name: 'F', key: 'f' }, { name: 'F#', key: 't' }, { name: 'G', key: 'g' },
  { name: 'G#', key: 'y' }, { name: 'A', key: 'h' }, { name: 'A#', key: 'u' }, { name: 'B', key: 'j' },
  { name: 'C', key: 'k' }, { name: 'C#', key: 'o' }, { name: 'D', key: 'l' }, { name: 'D#', key: 'p' },
  { name: 'E', key: ';' }, { name: 'F', key: "'" }, { name: 'F#', key: ']' }, { name: 'G', key: '\\' },
  { name: 'G#', key: '' }, { name: 'A', key: '' }, { name: 'A#', key: '' }, { name: 'B', key: '' },
];

const labels = {
  ru: {
    wave: 'Форма волны',
    waves: { sine: 'Синус', square: 'Квадрат', sawtooth: 'Пила', triangle: 'Треугольник', custom: '' },
    volume: 'Громкость',
    release: 'Затухание',
    octave: 'Октава',
    keyboard: 'Клавиатура синтезатора',
    hint: 'Играй мышкой или клавишами A–K (черные: W E T Y U). Z / X — октава.',
  },
  en: {
    wave: 'Waveform',
    waves: { sine: 'Sine', square: 'Square', sawtooth: 'Saw', triangle: 'Triangle', custom: '' },
    volume: 'Volume',
    release: 'Release',
    octave: 'Octave',
    keyboard: 'Synth keyboard',
    hint: 'Play with the mouse or keys A–K (black: W E T Y U). Z / X — octave.',
  },
} as const;

const frequency = (index: number, octave: number) => 440 * 2 ** ((index - 9) / 12 + (octave - 4));

export function SynthApp({ locale }: { locale: Locale }) {
  const t = labels[locale];
  const [wave, setWave] = useState<Wave>('sawtooth');
  const [volume, setVolume] = useState(0.35);
  const [release, setRelease] = useState(0.4);
  const [octave, setOctave] = useState(4);
  const [active, setActive] = useState<Set<number>>(new Set());
  const audio = useRef<AudioContext | null>(null);
  const voices = useRef(new Map<number, Voice>());
  const rootRef = useRef<HTMLDivElement | null>(null);

  const ensureAudio = () => {
    if (typeof window.AudioContext === 'undefined') return null;
    audio.current ??= new window.AudioContext();
    if (audio.current.state === 'suspended') void audio.current.resume();
    return audio.current;
  };

  const start = (index: number) => {
    const ctx = ensureAudio();
    if (!ctx || voices.current.has(index)) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.value = frequency(index, octave);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.001), ctx.currentTime + 0.015);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    voices.current.set(index, { osc, gain });
    setActive((current) => new Set(current).add(index));
  };

  const stop = (index: number) => {
    const ctx = audio.current;
    const voice = voices.current.get(index);
    if (!ctx || !voice) return;
    voice.gain.gain.cancelScheduledValues(ctx.currentTime);
    voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value, 0.0001), ctx.currentTime);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + release);
    voice.osc.stop(ctx.currentTime + release + 0.02);
    voices.current.delete(index);
    setActive((current) => {
      const next = new Set(current);
      next.delete(index);
      return next;
    });
  };

  // Listeners are bound once; they call the latest start/stop through a ref so
  // re-renders never cut off notes that are still held.
  const handlers = useRef({ start, stop });
  useEffect(() => {
    handlers.current = { start, stop };
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const down = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey) return;
      if ((event.target as HTMLElement).closest('input')) return;
      const key = event.key.toLowerCase();
      if (key === 'z') setOctave((value) => Math.max(1, value - 1));
      if (key === 'x') setOctave((value) => Math.min(7, value + 1));
      const index = notes.findIndex((note) => note.key && note.key === key);
      if (index >= 0) {
        event.preventDefault();
        handlers.current.start(index);
      }
    };
    const up = (event: KeyboardEvent) => {
      const index = notes.findIndex((note) => note.key && note.key === event.key.toLowerCase());
      if (index >= 0) handlers.current.stop(index);
    };
    root.addEventListener('keydown', down);
    root.addEventListener('keyup', up);
    return () => {
      root.removeEventListener('keydown', down);
      root.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    const context = audio;
    return () => {
      void context.current?.close();
    };
  }, []);

  useAppCommand('synth', (command) => {
    if (command.startsWith('wave:')) setWave(command.slice(5) as Wave);
    if (command === 'octave:up') setOctave((value) => Math.min(7, value + 1));
    if (command === 'octave:down') setOctave((value) => Math.max(1, value - 1));
  });

  const whiteIndexes = notes.map((note, index) => (note.name.includes('#') ? -1 : index)).filter((index) => index >= 0);

  return (
    <div className="synth-app" ref={rootRef} tabIndex={-1}>
      <div className="synth-panel">
        <fieldset className="synth-waves">
          <legend>{t.wave}</legend>
          {waves.map((item) => (
            <button
              aria-pressed={wave === item}
              className="synth-led-button"
              key={item}
              onClick={() => setWave(item)}
              type="button"
            >
              {t.waves[item]}
            </button>
          ))}
        </fieldset>
        <label className="synth-knob">
          <span>{t.volume}</span>
          <input max={0.8} min={0.02} onChange={(event) => setVolume(Number(event.target.value))} step={0.02} type="range" value={volume} />
        </label>
        <label className="synth-knob">
          <span>{t.release}</span>
          <input max={2} min={0.05} onChange={(event) => setRelease(Number(event.target.value))} step={0.05} type="range" value={release} />
        </label>
        <output className="synth-octave" aria-label={t.octave}>
          {t.octave} {octave}
        </output>
      </div>
      <fieldset aria-label={t.keyboard} className="synth-keys">
        {whiteIndexes.map((index, position) => {
          const black = notes[index + 1]?.name.includes('#') ? index + 1 : null;
          return (
            <div className="synth-key-slot" key={index}>
              <button
                aria-label={`${notes[index].name}${octave + Math.floor(index / 12)}`}
                className={`synth-key is-white ${active.has(index) ? 'is-down' : ''}`}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  start(index);
                }}
                onPointerLeave={() => stop(index)}
                onPointerUp={() => stop(index)}
                type="button"
              >
                <small>{notes[index].key.toUpperCase()}</small>
              </button>
              {black !== null && position < whiteIndexes.length - 1 && (
                <button
                  aria-label={`${notes[black].name}${octave + Math.floor(black / 12)}`}
                  className={`synth-key is-black ${active.has(black) ? 'is-down' : ''}`}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    start(black);
                  }}
                  onPointerLeave={() => stop(black)}
                  onPointerUp={() => stop(black)}
                  type="button"
                >
                  <small>{notes[black].key.toUpperCase()}</small>
                </button>
              )}
            </div>
          );
        })}
      </fieldset>
      <p className="app-hint">{t.hint}</p>
    </div>
  );
}
