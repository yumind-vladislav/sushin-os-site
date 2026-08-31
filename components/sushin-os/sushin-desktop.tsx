'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { IconKind } from '@/content/icon-manifest';
import {
  DesktopWindow,
  type WindowPosition,
  type WindowTransitionPhase,
} from './desktop-window';
import { RandomFactPanel } from './random-fact-panel';
import { SystemIcon } from './system-icon';
import { VladislavPanel } from './vladislav-panel';

type WindowId = 'fact' | 'vladislav';
type Theme = 'aqua' | 'dark-aqua';
type Wallpaper = 'day' | 'night';
type MenuId = 'system' | 'file' | 'view' | 'window';

type ManagedWindow = {
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  position: WindowPosition;
};

type WindowMap = Record<WindowId, ManagedWindow>;
type WindowPhaseMap = Record<WindowId, WindowTransitionPhase>;

const STORAGE_KEY = 'sushin-os.desktop.v1';
const WINDOW_MOTION_MS = 420;
const WINDOW_CLOSE_MS = 240;

const initialWindows: WindowMap = {
  fact: {
    open: true,
    minimized: false,
    maximized: false,
    zIndex: 4,
    position: { x: 356, y: 96 },
  },
  vladislav: {
    open: false,
    minimized: false,
    maximized: false,
    zIndex: 3,
    position: { x: 126, y: 138 },
  },
};

const initialWindowPhases: WindowPhaseMap = {
  fact: 'idle',
  vladislav: 'idle',
};

const desktopIcons: Array<{
  id: string;
  label: string;
  kind: IconKind;
  window?: WindowId;
  align: 'left' | 'right';
}> = [
  { id: 'cv', label: 'CV', kind: 'cv', align: 'left' },
  { id: 'projects', label: 'Projects', kind: 'projects', align: 'left' },
  { id: 'social', label: 'Social Media', kind: 'social', align: 'left' },
  {
    id: 'vladislav',
    label: 'Vladislav',
    kind: 'vladislav',
    window: 'vladislav',
    align: 'right',
  },
  { id: 'news', label: 'Box News', kind: 'news', align: 'right' },
];

function readStoredDesktop(): {
  windows?: WindowMap;
  theme?: Theme;
  wallpaper?: Wallpaper;
} | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored
      ? (JSON.parse(stored) as {
          windows?: WindowMap;
          theme?: Theme;
          wallpaper?: Wallpaper;
        })
      : null;
  } catch {
    return null;
  }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function SushinDesktop() {
  const desktopRef = useRef<HTMLDivElement | null>(null);
  const menuBarRef = useRef<HTMLElement | null>(null);
  const zCounter = useRef(5);
  const hasHydrated = useRef(false);
  const transitionTimers = useRef<Partial<Record<WindowId, number>>>({});
  const [windows, setWindows] = useState<WindowMap>(initialWindows);
  const [windowPhases, setWindowPhases] =
    useState<WindowPhaseMap>(initialWindowPhases);
  const [theme, setTheme] = useState<Theme>('dark-aqua');
  const [wallpaper, setWallpaper] = useState<Wallpaper>('night');
  const [isMobile, setIsMobile] = useState(false);
  const [clock, setClock] = useState({
    time: '--:--',
    date: '—',
    zone: 'LOCAL',
  });
  const [activeMenu, setActiveMenu] = useState<MenuId | null>(null);
  const [dockHoverIndex, setDockHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const saved = readStoredDesktop();
      if (saved?.windows) {
        zCounter.current = Math.max(
          5,
          ...Object.values(saved.windows).map(
            (managedWindow) => managedWindow.zIndex,
          ),
        );
        setWindows(saved.windows);
      }
      if (saved?.theme) setTheme(saved.theme);
      if (saved?.wallpaper) setWallpaper(saved.wallpaper);
      hasHydrated.current = true;
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ windows, theme, wallpaper }),
    );
  }, [theme, wallpaper, windows]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)');
    const syncMode = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      if (mobile) {
        setActiveMenu((current) => (current === 'system' ? current : null));
        setWindows((current) => {
          const visible = (Object.keys(current) as WindowId[])
            .filter((id) => current[id].open && !current[id].minimized)
            .sort((a, b) => current[b].zIndex - current[a].zIndex);
          if (visible.length < 2) return current;
          const keep = visible[0];
          return (Object.keys(current) as WindowId[]).reduce<WindowMap>(
            (next, id) => {
              next[id] = { ...current[id], open: id === keep };
              return next;
            },
            {} as WindowMap,
          );
        });
      }
    };
    const initialSync = window.setTimeout(syncMode, 0);
    media.addEventListener('change', syncMode);
    return () => {
      window.clearTimeout(initialSync);
      media.removeEventListener('change', syncMode);
    };
  }, []);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
    const zone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';
    const updateClock = () => {
      const now = new Date();
      setClock({
        time: formatter.format(now),
        date: dateFormatter.format(now),
        zone,
      });
    };
    updateClock();
    const timer = window.setInterval(updateClock, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const closeMenu = (event: globalThis.PointerEvent) => {
      if (!menuBarRef.current?.contains(event.target as Node))
        setActiveMenu(null);
    };
    const closeMenuWithKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveMenu(null);
    };
    document.addEventListener('pointerdown', closeMenu);
    document.addEventListener('keydown', closeMenuWithKeyboard);
    return () => {
      document.removeEventListener('pointerdown', closeMenu);
      document.removeEventListener('keydown', closeMenuWithKeyboard);
    };
  }, []);

  useEffect(
    () => () => {
      Object.values(transitionTimers.current).forEach((timer) => {
        if (timer) window.clearTimeout(timer);
      });
    },
    [],
  );

  const clearWindowTimer = (id: WindowId) => {
    const timer = transitionTimers.current[id];
    if (timer) window.clearTimeout(timer);
    delete transitionTimers.current[id];
  };

  const settleWindowPhase = (
    id: WindowId,
    duration = WINDOW_MOTION_MS,
    after?: () => void,
  ) => {
    clearWindowTimer(id);
    if (prefersReducedMotion()) {
      after?.();
      setWindowPhases((current) => ({ ...current, [id]: 'idle' }));
      return;
    }

    transitionTimers.current[id] = window.setTimeout(() => {
      after?.();
      setWindowPhases((current) => ({ ...current, [id]: 'idle' }));
      delete transitionTimers.current[id];
    }, duration);
  };

  const focusWindow = (id: WindowId) => {
    const nextZ = ++zCounter.current;
    setWindows((current) => ({
      ...current,
      [id]: { ...current[id], zIndex: nextZ },
    }));
  };

  const openWindow = (id: WindowId) => {
    const nextZ = ++zCounter.current;
    const phase: WindowTransitionPhase = !windows[id].open
      ? 'opening'
      : windows[id].minimized
        ? 'restoring'
        : 'idle';
    clearWindowTimer(id);
    setWindowPhases((current) => ({ ...current, [id]: phase }));
    setWindows((current) => {
      const next = { ...current };
      if (isMobile) {
        (Object.keys(next) as WindowId[]).forEach((windowId) => {
          if (windowId !== id)
            next[windowId] = { ...next[windowId], open: false };
        });
      }
      next[id] = {
        ...next[id],
        open: true,
        minimized: false,
        zIndex: nextZ,
      };
      return next;
    });
    if (phase !== 'idle') settleWindowPhase(id);
    setActiveMenu(null);
  };

  const closeWindow = (id: WindowId) => {
    clearWindowTimer(id);
    if (prefersReducedMotion()) {
      setWindows((current) => ({
        ...current,
        [id]: { ...current[id], open: false, minimized: false },
      }));
      return;
    }

    setWindowPhases((current) => ({ ...current, [id]: 'closing' }));
    settleWindowPhase(id, WINDOW_CLOSE_MS, () => {
      setWindows((current) => ({
        ...current,
        [id]: { ...current[id], open: false, minimized: false },
      }));
    });
    setActiveMenu(null);
  };

  const minimizeWindow = (id: WindowId) => {
    clearWindowTimer(id);
    setWindowPhases((current) => ({ ...current, [id]: 'minimizing' }));
    setWindows((current) => ({
      ...current,
      [id]: { ...current[id], minimized: true },
    }));
    settleWindowPhase(id);
    setActiveMenu(null);
  };

  const updateWindow = (id: WindowId, patch: Partial<ManagedWindow>) => {
    setWindows((current) => ({
      ...current,
      [id]: { ...current[id], ...patch },
    }));
  };

  const resetDesktop = () => {
    (Object.keys(transitionTimers.current) as WindowId[]).forEach(
      clearWindowTimer,
    );
    zCounter.current = 5;
    setWindows(initialWindows);
    setWindowPhases(initialWindowPhases);
    setTheme('dark-aqua');
    setWallpaper('night');
    setActiveMenu(null);
  };

  const toggleMenu = (menu: MenuId) => {
    setActiveMenu((current) => (current === menu ? null : menu));
  };

  const chooseTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    setActiveMenu(null);
  };

  const chooseWallpaper = (nextWallpaper: Wallpaper) => {
    setWallpaper(nextWallpaper);
    setActiveMenu(null);
  };

  const visibleWindows = (Object.keys(windows) as WindowId[])
    .filter((id) => windows[id].open && !windows[id].minimized)
    .sort((a, b) => windows[b].zIndex - windows[a].zIndex);
  const frontWindowId = visibleWindows[0] ?? null;
  const factDockVisible = windows.fact.open && windows.fact.minimized;
  const newsDockIndex = factDockVisible ? 4 : 3;

  const dockMotionStyle = (index: number) => {
    const active = dockHoverIndex === index;
    return {
      '--dock-scale': active ? 1.14 : 1,
      '--dock-lift': active ? '-8px' : '0px',
    } as CSSProperties;
  };

  const renderDesktopIcon = (item: (typeof desktopIcons)[number]) => {
    const active = item.window
      ? windows[item.window].open && !windows[item.window].minimized
      : false;
    return (
      <button
        aria-label={
          item.window
            ? `Открыть ${item.label}`
            : `${item.label} — следующий этап`
        }
        className={`desktop-icon ${active ? 'is-open' : ''}`}
        disabled={!item.window}
        key={item.id}
        onClick={() => item.window && openWindow(item.window)}
        type="button"
      >
        <SystemIcon kind={item.kind} size={72} />
        <span>{item.label}</span>
        {!item.window && <small>NEXT</small>}
      </button>
    );
  };

  return (
    <main className={`sushin-desktop theme-${theme} wallpaper-${wallpaper}`}>
      <header className="os-menubar" ref={menuBarRef}>
        <div className="menu-left">
          <button
            aria-expanded={activeMenu === 'system'}
            aria-label="Меню Sushin OS"
            className="system-menu-trigger"
            onClick={() => toggleMenu('system')}
            type="button"
          >
            <span aria-hidden="true" className="os-mark" />
          </button>
          <button
            aria-expanded={activeMenu === 'system'}
            className="menu-trigger menu-app-trigger"
            onClick={() => toggleMenu('system')}
            type="button"
          >
            Vladislav
          </button>
          <button
            aria-expanded={activeMenu === 'file'}
            className="menu-trigger menu-label"
            onClick={() => toggleMenu('file')}
            type="button"
          >
            File
          </button>
          <button
            aria-expanded={activeMenu === 'view'}
            className="menu-trigger menu-label"
            onClick={() => toggleMenu('view')}
            type="button"
          >
            View
          </button>
          <button
            aria-expanded={activeMenu === 'window'}
            className="menu-trigger menu-label"
            onClick={() => toggleMenu('window')}
            type="button"
          >
            Window
          </button>
        </div>

        <div
          className="music-capsule"
          title="Spotify Embed — следующий вертикальный срез"
        >
          <span className="capsule-play" aria-hidden="true">
            ▶
          </span>
          <div>
            <b>MUSIC UTILITY</b>
            <small>SPOTIFY · NEXT SLICE</small>
          </div>
          <span className="capsule-eq" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>

        <div className="menu-right">
          <button
            aria-label={
              theme === 'dark-aqua' ? 'Включить Aqua' : 'Включить Dark Aqua'
            }
            className="appearance-toggle"
            onClick={() =>
              setTheme((current) =>
                current === 'dark-aqua' ? 'aqua' : 'dark-aqua',
              )
            }
            type="button"
          >
            ◐
          </button>
          <span className="timezone-label" title={clock.zone}>
            {clock.zone.split('/').at(-1)?.replaceAll('_', ' ')}
          </span>
          <span>{clock.date}</span>
          <strong>{clock.time}</strong>
        </div>

        {activeMenu === 'system' && (
          <div className="os-menu is-system" role="menu">
            <button
              onClick={() => openWindow('vladislav')}
              role="menuitem"
              type="button"
            >
              <span />
              About Vladislav
            </button>
            <button
              onClick={() => openWindow('fact')}
              role="menuitem"
              type="button"
            >
              <span />
              Random Fact
            </button>
            <hr />
            <button onClick={resetDesktop} role="menuitem" type="button">
              <span />
              Reset Sushin OS
            </button>
          </div>
        )}

        {activeMenu === 'file' && (
          <div className="os-menu is-file" role="menu">
            <button
              onClick={() => openWindow('fact')}
              role="menuitem"
              type="button"
            >
              <span />
              Open Random Fact
            </button>
            <button
              onClick={() => openWindow('vladislav')}
              role="menuitem"
              type="button"
            >
              <span />
              Open Vladislav
            </button>
            <hr />
            <button
              disabled={!frontWindowId}
              onClick={() => frontWindowId && closeWindow(frontWindowId)}
              role="menuitem"
              type="button"
            >
              <span />
              Close Front Window
            </button>
          </div>
        )}

        {activeMenu === 'view' && (
          <div className="os-menu is-view" role="menu">
            <small>APPEARANCE</small>
            <button
              aria-checked={theme === 'aqua'}
              onClick={() => chooseTheme('aqua')}
              role="menuitemradio"
              type="button"
            >
              <span>{theme === 'aqua' ? '✓' : ''}</span>
              Aqua
            </button>
            <button
              aria-checked={theme === 'dark-aqua'}
              onClick={() => chooseTheme('dark-aqua')}
              role="menuitemradio"
              type="button"
            >
              <span>{theme === 'dark-aqua' ? '✓' : ''}</span>
              Dark Aqua
            </button>
            <hr />
            <small>WALLPAPER · LOCAL REFERENCE</small>
            <button
              aria-checked={wallpaper === 'day'}
              onClick={() => chooseWallpaper('day')}
              role="menuitemradio"
              type="button"
            >
              <span>{wallpaper === 'day' ? '✓' : ''}</span>
              Catalina Day
            </button>
            <button
              aria-checked={wallpaper === 'night'}
              onClick={() => chooseWallpaper('night')}
              role="menuitemradio"
              type="button"
            >
              <span>{wallpaper === 'night' ? '✓' : ''}</span>
              Catalina Night
            </button>
          </div>
        )}

        {activeMenu === 'window' && (
          <div className="os-menu is-window" role="menu">
            <button
              onClick={() => openWindow('fact')}
              role="menuitem"
              type="button"
            >
              <span>
                {windows.fact.open && !windows.fact.minimized ? '✓' : ''}
              </span>
              Random Fact
            </button>
            <button
              onClick={() => openWindow('vladislav')}
              role="menuitem"
              type="button"
            >
              <span>
                {windows.vladislav.open && !windows.vladislav.minimized
                  ? '✓'
                  : ''}
              </span>
              Vladislav
            </button>
            <hr />
            <button onClick={resetDesktop} role="menuitem" type="button">
              <span />
              Reset Desktop
            </button>
          </div>
        )}
      </header>

      <div className="desktop-stage" ref={desktopRef}>
        <div className="desktop-icon-stack is-left">
          {desktopIcons
            .filter((item) => item.align === 'left')
            .map(renderDesktopIcon)}
        </div>
        <div className="desktop-icon-stack is-right">
          {desktopIcons
            .filter((item) => item.align === 'right')
            .map(renderDesktopIcon)}
        </div>

        <button
          aria-label="Открыть Random Fact"
          className={`desktop-fact-object ${windows.fact.open && !windows.fact.minimized ? 'is-open' : ''}`}
          onClick={() => openWindow('fact')}
          type="button"
        >
          <span className="desktop-fact-ring" aria-hidden="true" />
          <SystemIcon kind="facts" size={106} />
          <strong>Random Fact</strong>
          <small>CLICK TO OPEN</small>
        </button>

        {windows.fact.open && (
          <DesktopWindow
            active={frontWindowId === 'fact'}
            className="fact-window"
            desktopRef={desktopRef}
            id="fact"
            maximized={windows.fact.maximized}
            minimized={windows.fact.minimized}
            mobile={isMobile}
            onClose={() => closeWindow('fact')}
            onFocus={() => focusWindow('fact')}
            onMinimize={() => minimizeWindow('fact')}
            onMove={(position) => updateWindow('fact', { position })}
            onToggleMaximize={() =>
              updateWindow('fact', { maximized: !windows.fact.maximized })
            }
            phase={windowPhases.fact}
            position={windows.fact.position}
            title="Random Fact"
            zIndex={windows.fact.zIndex}
          >
            <RandomFactPanel />
          </DesktopWindow>
        )}

        {windows.vladislav.open && (
          <DesktopWindow
            active={frontWindowId === 'vladislav'}
            className="profile-window"
            desktopRef={desktopRef}
            id="vladislav"
            maximized={windows.vladislav.maximized}
            minimized={windows.vladislav.minimized}
            mobile={isMobile}
            onClose={() => closeWindow('vladislav')}
            onFocus={() => focusWindow('vladislav')}
            onMinimize={() => minimizeWindow('vladislav')}
            onMove={(position) => updateWindow('vladislav', { position })}
            onToggleMaximize={() =>
              updateWindow('vladislav', {
                maximized: !windows.vladislav.maximized,
              })
            }
            phase={windowPhases.vladislav}
            position={windows.vladislav.position}
            title="Vladislav"
            zIndex={windows.vladislav.zIndex}
          >
            <VladislavPanel onOpenFact={() => openWindow('fact')} />
          </DesktopWindow>
        )}

        <nav aria-label="Sushin OS Dock" className="os-dock">
          <button
            aria-label={
              windows.vladislav.minimized ? 'Восстановить About' : 'About'
            }
            className={`${windows.vladislav.open ? 'is-running' : ''} ${windows.vladislav.minimized ? 'is-minimized-app' : ''}`}
            data-dock-index="0"
            onBlur={() => setDockHoverIndex(null)}
            onClick={() => openWindow('vladislav')}
            onFocus={() => setDockHoverIndex(0)}
            onPointerEnter={() => setDockHoverIndex(0)}
            onPointerLeave={() => setDockHoverIndex(null)}
            style={dockMotionStyle(0)}
            type="button"
          >
            <span className="dock-tooltip">
              {windows.vladislav.minimized ? 'Restore About' : 'About'}
            </span>
            <SystemIcon kind="about" size={58} />
          </button>
          <button
            aria-label="Write to Me — следующий этап"
            data-dock-index="1"
            disabled
            onPointerEnter={() => setDockHoverIndex(1)}
            onPointerLeave={() => setDockHoverIndex(null)}
            style={dockMotionStyle(1)}
            type="button"
          >
            <span className="dock-tooltip">Write to Me · next</span>
            <SystemIcon kind="write" size={58} />
          </button>
          <button
            aria-label="What I Can Do — следующий этап"
            data-dock-index="2"
            disabled
            onPointerEnter={() => setDockHoverIndex(2)}
            onPointerLeave={() => setDockHoverIndex(null)}
            style={dockMotionStyle(2)}
            type="button"
          >
            <span className="dock-tooltip">What I Can Do · next</span>
            <SystemIcon kind="skills" size={58} />
          </button>
          <span className="dock-separator" aria-hidden="true" />
          {factDockVisible && (
            <button
              aria-label="Восстановить Random Fact"
              className="is-running is-minimized-app"
              data-dock-index="3"
              onBlur={() => setDockHoverIndex(null)}
              onClick={() => openWindow('fact')}
              onFocus={() => setDockHoverIndex(3)}
              onPointerEnter={() => setDockHoverIndex(3)}
              onPointerLeave={() => setDockHoverIndex(null)}
              style={dockMotionStyle(3)}
              type="button"
            >
              <span className="dock-tooltip">Restore Random Fact</span>
              <SystemIcon kind="facts" size={54} />
            </button>
          )}
          <button
            aria-label="Box News — следующий этап"
            data-dock-index={newsDockIndex}
            disabled
            onPointerEnter={() => setDockHoverIndex(newsDockIndex)}
            onPointerLeave={() => setDockHoverIndex(null)}
            style={dockMotionStyle(newsDockIndex)}
            type="button"
          >
            <span className="dock-tooltip">Box News · next</span>
            <SystemIcon kind="news" size={54} />
          </button>
        </nav>

        <span className="wallpaper-credit">
          CATALINA {wallpaper.toUpperCase()} REFERENCE · LOCALHOST ONLY
        </span>
      </div>
    </main>
  );
}
