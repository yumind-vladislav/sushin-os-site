'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/content/i18n';
import { useAppCommand } from '@/lib/app-commands';

type CalendarEvent = { id: string; title: string };
type EventMap = Record<string, CalendarEvent[]>;

const STORAGE_KEY = 'sushin-os.calendar.v1';

const labels = {
  ru: {
    today: 'Сегодня',
    prev: 'Предыдущий месяц',
    next: 'Следующий месяц',
    add: 'Добавить',
    placeholder: 'Новое событие',
    none: 'Событий нет',
    remove: 'Удалить событие',
    note: 'События хранятся только в этом браузере.',
  },
  en: {
    today: 'Today',
    prev: 'Previous month',
    next: 'Next month',
    add: 'Add',
    placeholder: 'New event',
    none: 'No events',
    remove: 'Delete event',
    note: 'Events are stored only in this browser.',
  },
} as const;

const keyOf = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Monday-first 6×7 grid around the visible month. */
function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => new Date(year, month, index - offset + 1));
}

export function CalendarApp({ locale }: { locale: Locale }) {
  const t = labels[locale];
  const [today, setToday] = useState(() => new Date(2026, 0, 1));
  const [cursor, setCursor] = useState(() => new Date(2026, 0, 1));
  const [selected, setSelected] = useState(() => keyOf(new Date(2026, 0, 1)));
  const [events, setEvents] = useState<EventMap>({});
  const [draft, setDraft] = useState('');
  const hydrated = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const now = new Date();
      setToday(now);
      setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
      setSelected(keyOf(now));
      try {
        const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as EventMap;
        if (stored && typeof stored === 'object') setEvents(stored);
      } catch {
        // Start empty when storage is unavailable or malformed.
      }
      hydrated.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // Events still work for this session.
    }
  }, [events]);

  const shift = (months: number) =>
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + months, 1));

  const goToday = () => {
    const now = new Date();
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelected(keyOf(now));
  };

  useAppCommand('calendar', (command) => {
    if (command === 'today') goToday();
    if (command === 'prev') shift(-1);
    if (command === 'next') shift(1);
    if (command === 'new-event') inputRef.current?.focus();
  });

  const addEvent = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setEvents((current) => ({
      ...current,
      [selected]: [...(current[selected] ?? []), { id: `${Date.now()}`, title }],
    }));
    setDraft('');
  };

  const removeEvent = (id: string) =>
    setEvents((current) => {
      const rest = (current[selected] ?? []).filter((item) => item.id !== id);
      const next = { ...current, [selected]: rest };
      if (!rest.length) delete next[selected];
      return next;
    });

  const monthTitle = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(cursor);
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, 1 + index)),
  );
  const selectedDate = new Date(`${selected}T12:00:00`);
  const dayEvents = events[selected] ?? [];

  return (
    <div className="calendar-app">
      <div className="calendar-month">
        <div className="calendar-head">
          <button aria-label={t.prev} className="app-tool" onClick={() => shift(-1)} type="button">
            <ChevronLeft aria-hidden="true" size={14} />
          </button>
          <strong>{monthTitle}</strong>
          <button aria-label={t.next} className="app-tool" onClick={() => shift(1)} type="button">
            <ChevronRight aria-hidden="true" size={14} />
          </button>
          <button className="app-button" onClick={goToday} type="button">
            {t.today}
          </button>
        </div>
        <div className="calendar-grid">
          {weekdays.map((day) => (
            <span aria-hidden="true" className="calendar-weekday" key={day}>
              {day}
            </span>
          ))}
          {monthGrid(cursor.getFullYear(), cursor.getMonth()).map((date) => {
            const key = keyOf(date);
            return (
              <button
                aria-pressed={key === selected}
                className={`calendar-day ${date.getMonth() !== cursor.getMonth() ? 'is-outside' : ''} ${key === keyOf(today) ? 'is-today' : ''} ${key === selected ? 'is-selected' : ''}`}
                key={key}
                onClick={() => setSelected(key)}
                type="button"
              >
                {date.getDate()}
                {events[key]?.length ? <i aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      </div>
      <aside className="calendar-agenda">
        <strong>
          {new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDate)}
        </strong>
        {dayEvents.length === 0 ? (
          <p className="app-empty">{t.none}</p>
        ) : (
          <ul>
            {dayEvents.map((item) => (
              <li key={item.id}>
                <span>{item.title}</span>
                <button aria-label={t.remove} onClick={() => removeEvent(item.id)} type="button">
                  <X aria-hidden="true" size={11} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={addEvent}>
          <input
            aria-label={t.placeholder}
            maxLength={120}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t.placeholder}
            ref={inputRef}
            value={draft}
          />
          <button className="app-button" disabled={!draft.trim()} type="submit">
            {t.add}
          </button>
        </form>
        <small>{t.note}</small>
      </aside>
    </div>
  );
}
