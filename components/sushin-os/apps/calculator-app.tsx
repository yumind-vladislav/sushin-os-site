'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/content/i18n';
import { useAppCommand } from '@/lib/app-commands';
import { applyOperator, formatNumber, type Operator } from '@/lib/calculator';

const keys: Array<{ label: string; value: string; wide?: boolean; tone?: 'op' | 'fn' }> = [
  { label: 'C', value: 'clear', tone: 'fn' },
  { label: '±', value: 'negate', tone: 'fn' },
  { label: '%', value: 'percent', tone: 'fn' },
  { label: '÷', value: '/', tone: 'op' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '×', value: '*', tone: 'op' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '−', value: '-', tone: 'op' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '+', value: '+', tone: 'op' },
  { label: '0', value: '0', wide: true },
  { label: ',', value: '.' },
  { label: '=', value: '=', tone: 'op' },
];

const labels = {
  ru: { display: 'Табло калькулятора', keypad: 'Клавиши калькулятора' },
  en: { display: 'Calculator display', keypad: 'Calculator keys' },
} as const;

export function CalculatorApp({ locale }: { locale: Locale }) {
  const t = labels[locale];
  const [entry, setEntry] = useState('0');
  const [stored, setStored] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [fresh, setFresh] = useState(true);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const value = Number(entry);

  const press = (key: string) => {
    if (/^\d$/.test(key)) {
      setEntry((current) => (fresh || current === '0' ? key : (current + key).slice(0, 14)));
      setFresh(false);
      return;
    }
    if (key === '.') {
      setEntry((current) => (fresh ? '0.' : current.includes('.') ? current : `${current}.`));
      setFresh(false);
      return;
    }
    if (key === 'clear') {
      setEntry('0');
      setStored(null);
      setOperator(null);
      setFresh(true);
      return;
    }
    if (key === 'back') {
      setEntry((current) => (current.length > 1 ? current.slice(0, -1) : '0'));
      return;
    }
    if (key === 'negate') {
      setEntry((current) => (current.startsWith('-') ? current.slice(1) : current === '0' ? current : `-${current}`));
      return;
    }
    if (key === 'percent') {
      setEntry(String(value / 100));
      setFresh(true);
      return;
    }
    if (key === '=' || key === 'Enter') {
      if (operator === null || stored === null) return;
      setEntry(String(applyOperator(stored, value, operator)));
      setStored(null);
      setOperator(null);
      setFresh(true);
      return;
    }
    if (['+', '-', '*', '/'].includes(key)) {
      const next =
        stored !== null && operator !== null && !fresh
          ? applyOperator(stored, value, operator)
          : value;
      setStored(next);
      setEntry(String(next));
      setOperator(key as Operator);
      setFresh(true);
    }
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onKey = (event: KeyboardEvent) => {
      const map: Record<string, string> = {
        Escape: 'clear',
        Backspace: 'back',
        Enter: '=',
        '=': '=',
        ',': '.',
        '%': 'percent',
      };
      const key = map[event.key] ?? event.key;
      if (/^[\d.+\-*/=]$/.test(key) || ['clear', 'back', 'percent'].includes(key)) {
        event.preventDefault();
        press(key);
      }
    };
    root.addEventListener('keydown', onKey);
    return () => root.removeEventListener('keydown', onKey);
  });

  useAppCommand('calculator', (command) => {
    if (command === 'clear') press('clear');
    if (command === 'copy') void navigator.clipboard?.writeText(formatNumber(value, locale));
  });

  return (
    // The keypad is a single composite widget: focus anywhere inside and type.
    <div className="calculator-app" ref={rootRef} tabIndex={-1}>
      <output aria-label={t.display} aria-live="polite" className="calculator-display">
        {formatNumber(value, locale, entry)}
      </output>
      <fieldset aria-label={t.keypad} className="calculator-keys">
        {keys.map((key) => (
          <button
            className={`calculator-key ${key.wide ? 'is-wide' : ''} ${key.tone ? `is-${key.tone}` : ''} ${operator === key.value && fresh ? 'is-armed' : ''}`}
            key={key.value}
            onClick={() => press(key.value)}
            type="button"
          >
            {key.label}
          </button>
        ))}
      </fieldset>
    </div>
  );
}
