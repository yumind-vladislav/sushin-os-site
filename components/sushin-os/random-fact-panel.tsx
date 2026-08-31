'use client';

import { FileText, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { dictionaries, type Locale } from '@/content/i18n';
import { sushinFacts } from '@/content/sushin-os-content';
import { nextFactIndex } from '@/lib/random-fact';

const rouletteDelays = [45, 95, 155, 225, 305, 395, 495, 610, 740];
const soundStorageKey = 'sushin-os.random-fact.sound.v1';

function playFactSound(context: AudioContext) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(520, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(780, context.currentTime + 0.08);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.07, context.currentTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.13);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.14);
}

export function RandomFactPanel({ locale }: { locale: Locale }) {
  const [factIndex, setFactIndex] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timersRef = useRef(new Set<number>());
  const audioContextRef = useRef<AudioContext | null>(null);
  const fact = sushinFacts[factIndex];
  const dictionary = dictionaries[locale];

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        setSoundEnabled(window.localStorage.getItem(soundStorageKey) !== 'off');
      } catch {
        setSoundEnabled(true);
      }
    }, 0);
    const timers = timersRef.current;
    return () => {
      window.clearTimeout(hydrationTimer);
      timers.forEach((timer) => window.clearTimeout(timer));
      void audioContextRef.current?.close();
    };
  }, []);

  const unlockSound = () => {
    if (!soundEnabled || typeof window.AudioContext === 'undefined') return null;
    const context = audioContextRef.current ?? new window.AudioContext();
    audioContextRef.current = context;
    if (context.state === 'suspended') void context.resume();
    return context;
  };

  const showRandomFact = () => {
    if (isRolling) return;

    const originalIndex = factIndex;
    const context = unlockSound();
    const selectFinalFact = () => {
      const finalIndex = nextFactIndex(
        sushinFacts.length,
        originalIndex,
        Math.random(),
      );
      setFactIndex(finalIndex);
      if (context) playFactSound(context);
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      selectFinalFact();
      return;
    }

    setIsRolling(true);
    let previewIndex = originalIndex;
    rouletteDelays.forEach((delay, index) => {
      const timer = window.setTimeout(() => {
        timersRef.current.delete(timer);
        if (index === rouletteDelays.length - 1) {
          selectFinalFact();
          setIsRolling(false);
          return;
        }

        previewIndex = nextFactIndex(
          sushinFacts.length,
          previewIndex,
          Math.random(),
        );
        setFactIndex(previewIndex);
      }, delay);
      timersRef.current.add(timer);
    });
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      window.localStorage.setItem(soundStorageKey, next ? 'on' : 'off');
    } catch {
      // Sound still works for the current session when storage is unavailable.
    }
  };

  return (
    <div className="fact-panel">
      <div className="fact-topline">
        <b className="fact-counter">
          {String(factIndex + 1).padStart(2, '0')} /{' '}
          {String(sushinFacts.length).padStart(2, '0')}
        </b>
        <button
          aria-label={
            soundEnabled ? dictionary.actions.soundOff : dictionary.actions.soundOn
          }
          aria-pressed={!soundEnabled}
          className="fact-sound-button"
          onClick={toggleSound}
          title={
            soundEnabled ? dictionary.actions.soundOff : dictionary.actions.soundOn
          }
          type="button"
        >
          {soundEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
        </button>
      </div>

      <article
        aria-busy={isRolling}
        aria-live={isRolling ? 'off' : 'polite'}
        className={`fact-copy${isRolling ? ' is-rolling' : ''}`}
      >
        <p>{fact.text[locale]}</p>
      </article>

      <div className="fact-controls">
        <button
          className="aqua-button is-primary"
          disabled={isRolling}
          onClick={showRandomFact}
          type="button"
        >
          {isRolling
            ? dictionary.actions.choosingFact
            : dictionary.actions.nextFact}
        </button>
        {fact.cvHref && (
          <a className="fact-cv-link" href={fact.cvHref}>
            <FileText aria-hidden="true" />
            {dictionary.actions.viewCvEvidence}
          </a>
        )}
      </div>
    </div>
  );
}
