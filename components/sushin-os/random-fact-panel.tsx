'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { sushinFacts } from '@/content/sushin-os-content';

const rouletteDelays = [45, 95, 155, 225, 305, 395, 495, 610, 740];

function getRandomFactIndex(currentIndex: number) {
  if (sushinFacts.length < 2) return currentIndex;

  const nextIndex = Math.floor(Math.random() * (sushinFacts.length - 1));
  return nextIndex >= currentIndex ? nextIndex + 1 : nextIndex;
}

function playFactSound() {
  const AudioContextClass = window.AudioContext;
  const context = new AudioContextClass();
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
  oscillator.addEventListener('ended', () => void context.close());
}

export function RandomFactPanel() {
  const [factIndex, setFactIndex] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timersRef = useRef(new Set<number>());
  const fact = sushinFacts[factIndex];

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const showRandomFact = () => {
    if (isRolling) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFactIndex((current) => getRandomFactIndex(current));
      if (soundEnabled) playFactSound();
      return;
    }

    setIsRolling(true);
    rouletteDelays.forEach((delay, index) => {
      const timer = window.setTimeout(() => {
        setFactIndex((current) => getRandomFactIndex(current));
        timersRef.current.delete(timer);

        if (index === rouletteDelays.length - 1) {
          setIsRolling(false);
          if (soundEnabled) playFactSound();
        }
      }, delay);
      timersRef.current.add(timer);
    });
  };

  return (
    <div className="fact-panel">
      <div className="fact-topline">
        <b className="fact-counter">
          {String(factIndex + 1).padStart(2, '0')} / {String(sushinFacts.length).padStart(2, '0')}
        </b>
        <button
          aria-label={soundEnabled ? 'Выключить звук' : 'Включить звук'}
          aria-pressed={!soundEnabled}
          className="fact-sound-button"
          onClick={() => setSoundEnabled((current) => !current)}
          title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
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
        <p>{fact.text}</p>
      </article>

      <div className="fact-controls">
        <button
          className="aqua-button is-primary"
          disabled={isRolling}
          onClick={showRandomFact}
          type="button"
        >
          {isRolling ? 'Выбираем…' : 'Следующий факт'}
        </button>
      </div>
    </div>
  );
}
