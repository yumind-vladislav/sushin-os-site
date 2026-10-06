'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/content/i18n';
import { useAppCommand } from '@/lib/app-commands';

type NoteColor = 'yellow' | 'blue' | 'green' | 'pink';
type Note = { id: string; text: string; color: NoteColor };

const STORAGE_KEY = 'sushin-os.stickies.v1';
const colors: readonly NoteColor[] = ['yellow', 'blue', 'green', 'pink'];

const labels = {
  ru: {
    add: 'Новая записка',
    remove: 'Удалить записку',
    note: 'Записка',
    first: 'Это записка. Пиши что угодно — она сохранится в этом браузере.',
    empty: 'Записок нет. Нажми «+», чтобы создать.',
    color: 'Цвет',
  },
  en: {
    add: 'New note',
    remove: 'Delete note',
    note: 'Note',
    first: 'This is a note. Write anything — it stays in this browser.',
    empty: 'No notes. Press “+” to add one.',
    color: 'Color',
  },
} as const;

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function StickiesApp({ locale }: { locale: Locale }) {
  const t = labels[locale];
  const [notes, setNotes] = useState<Note[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const hydrated = useRef(false);
  // The greeting is seeded once; switching language must not reseed notes.
  const greeting = useRef<string>(t.first);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as Note[] | null;
        if (Array.isArray(stored)) setNotes(stored.filter((note) => typeof note?.text === 'string'));
        else setNotes([{ id: createId(), text: greeting.current, color: 'yellow' }]);
      } catch {
        setNotes([{ id: createId(), text: greeting.current, color: 'yellow' }]);
      }
      hydrated.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // Notes still work for this session without storage.
    }
  }, [notes]);

  const addNote = () => {
    const note: Note = { id: createId(), text: '', color: 'yellow' };
    setNotes((items) => [...items, note]);
    setCurrent(note.id);
    window.setTimeout(() => document.getElementById(`sticky-${note.id}`)?.focus(), 0);
  };

  const removeNote = (id: string | null) => {
    if (!id) return;
    setNotes((items) => items.filter((note) => note.id !== id));
    setCurrent(null);
  };

  const setColor = (id: string | null, color: NoteColor) => {
    if (!id) return;
    setNotes((items) => items.map((note) => (note.id === id ? { ...note, color } : note)));
  };

  const target = current ?? notes.at(-1)?.id ?? null;

  useAppCommand('stickies', (command) => {
    if (command === 'new') addNote();
    if (command === 'delete') removeNote(target);
    if (command.startsWith('color:')) setColor(target, command.slice(6) as NoteColor);
  });

  return (
    <div className="stickies-app">
      <div className="app-toolbar">
        <button aria-label={t.add} className="app-tool" onClick={addNote} type="button">
          <Plus aria-hidden="true" size={14} />
        </button>
        <fieldset aria-label={t.color} className="sticky-swatches">
          {colors.map((color) => (
            <button
              aria-label={`${t.color}: ${color}`}
              className={`sticky-swatch is-${color}`}
              disabled={!target}
              key={color}
              onClick={() => setColor(target, color)}
              type="button"
            />
          ))}
        </fieldset>
        <button
          aria-label={t.remove}
          className="app-tool"
          disabled={!target}
          onClick={() => removeNote(target)}
          type="button"
        >
          <Trash2 aria-hidden="true" size={14} />
        </button>
      </div>
      {notes.length === 0 ? (
        <p className="app-empty">{t.empty}</p>
      ) : (
        <div className="sticky-board">
          {notes.map((note, index) => (
            <textarea
              aria-label={`${t.note} ${index + 1}`}
              className={`sticky-note is-${note.color} ${target === note.id ? 'is-current' : ''}`}
              id={`sticky-${note.id}`}
              key={note.id}
              maxLength={2000}
              onChange={(event) =>
                setNotes((items) =>
                  items.map((item) =>
                    item.id === note.id ? { ...item, text: event.target.value } : item,
                  ),
                )
              }
              onFocus={() => setCurrent(note.id)}
              value={note.text}
            />
          ))}
        </div>
      )}
    </div>
  );
}
