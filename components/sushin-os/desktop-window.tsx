'use client';

import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';
import { useRef } from 'react';

export type WindowPosition = { x: number; y: number };
export type WindowTransitionPhase =
  | 'idle'
  | 'opening'
  | 'closing'
  | 'minimizing'
  | 'restoring';

type DesktopWindowProps = {
  id: string;
  title: string;
  position: WindowPosition;
  zIndex: number;
  active: boolean;
  maximized: boolean;
  minimized: boolean;
  phase: WindowTransitionPhase;
  mobile: boolean;
  desktopRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  className?: string;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onMove: (position: WindowPosition) => void;
  onToggleMaximize: () => void;
};

type DragOrigin = {
  pointerX: number;
  pointerY: number;
  windowX: number;
  windowY: number;
};

export function DesktopWindow({
  id,
  title,
  position,
  zIndex,
  active,
  maximized,
  minimized,
  phase,
  mobile,
  desktopRef,
  children,
  className = '',
  onClose,
  onMinimize,
  onFocus,
  onMove,
  onToggleMaximize,
}: DesktopWindowProps) {
  const windowRef = useRef<HTMLDialogElement | null>(null);
  const dragOrigin = useRef<DragOrigin | null>(null);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      mobile ||
      maximized ||
      event.button !== 0 ||
      (event.target as HTMLElement).closest('button')
    )
      return;

    onFocus();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOrigin.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      windowX: position.x,
      windowY: position.y,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = dragOrigin.current;
    const desktop = desktopRef.current;
    const element = windowRef.current;
    if (!origin || !desktop || !element) return;

    const desktopRect = desktop.getBoundingClientRect();
    const windowRect = element.getBoundingClientRect();
    const nextX = origin.windowX + event.clientX - origin.pointerX;
    const nextY = origin.windowY + event.clientY - origin.pointerY;
    const maxX = Math.max(12, desktopRect.width - windowRect.width - 12);
    const maxY = Math.max(12, desktopRect.height - windowRect.height - 88);

    onMove({
      x: Math.min(Math.max(12, nextX), maxX),
      y: Math.min(Math.max(12, nextY), maxY),
    });
  };

  const releasePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragOrigin.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const style = {
    '--window-x': `${position.x}px`,
    '--window-y': `${position.y}px`,
    zIndex,
  } as CSSProperties;

  return (
    <dialog
      aria-label={title}
      aria-hidden={minimized}
      className={`os-window ${active ? 'is-active' : ''} ${maximized ? 'is-maximized' : ''} ${minimized ? 'is-minimized' : ''} is-${phase} ${className}`}
      data-window={id}
      inert={minimized ? true : undefined}
      onFocusCapture={onFocus}
      open
      ref={windowRef}
      style={style}
    >
      <div
        className="os-window-titlebar"
        onDoubleClick={onToggleMaximize}
        onPointerCancel={releasePointer}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={releasePointer}
      >
        <div className="traffic-lights" aria-label="Управление окном">
          <button
            aria-label={`Закрыть ${title}`}
            className="traffic-close"
            onClick={onClose}
            type="button"
          />
          <button
            aria-label={`Свернуть ${title}`}
            className="traffic-minimize"
            onClick={onMinimize}
            type="button"
          />
          <button
            aria-label={
              maximized ? `Восстановить ${title}` : `Развернуть ${title}`
            }
            className="traffic-zoom"
            onClick={onToggleMaximize}
            type="button"
          />
        </div>
        <strong>{title}</strong>
        <span aria-hidden="true" className="titlebar-spacer" />
      </div>
      <div className="os-window-content">{children}</div>
    </dialog>
  );
}
