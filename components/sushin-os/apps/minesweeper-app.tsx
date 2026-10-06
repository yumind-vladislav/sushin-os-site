'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/content/i18n';
import { useAppCommand } from '@/lib/app-commands';
import {
  emptyBoard,
  isLost,
  isWon,
  levels,
  neighbours,
  plantMines,
  reveal,
  type Board,
  type Level,
} from '@/lib/minesweeper';

type Status = 'ready' | 'playing' | 'won' | 'lost';

const labels = {
  ru: {
    mines: 'Осталось мин',
    time: 'Секунды',
    restart: 'Новая игра',
    won: 'Победа!',
    lost: 'Бум. Еще раз?',
    hint: 'Клик — открыть, правый клик или долгое нажатие — флажок.',
    cell: (r: number, c: number) => `Клетка ${r + 1}, ${c + 1}`,
  },
  en: {
    mines: 'Mines left',
    time: 'Seconds',
    restart: 'New game',
    won: 'You win!',
    lost: 'Boom. Again?',
    hint: 'Click to open, right-click or long-press to flag.',
    cell: (r: number, c: number) => `Cell ${r + 1}, ${c + 1}`,
  },
} as const;

const numberColors = ['', '#1d4ed8', '#15803d', '#b91c1c', '#1e3a8a', '#7f1d1d', '#0e7490', '#111', '#555'];

export function MinesweeperApp({ locale }: { locale: Locale }) {
  const t = labels[locale];
  const [level, setLevel] = useState<Level>('beginner');
  const config = levels[level];
  const [board, setBoard] = useState<Board>(() => emptyBoard(config.rows, config.cols));
  const [status, setStatus] = useState<Status>('ready');
  const [seconds, setSeconds] = useState(0);
  const [pressTimer, setPressTimer] = useState<number | null>(null);

  const restart = (nextLevel: Level = level) => {
    const next = levels[nextLevel];
    setLevel(nextLevel);
    setBoard(emptyBoard(next.rows, next.cols));
    setStatus('ready');
    setSeconds(0);
  };

  useAppCommand('minesweeper', (command) => {
    if (command === 'new') restart();
    if (command === 'level:beginner') restart('beginner');
    if (command === 'level:intermediate') restart('intermediate');
  });

  useEffect(() => {
    if (status !== 'playing') return;
    const timer = window.setInterval(() => setSeconds((value) => Math.min(value + 1, 999)), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const finish = (next: Board) => {
    if (isLost(next)) {
      setStatus('lost');
      setBoard(next.map((row) => row.map((cell) => (cell.mine ? { ...cell, open: true } : cell))));
      return;
    }
    if (isWon(next)) setStatus('won');
    setBoard(next);
  };

  const open = (row: number, col: number) => {
    if (status === 'won' || status === 'lost') return;
    let current = board;
    if (status === 'ready') {
      current = plantMines(board, config.mines, row, col);
      setStatus('playing');
    }
    const cell = current[row][col];
    if (cell.flagged) return;
    if (cell.open && cell.adjacent > 0) {
      // Chord: open all neighbours once the flags around a number match it.
      const around = neighbours(current, row, col);
      const flags = around.filter(([r, c]) => current[r][c].flagged).length;
      if (flags !== cell.adjacent) return;
      finish(around.reduce((next, [r, c]) => reveal(next, r, c), current));
      return;
    }
    finish(reveal(current, row, col));
  };

  const toggleFlag = (row: number, col: number) => {
    if (status === 'won' || status === 'lost' || board[row][col].open) return;
    setBoard((current) =>
      current.map((line, r) =>
        line.map((cell, c) => (r === row && c === col ? { ...cell, flagged: !cell.flagged } : cell)),
      ),
    );
  };

  const flags = board.flat().filter((cell) => cell.flagged).length;
  const face = status === 'lost' ? '😵' : status === 'won' ? '😎' : '🙂';

  return (
    <div className={`minesweeper-app is-${level}`}>
      <div className="mine-header">
        <output aria-label={t.mines} className="mine-counter">
          {String(Math.max(config.mines - flags, 0)).padStart(3, '0')}
        </output>
        <button aria-label={t.restart} className="mine-face" onClick={() => restart()} type="button">
          {face}
        </button>
        <output aria-label={t.time} className="mine-counter">
          {String(seconds).padStart(3, '0')}
        </output>
      </div>
      <div
        className="mine-grid"
        style={{ gridTemplateColumns: `repeat(${config.cols}, var(--mine-size))` }}
      >
        {board.map((line, r) =>
          line.map((cell, c) => (
            <button
              aria-label={t.cell(r, c)}
              className={`mine-cell ${cell.open ? 'is-open' : ''} ${cell.open && cell.mine ? 'is-mine' : ''}`}
              key={`${r}-${c}`}
              onClick={() => open(r, c)}
              onContextMenu={(event) => {
                event.preventDefault();
                toggleFlag(r, c);
              }}
              onPointerDown={(event) => {
                if (event.pointerType !== 'touch') return;
                setPressTimer(window.setTimeout(() => {
                  toggleFlag(r, c);
                  setPressTimer(null);
                }, 450));
              }}
              onPointerUp={() => {
                if (pressTimer) window.clearTimeout(pressTimer);
                setPressTimer(null);
              }}
              style={cell.open && cell.adjacent ? { color: numberColors[cell.adjacent] } : undefined}
              type="button"
            >
              {cell.flagged && !cell.open ? '🚩' : cell.open ? (cell.mine ? '💣' : cell.adjacent || '') : ''}
            </button>
          )),
        )}
      </div>
      <p aria-live="polite" className="mine-status">
        {status === 'won' ? t.won : status === 'lost' ? t.lost : t.hint}
      </p>
    </div>
  );
}
