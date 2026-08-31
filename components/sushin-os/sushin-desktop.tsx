'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { IconKind } from '@/content/icon-manifest';
import {
  dictionaries,
  resolveLocale,
  type Locale,
} from '@/content/i18n';
import {
  DesktopWindow,
  type WindowPosition,
  type WindowTransitionPhase,
} from './desktop-window';
import { CapabilitiesPanel } from './capabilities-panel';
import { ContactPanel } from './contact-panel';
import { CvPanel } from './cv-panel';
import { ProjectsPanel } from './projects-panel';
import { RandomFactPanel } from './random-fact-panel';
import { SocialPanel } from './social-panel';
import { SystemIcon } from './system-icon';
import { VladislavPanel } from './vladislav-panel';

type WindowId =
  | 'fact'
  | 'vladislav'
  | 'cv'
  | 'projects'
  | 'social'
  | 'contact'
  | 'skills';
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

const STORAGE_KEY = 'sushin-os.desktop.v3';
const LEGACY_STORAGE_KEYS = ['sushin-os.desktop.v2', 'sushin-os.desktop.v1'];
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
  cv: {
    open: false,
    minimized: false,
    maximized: false,
    zIndex: 3,
    position: { x: 178, y: 70 },
  },
  projects: {
    open: false,
    minimized: false,
    maximized: false,
    zIndex: 3,
    position: { x: 220, y: 110 },
  },
  social: {
    open: false,
    minimized: false,
    maximized: false,
    zIndex: 3,
    position: { x: 270, y: 84 },
  },
  contact: {
    open: false,
    minimized: false,
    maximized: false,
    zIndex: 3,
    position: { x: 318, y: 150 },
  },
  skills: {
    open: false,
    minimized: false,
    maximized: false,
    zIndex: 3,
    position: { x: 240, y: 92 },
  },
};

const initialWindowPhases: WindowPhaseMap = {
  fact: 'idle',
  vladislav: 'idle',
  cv: 'idle',
  projects: 'idle',
  social: 'idle',
  contact: 'idle',
  skills: 'idle',
};

const desktopIcons: Array<{
  id: string;
  label: string;
  kind: IconKind;
  window?: WindowId;
  align: 'left' | 'right';
}> = [
  { id: 'cv', label: 'CV', kind: 'cv', window: 'cv', align: 'left' },
  {
    id: 'projects',
    label: 'Projects',
    kind: 'projects',
    window: 'projects',
    align: 'left',
  },
  {
    id: 'social',
    label: 'Social Media',
    kind: 'social',
    window: 'social',
    align: 'left',
  },
  {
    id: 'profile',
    label: 'Vladislav',
    kind: 'vladislav',
    window: 'vladislav',
    align: 'right',
  },
  { id: 'news', label: 'Box News', kind: 'news', align: 'right' },
];

function readStoredDesktop(): {
  windows?: Partial<WindowMap>;
  theme?: Theme;
  wallpaper?: Wallpaper;
  locale?: Locale;
} | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as {
        windows?: Partial<WindowMap>;
        theme?: Theme;
        wallpaper?: Wallpaper;
        locale?: Locale;
      };
    }

    const legacy = LEGACY_STORAGE_KEYS.map((key) =>
      window.localStorage.getItem(key),
    ).find(Boolean);
    if (!legacy) return null;
    const parsed = JSON.parse(legacy) as {
      theme?: Theme;
      wallpaper?: Wallpaper;
      locale?: Locale;
      windows?: Partial<WindowMap>;
    };
    return {
      theme: parsed.theme,
      wallpaper: parsed.wallpaper,
      locale: parsed.locale,
      windows: parsed.windows,
    };
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
  const [locale, setLocale] = useState<Locale>('ru');
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
        const restoredWindows = (Object.keys(initialWindows) as WindowId[]).reduce<WindowMap>(
          (next, id) => {
            next[id] = { ...initialWindows[id], ...saved.windows?.[id] };
            return next;
          },
          {} as WindowMap,
        );
        zCounter.current = Math.max(
          5,
          ...Object.values(restoredWindows).map(
            (managedWindow) => managedWindow.zIndex,
          ),
        );
        setWindows(restoredWindows);
      }
      if (saved?.theme) setTheme(saved.theme);
      if (saved?.wallpaper) setWallpaper(saved.wallpaper);
      setLocale(resolveLocale(navigator.languages, saved?.locale));
      hasHydrated.current = true;
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ windows, theme, wallpaper, locale }),
      );
    } catch {
      // The desktop remains fully usable when browser storage is unavailable.
    }
  }, [locale, theme, wallpaper, windows]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.uiLocale = locale;
  }, [locale]);

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
    const language = locale === 'ru' ? 'ru-RU' : 'en-GB';
    const formatter = new Intl.DateTimeFormat(language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const dateFormatter = new Intl.DateTimeFormat(language, {
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
  }, [locale]);

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
  const dictionary = dictionaries[locale];
  const windowMenuItems: readonly { id: WindowId; label: string }[] = [
    { id: 'fact', label: dictionary.actions.randomFact },
    { id: 'vladislav', label: dictionary.desktop.profile },
    { id: 'cv', label: dictionary.desktop.cv },
    { id: 'projects', label: dictionary.desktop.projects },
    { id: 'skills', label: dictionary.desktop.skills },
    { id: 'social', label: dictionary.desktop.social },
    { id: 'contact', label: dictionary.desktop.write },
  ];

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
    const label = dictionary.desktop[
      item.id as 'cv' | 'projects' | 'social' | 'profile' | 'news'
    ];
    return (
      <button
        aria-label={
          item.window
            ? `${dictionary.desktop.open} ${label}`
            : `${label} — ${dictionary.desktop.next}`
        }
        className={`desktop-icon ${active ? 'is-open' : ''}`}
        disabled={!item.window}
        key={item.id}
        onClick={() => item.window && openWindow(item.window)}
        type="button"
      >
        <SystemIcon kind={item.kind} size={72} />
        <span>{label}</span>
        {!item.window && <small>{dictionary.desktop.next}</small>}
      </button>
    );
  };

  return (
    <main
      className={`sushin-desktop theme-${theme} wallpaper-${wallpaper}`}
      data-locale={locale}
    >
      <header className="os-menubar" ref={menuBarRef}>
        <div className="menu-left">
          <button
            aria-expanded={activeMenu === 'system'}
            aria-label={dictionary.controls.osMenu}
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
            {dictionary.menus.app}
          </button>
          <button
            aria-expanded={activeMenu === 'file'}
            className="menu-trigger menu-label"
            onClick={() => toggleMenu('file')}
            type="button"
          >
            {dictionary.menus.file}
          </button>
          <button
            aria-expanded={activeMenu === 'view'}
            className="menu-trigger menu-label"
            onClick={() => toggleMenu('view')}
            type="button"
          >
            {dictionary.menus.view}
          </button>
          <button
            aria-expanded={activeMenu === 'window'}
            className="menu-trigger menu-label"
            onClick={() => toggleMenu('window')}
            type="button"
          >
            {dictionary.menus.window}
          </button>
        </div>

        <div
          className="music-capsule"
          title={dictionary.music.loading}
        >
          <span className="capsule-play" aria-hidden="true">
            ▶
          </span>
          <div>
            <b>{dictionary.music.title}</b>
            <small>{dictionary.music.loading}</small>
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
            aria-label={dictionary.controls.language}
            className="language-toggle"
            onClick={() => setLocale((current) => (current === 'ru' ? 'en' : 'ru'))}
            type="button"
          >
            {dictionary.localeName}
          </button>
          <button
            aria-label={
              theme === 'dark-aqua'
                ? dictionary.controls.switchToAqua
                : dictionary.controls.switchToDark
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
              {dictionary.actions.about}
            </button>
            <button
              onClick={() => openWindow('fact')}
              role="menuitem"
              type="button"
            >
              <span />
              {dictionary.actions.randomFact}
            </button>
            <hr />
            <button onClick={resetDesktop} role="menuitem" type="button">
              <span />
              {dictionary.actions.resetOs}
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
              {dictionary.actions.openFact}
            </button>
            <button
              onClick={() => openWindow('vladislav')}
              role="menuitem"
              type="button"
            >
              <span />
              {dictionary.actions.openProfile}
            </button>
            <hr />
            <button
              disabled={!frontWindowId}
              onClick={() => frontWindowId && closeWindow(frontWindowId)}
              role="menuitem"
              type="button"
            >
              <span />
              {dictionary.actions.closeFront}
            </button>
          </div>
        )}

        {activeMenu === 'view' && (
          <div className="os-menu is-view" role="menu">
            <small>{dictionary.controls.appearance.toUpperCase()}</small>
            <button
              aria-checked={theme === 'aqua'}
              onClick={() => chooseTheme('aqua')}
              role="menuitemradio"
              type="button"
            >
              <span>{theme === 'aqua' ? '✓' : ''}</span>
              {dictionary.controls.aqua}
            </button>
            <button
              aria-checked={theme === 'dark-aqua'}
              onClick={() => chooseTheme('dark-aqua')}
              role="menuitemradio"
              type="button"
            >
              <span>{theme === 'dark-aqua' ? '✓' : ''}</span>
              {dictionary.controls.darkAqua}
            </button>
            <hr />
            <small>{dictionary.controls.wallpaper.toUpperCase()}</small>
            <button
              aria-checked={wallpaper === 'day'}
              onClick={() => chooseWallpaper('day')}
              role="menuitemradio"
              type="button"
            >
              <span>{wallpaper === 'day' ? '✓' : ''}</span>
              {dictionary.controls.day}
            </button>
            <button
              aria-checked={wallpaper === 'night'}
              onClick={() => chooseWallpaper('night')}
              role="menuitemradio"
              type="button"
            >
              <span>{wallpaper === 'night' ? '✓' : ''}</span>
              {dictionary.controls.night}
            </button>
          </div>
        )}

        {activeMenu === 'window' && (
          <div className="os-menu is-window" role="menu">
            {windowMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => openWindow(item.id)}
                role="menuitem"
                type="button"
              >
                <span>
                  {windows[item.id].open && !windows[item.id].minimized ? '✓' : ''}
                </span>
                {item.label}
              </button>
            ))}
            <hr />
            <button onClick={resetDesktop} role="menuitem" type="button">
              <span />
              {dictionary.actions.resetDesktop}
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
          aria-label={dictionary.actions.openFact}
          className={`desktop-fact-object ${windows.fact.open && !windows.fact.minimized ? 'is-open' : ''}`}
          onClick={() => openWindow('fact')}
          type="button"
        >
          <span className="desktop-fact-ring" aria-hidden="true" />
          <SystemIcon kind="facts" size={106} />
          <strong>Random Fact</strong>
          <small>{dictionary.desktop.open.toUpperCase()}</small>
        </button>

        {windows.fact.open && (
          <DesktopWindow
            active={frontWindowId === 'fact'}
            className="fact-window"
            desktopRef={desktopRef}
            id="fact"
            locale={locale}
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
            <RandomFactPanel locale={locale} />
          </DesktopWindow>
        )}

        {windows.vladislav.open && (
          <DesktopWindow
            active={frontWindowId === 'vladislav'}
            className="profile-window"
            desktopRef={desktopRef}
            id="vladislav"
            locale={locale}
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
            title={dictionary.desktop.profile}
            zIndex={windows.vladislav.zIndex}
          >
            <VladislavPanel
              locale={locale}
              onOpenCv={() => openWindow('cv')}
              onOpenProjects={() => openWindow('projects')}
            />
          </DesktopWindow>
        )}

        {windows.cv.open && (
          <DesktopWindow
            active={frontWindowId === 'cv'}
            className="cv-window"
            desktopRef={desktopRef}
            id="cv"
            locale={locale}
            maximized={windows.cv.maximized}
            minimized={windows.cv.minimized}
            mobile={isMobile}
            onClose={() => closeWindow('cv')}
            onFocus={() => focusWindow('cv')}
            onMinimize={() => minimizeWindow('cv')}
            onMove={(position) => updateWindow('cv', { position })}
            onToggleMaximize={() =>
              updateWindow('cv', { maximized: !windows.cv.maximized })
            }
            phase={windowPhases.cv}
            position={windows.cv.position}
            title={dictionary.career.cvTitle}
            zIndex={windows.cv.zIndex}
          >
            <CvPanel locale={locale} />
          </DesktopWindow>
        )}

        {windows.projects.open && (
          <DesktopWindow
            active={frontWindowId === 'projects'}
            className="projects-window"
            desktopRef={desktopRef}
            id="projects"
            locale={locale}
            maximized={windows.projects.maximized}
            minimized={windows.projects.minimized}
            mobile={isMobile}
            onClose={() => closeWindow('projects')}
            onFocus={() => focusWindow('projects')}
            onMinimize={() => minimizeWindow('projects')}
            onMove={(position) => updateWindow('projects', { position })}
            onToggleMaximize={() =>
              updateWindow('projects', {
                maximized: !windows.projects.maximized,
              })
            }
            phase={windowPhases.projects}
            position={windows.projects.position}
            title={dictionary.career.projectsTitle}
            zIndex={windows.projects.zIndex}
          >
            <ProjectsPanel locale={locale} />
          </DesktopWindow>
        )}

        {windows.skills.open && (
          <DesktopWindow
            active={frontWindowId === 'skills'}
            className="skills-window"
            desktopRef={desktopRef}
            id="skills"
            locale={locale}
            maximized={windows.skills.maximized}
            minimized={windows.skills.minimized}
            mobile={isMobile}
            onClose={() => closeWindow('skills')}
            onFocus={() => focusWindow('skills')}
            onMinimize={() => minimizeWindow('skills')}
            onMove={(position) => updateWindow('skills', { position })}
            onToggleMaximize={() =>
              updateWindow('skills', { maximized: !windows.skills.maximized })
            }
            phase={windowPhases.skills}
            position={windows.skills.position}
            title={dictionary.desktop.skills}
            zIndex={windows.skills.zIndex}
          >
            <CapabilitiesPanel locale={locale} />
          </DesktopWindow>
        )}

        {windows.social.open && (
          <DesktopWindow
            active={frontWindowId === 'social'}
            className="social-window"
            desktopRef={desktopRef}
            id="social"
            locale={locale}
            maximized={windows.social.maximized}
            minimized={windows.social.minimized}
            mobile={isMobile}
            onClose={() => closeWindow('social')}
            onFocus={() => focusWindow('social')}
            onMinimize={() => minimizeWindow('social')}
            onMove={(position) => updateWindow('social', { position })}
            onToggleMaximize={() =>
              updateWindow('social', { maximized: !windows.social.maximized })
            }
            phase={windowPhases.social}
            position={windows.social.position}
            title={dictionary.career.socialTitle}
            zIndex={windows.social.zIndex}
          >
            <SocialPanel locale={locale} />
          </DesktopWindow>
        )}

        {windows.contact.open && (
          <DesktopWindow
            active={frontWindowId === 'contact'}
            className="contact-window"
            desktopRef={desktopRef}
            id="contact"
            locale={locale}
            maximized={windows.contact.maximized}
            minimized={windows.contact.minimized}
            mobile={isMobile}
            onClose={() => closeWindow('contact')}
            onFocus={() => focusWindow('contact')}
            onMinimize={() => minimizeWindow('contact')}
            onMove={(position) => updateWindow('contact', { position })}
            onToggleMaximize={() =>
              updateWindow('contact', { maximized: !windows.contact.maximized })
            }
            phase={windowPhases.contact}
            position={windows.contact.position}
            title={dictionary.career.contactTitle}
            zIndex={windows.contact.zIndex}
          >
            <ContactPanel locale={locale} />
          </DesktopWindow>
        )}

        <nav aria-label="Sushin OS Dock" className="os-dock">
          <button
            aria-label={
              windows.vladislav.minimized
                ? dictionary.actions.restoreAbout
                : dictionary.actions.about
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
              {windows.vladislav.minimized
                ? dictionary.actions.restoreAbout
                : dictionary.actions.about}
            </span>
            <SystemIcon kind="about" size={58} />
          </button>
          <button
            aria-label={dictionary.desktop.write}
            className={`${windows.contact.open ? 'is-running' : ''} ${windows.contact.minimized ? 'is-minimized-app' : ''}`}
            data-dock-index="1"
            onBlur={() => setDockHoverIndex(null)}
            onClick={() => openWindow('contact')}
            onFocus={() => setDockHoverIndex(1)}
            onPointerEnter={() => setDockHoverIndex(1)}
            onPointerLeave={() => setDockHoverIndex(null)}
            style={dockMotionStyle(1)}
            type="button"
          >
            <span className="dock-tooltip">{dictionary.desktop.write}</span>
            <SystemIcon kind="write" size={58} />
          </button>
          <button
            aria-label={dictionary.desktop.skills}
            className={`${windows.skills.open ? 'is-running' : ''} ${windows.skills.minimized ? 'is-minimized-app' : ''}`}
            data-dock-index="2"
            onBlur={() => setDockHoverIndex(null)}
            onClick={() => openWindow('skills')}
            onFocus={() => setDockHoverIndex(2)}
            onPointerEnter={() => setDockHoverIndex(2)}
            onPointerLeave={() => setDockHoverIndex(null)}
            style={dockMotionStyle(2)}
            type="button"
          >
            <span className="dock-tooltip">{dictionary.desktop.skills}</span>
            <SystemIcon kind="skills" size={58} />
          </button>
          <span className="dock-separator" aria-hidden="true" />
          {factDockVisible && (
            <button
              aria-label={dictionary.actions.restoreFact}
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
              <span className="dock-tooltip">{dictionary.actions.restoreFact}</span>
              <SystemIcon kind="facts" size={54} />
            </button>
          )}
          <button
            aria-label={`${dictionary.desktop.news} — ${dictionary.desktop.next}`}
            data-dock-index={newsDockIndex}
            disabled
            onPointerEnter={() => setDockHoverIndex(newsDockIndex)}
            onPointerLeave={() => setDockHoverIndex(null)}
            style={dockMotionStyle(newsDockIndex)}
            type="button"
          >
            <span className="dock-tooltip">{dictionary.desktop.news}</span>
            <SystemIcon kind="news" size={54} />
          </button>
        </nav>

        <span className="wallpaper-credit">
          {dictionary.desktop.wallpaperCredit}
        </span>
      </div>
    </main>
  );
}
