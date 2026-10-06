'use client';

import { Brush, Download, Eraser, PaintBucket, Pencil, Trash2, Undo2 } from 'lucide-react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/content/i18n';
import { useAppCommand } from '@/lib/app-commands';
import { floodFill } from '@/lib/flood-fill';

type Tool = 'pencil' | 'brush' | 'eraser' | 'fill';

const WIDTH = 640;
const HEIGHT = 400;
const palette = [
  '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8',
  '#3f48cc', '#a349a4', '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#b5e61d', '#99d9ea',
];

const labels = {
  ru: {
    tools: { pencil: 'Карандаш', brush: 'Кисть', eraser: 'Ластик', fill: 'Заливка' },
    size: 'Толщина',
    undo: 'Отменить',
    clear: 'Очистить холст',
    save: 'Сохранить PNG',
    canvas: 'Холст для рисования',
    color: 'Цвет',
  },
  en: {
    tools: { pencil: 'Pencil', brush: 'Brush', eraser: 'Eraser', fill: 'Fill' },
    size: 'Size',
    undo: 'Undo',
    clear: 'Clear canvas',
    save: 'Save PNG',
    canvas: 'Drawing canvas',
    color: 'Color',
  },
} as const;

const toolIcons = { pencil: Pencil, brush: Brush, eraser: Eraser, fill: PaintBucket };

export function PaintApp({ locale }: { locale: Locale }) {
  const t = labels[locale];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const history = useRef<ImageData[]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(6);

  const context = () => canvasRef.current?.getContext('2d', { willReadFrequently: true }) ?? null;

  const clear = () => {
    const ctx = context();
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  };

  useEffect(clear, []);

  const snapshot = () => {
    const ctx = context();
    if (!ctx) return;
    history.current.push(ctx.getImageData(0, 0, WIDTH, HEIGHT));
    if (history.current.length > 25) history.current.shift();
  };

  const undo = () => {
    const ctx = context();
    const previous = history.current.pop();
    if (ctx && previous) ctx.putImageData(previous, 0, 0);
  };

  const save = () => {
    const link = document.createElement('a');
    link.download = 'sushin-paint.png';
    link.href = canvasRef.current?.toDataURL('image/png') ?? '';
    link.click();
  };

  useAppCommand('paint', (command) => {
    if (command === 'clear') {
      snapshot();
      clear();
    }
    if (command === 'save') save();
    if (command === 'undo') undo();
    if (command.startsWith('tool:')) setTool(command.slice(5) as Tool);
  });

  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    };
  };

  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = context();
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'pencil' ? 2 : tool === 'eraser' ? size * 2.5 : size;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;
    const at = point(event);
    snapshot();
    if (tool === 'fill') {
      const ctx = context();
      if (!ctx) return;
      const image = ctx.getImageData(0, 0, WIDTH, HEIGHT);
      floodFill(image, Math.floor(at.x), Math.floor(at.y), color);
      ctx.putImageData(image, 0, 0);
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    last.current = at;
    stroke(at, at);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!last.current) return;
    const at = point(event);
    stroke(last.current, at);
    last.current = at;
  };

  const onPointerUp = () => {
    last.current = null;
  };

  return (
    <div className="paint-app">
      <div className="app-toolbar">
        {(Object.keys(toolIcons) as Tool[]).map((id) => {
          const Icon = toolIcons[id];
          return (
            <button
              aria-label={t.tools[id]}
              aria-pressed={tool === id}
              className="app-tool"
              key={id}
              onClick={() => setTool(id)}
              title={t.tools[id]}
              type="button"
            >
              <Icon aria-hidden="true" size={14} />
            </button>
          );
        })}
        <label className="paint-size">
          <span>{t.size}</span>
          <input
            max={40}
            min={1}
            onChange={(event) => setSize(Number(event.target.value))}
            type="range"
            value={size}
          />
        </label>
        <span className="toolbar-spacer" />
        <button aria-label={t.undo} className="app-tool" onClick={undo} title={t.undo} type="button">
          <Undo2 aria-hidden="true" size={14} />
        </button>
        <button
          aria-label={t.clear}
          className="app-tool"
          onClick={() => {
            snapshot();
            clear();
          }}
          title={t.clear}
          type="button"
        >
          <Trash2 aria-hidden="true" size={14} />
        </button>
        <button aria-label={t.save} className="app-tool" onClick={save} title={t.save} type="button">
          <Download aria-hidden="true" size={14} />
        </button>
      </div>
      <canvas
        aria-label={t.canvas}
        className={`paint-canvas is-${tool}`}
        height={HEIGHT}
        onPointerCancel={onPointerUp}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        ref={canvasRef}
        width={WIDTH}
      />
      <fieldset aria-label={t.color} className="paint-palette">
        {palette.map((swatch) => (
          <button
            aria-label={`${t.color} ${swatch}`}
            aria-pressed={color === swatch}
            className="paint-swatch"
            key={swatch}
            onClick={() => setColor(swatch)}
            style={{ background: swatch }}
            type="button"
          />
        ))}
        <input
          aria-label={t.color}
          className="paint-picker"
          onChange={(event) => setColor(event.target.value)}
          type="color"
          value={color}
        />
      </fieldset>
    </div>
  );
}
