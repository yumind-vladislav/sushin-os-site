'use client';

import { ArrowUp, X } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from '@/content/i18n';
import {
  askAssistant,
  assistantCopy,
  type AssistantAction,
  type AssistantMessage,
} from '@/lib/assistant';

type Frame = { duration: number; images?: number[][] };
type Agent = {
  framesize: [number, number];
  animations: Record<string, { frames: Frame[] }>;
};

const SPRITE = '/assistant/rover/map.png';
const AGENT = '/assistant/rover/agent.json';
const SIZE = 80;
const idleMoves = ['LookUp', 'GetAttentionMinor', 'Pleased', 'LookUpLeft'];

export type AssistantRequest = { id: number; question: string };

const labels = {
  ru: {
    name: 'Ровер',
    character: 'Настольный ассистент Ровер',
    placeholder: 'Спроси меня о чем угодно…',
    send: 'Отправить',
    close: 'Скрыть подсказку',
    thinking: 'Думаю…',
    newChat: 'Новый разговор',
    hide: 'Спрятать ассистента',
  },
  en: {
    name: 'Rover',
    character: 'Rover desktop assistant',
    placeholder: 'Ask me anything…',
    send: 'Send',
    close: 'Hide bubble',
    thinking: 'Thinking…',
    newChat: 'New conversation',
    hide: 'Hide assistant',
  },
} as const;

/** Steps through sprite frames; long looping animations are capped at 60. */
function playSequence(
  frames: Frame[] | undefined,
  reduced: boolean,
  timer: { current: number | null },
  setOffset: (offset: [number, number]) => void,
  onDone?: () => void,
) {
  if (timer.current) window.clearTimeout(timer.current);
  if (!frames || reduced) {
    setOffset([0, 0]);
    onDone?.();
    return;
  }
  const sequence = frames.slice(0, 60);
  let index = 0;
  const step = () => {
    const image = sequence[index]?.images?.[0];
    if (image) setOffset([image[0], image[1]]);
    const duration = sequence[index]?.duration ?? 100;
    index += 1;
    if (index >= sequence.length) {
      timer.current = window.setTimeout(() => {
        setOffset([0, 0]);
        onDone?.();
      }, duration);
      return;
    }
    timer.current = window.setTimeout(step, duration);
  };
  step();
}

/** Plays Microsoft Agent–style sprite animations from the clippy.js format. */
function useSprite() {
  const [ready, setReady] = useState(false);
  const animations = useRef<Agent['animations'] | null>(null);
  const [offset, setOffset] = useState<[number, number]>([0, 0]);
  const timer = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let cancelled = false;
    const pending = timer;
    fetch(AGENT)
      .then((response) => response.json() as Promise<Agent>)
      .then((data) => {
        if (cancelled) return;
        animations.current = data.animations;
        setReady(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      if (pending.current) window.clearTimeout(pending.current);
    };
  }, []);

  const play = useCallback(
    (name: string, onDone?: () => void) =>
      playSequence(
        animations.current?.[name]?.frames,
        reduced.current,
        timer,
        setOffset,
        onDone,
      ),
    [],
  );

  return { ready, offset, play };
}

export function RoverAssistant({
  locale,
  request,
  onAction,
  onHide,
}: {
  locale: Locale;
  request: AssistantRequest | null;
  onAction: (action: AssistantAction) => void;
  onHide: () => void;
}) {
  const t = labels[locale];
  const { ready, offset, play } = useSprite();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState('');
  const [history, setHistory] = useState<AssistantMessage[]>([]);
  const [menu, setMenu] = useState(false);
  const handledRequest = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const bubbleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ready) return;
    play('Show');
    // On phones the window owns the screen; Rover waits to be tapped.
    const compact = window.matchMedia('(max-width: 700px)').matches;
    const greet = window.setTimeout(() => {
      if (!compact) setOpen(true);
      play('Greet');
    }, 2300);
    return () => window.clearTimeout(greet);
  }, [ready, play]);

  useEffect(() => {
    if (!ready) return;
    const idle = window.setInterval(() => {
      if (!busy) play(idleMoves[Math.floor(Math.random() * idleMoves.length)]);
    }, 14_000);
    return () => window.clearInterval(idle);
  }, [ready, busy, play]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [history, busy]);

  // The bubble steps aside after a quiet moment unless the visitor is typing.
  useEffect(() => {
    if (!open || busy || draft) return;
    const timer = window.setTimeout(() => {
      if (!bubbleRef.current?.contains(document.activeElement)) setOpen(false);
    }, 12_000);
    return () => window.clearTimeout(timer);
  }, [open, busy, draft, history]);

  const send = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || busy) return;
      const next: AssistantMessage[] = [
        ...history,
        { role: 'user', content: trimmed },
      ];
      setHistory(next);
      setDraft('');
      setOpen(true);
      setBusy(true);
      play('Thinking');
      const reply = await askAssistant(next, locale);
      setHistory((current) => [
        ...current,
        { role: 'assistant', content: reply.text },
      ]);
      setBusy(false);
      play(reply.actions.length ? 'Acknowledge' : 'Pleased');
      reply.actions.forEach(onAction);
    },
    [busy, history, locale, onAction, play],
  );

  useEffect(() => {
    if (!request || handledRequest.current === request.id) return;
    handledRequest.current = request.id;
    const timer = window.setTimeout(() => void send(request.question), 0);
    return () => window.clearTimeout(timer);
  }, [request, send]);

  const submit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    void send(draft);
  };

  const spriteStyle = {
    width: SIZE,
    height: SIZE,
    backgroundImage: `url(${SPRITE})`,
    backgroundPosition: `-${offset[0]}px -${offset[1]}px`,
  } as CSSProperties;

  const lastAnswer = [...history]
    .reverse()
    .find((message) => message.role === 'assistant');

  return (
    <div className="rover-assistant">
      {open && (
        <section aria-label={t.character} className="rover-bubble" ref={bubbleRef}>
          <button
            aria-label={t.close}
            className="rover-bubble-close"
            onClick={() => setOpen(false)}
            type="button"
          >
            <X aria-hidden="true" size={12} />
          </button>
          <div aria-live="polite" className="rover-log" ref={logRef}>
            {history.length === 0 && <p>{assistantCopy[locale].greeting}</p>}
            {history.slice(-6).map((message, index) => (
              <p
                className={message.role === 'user' ? 'is-user' : ''}
                // History is append-only, so position is a stable key here.
                key={`${history.length}-${index}`}
              >
                {message.content}
              </p>
            ))}
            {busy && <p className="is-thinking">{t.thinking}</p>}
          </div>
          <form className="rover-form" onSubmit={submit}>
            <input
              aria-label={t.placeholder}
              disabled={busy}
              maxLength={400}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t.placeholder}
              ref={inputRef}
              value={draft}
            />
            <button
              aria-label={t.send}
              disabled={busy || !draft.trim()}
              type="submit"
            >
              <ArrowUp aria-hidden="true" size={13} />
            </button>
          </form>
          <span className="sr-only">{lastAnswer?.content}</span>
        </section>
      )}

      <button
        aria-expanded={open}
        aria-label={t.character}
        className="rover-character"
        onClick={() => {
          setMenu(false);
          setOpen((current) => !current);
          play('ClickedOn');
          window.setTimeout(() => inputRef.current?.focus(), 0);
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          setMenu((current) => !current);
        }}
        type="button"
      >
        <span aria-hidden="true" className="rover-sprite" style={spriteStyle} />
      </button>

      {menu && (
        <div className="os-menu rover-menu" role="menu">
          <button
            onClick={() => {
              setHistory([]);
              setMenu(false);
              setOpen(true);
              play('Greet');
            }}
            role="menuitem"
            type="button"
          >
            <span />
            {t.newChat}
          </button>
          <hr />
          <button
            onClick={() => {
              setMenu(false);
              play('Hide', onHide);
            }}
            role="menuitem"
            type="button"
          >
            <span />
            {t.hide}
          </button>
        </div>
      )}
    </div>
  );
}
