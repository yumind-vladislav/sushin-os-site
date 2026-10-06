'use client';

import { Search } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import MorphGallery from '@/components/ui/morph-gallery';
import {
  appDefinitions,
  appIds,
  dockApps,
  type AppId,
  type MenuAction,
  type MenuItem,
} from '@/content/apps';
import type { IconKind } from '@/content/icon-manifest';
import { dictionaries, resolveLocale, type Locale } from '@/content/i18n';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { dispatchAppCommand } from '@/lib/app-commands';
import type { AssistantAction } from '@/lib/assistant';
import type { BoxNewsSummary } from '@/lib/box-news';
import {
  createVisitorClockFormatter,
  detectVisitorTimeZone,
  fallbackTimeZone,
} from '@/lib/time-zone';
import {
  automaticWallpaperFor,
  isWallpaperId,
  wallpaperIndex,
  wallpapers,
  type WallpaperId,
} from '@/lib/wallpapers';
import { ApplicationsApp } from './apps/applications-app';
import { CalculatorApp } from './apps/calculator-app';
import { CalendarApp } from './apps/calendar-app';
import { IpodApp } from './apps/ipod-app';
import { MinesweeperApp } from './apps/minesweeper-app';
import { PaintApp } from './apps/paint-app';
import { StickiesApp } from './apps/stickies-app';
import { SynthApp } from './apps/synth-app';
import { VideosApp } from './apps/videos-app';
import { WinampApp } from './apps/winamp-app';
import { BoxNewsPanel } from './box-news-panel';
import { CapabilitiesPanel } from './capabilities-panel';
import { ContactPanel } from './contact-panel';
import { CvPanel } from './cv-panel';
import {
  DesktopWindow,
  type WindowPosition,
  type WindowTransitionPhase,
} from './desktop-window';
import { LegalFold } from './legal-fold';
import { MusicUtility } from './music-utility';
import { ProjectsPanel } from './projects-panel';
import { RandomFactPanel } from './random-fact-panel';
import { RoverAssistant, type AssistantRequest } from './rover-assistant';
import { SocialPanel } from './social-panel';
import { Spotlight } from './spotlight';
import { SystemIcon } from './system-icon';
import { VladislavPanel } from './vladislav-panel';

type Theme = 'aqua' | 'dark-aqua';
type MenuId = 'system' | 'app' | 'file' | 'view' | 'window' | `app:${string}`;

type ManagedWindow = {
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  position: WindowPosition;
};

type WindowMap = Record<AppId, ManagedWindow>;
type WindowPhaseMap = Record<AppId, WindowTransitionPhase>;

type StoredDesktop = {
  windows?: Partial<WindowMap>;
  theme?: Theme;
  wallpaperOverride?: WallpaperId | null;
  locale?: Locale;
  assistantVisible?: boolean;
};

const STORAGE_KEY = 'sushin-os.desktop.v6';
const LEGACY_STORAGE_KEYS = [
  'sushin-os.desktop.v5',
  'sushin-os.desktop.v4',
  'sushin-os.desktop.v3',
  'sushin-os.desktop.v2',
  'sushin-os.desktop.v1',
];
const WINDOW_MOTION_MS = 420;
const WINDOW_CLOSE_MS = 240;
const SLIDESHOW_MS = 15_000;

const initialWindows = appIds.reduce<WindowMap>((next, id) => {
  next[id] = {
    open: id === 'fact',
    minimized: false,
    maximized: false,
    zIndex: id === 'fact' ? 4 : 3,
    position: appDefinitions[id].position,
  };
  return next;
}, {} as WindowMap);

const initialWindowPhases = appIds.reduce<WindowPhaseMap>((next, id) => {
  next[id] = 'idle';
  return next;
}, {} as WindowPhaseMap);

const windowClassNames: Partial<Record<AppId, string>> = {
  fact: 'fact-window',
  vladislav: 'profile-window',
  cv: 'cv-window',
  projects: 'projects-window',
  skills: 'skills-window',
  social: 'social-window',
  contact: 'contact-window',
  news: 'news-window',
};

const desktopIcons: Array<{
  id: 'cv' | 'projects' | 'social' | 'profile' | 'news';
  kind: IconKind;
  window: AppId;
  align: 'left' | 'right';
}> = [
  { id: 'cv', kind: 'cv', window: 'cv', align: 'left' },
  { id: 'projects', kind: 'projects', window: 'projects', align: 'left' },
  { id: 'social', kind: 'social', window: 'social', align: 'left' },
  { id: 'profile', kind: 'vladislav', window: 'vladislav', align: 'right' },
  { id: 'news', kind: 'news', window: 'news', align: 'right' },
];

/** Dock keeps only the essentials; utilities live in the Applications folder. */
const pinnedDock: Array<{ id: AppId; kind: IconKind }> = [
  { id: 'vladislav', kind: 'about' },
  { id: 'contact', kind: 'write' },
  { id: 'skills', kind: 'skills' },
  { id: 'news', kind: 'news' },
];

// Stable reference: the gallery rebuilds its textures when the list changes.
const wallpaperItems = wallpapers.map(({ src, thumb, alt }) => ({ src, thumb, alt }));

const desktopMenus = {
  ru: { app: 'Sushin OS', slideshow: 'Слайд-шоу (каждые 15 с)', next: 'Следующие обои', search: 'Поиск…', assistantShow: 'Показать ассистента', assistantHide: 'Спрятать ассистента', minimize: 'Свернуть', close: 'Закрыть', ask: (title: string) => `Спросить Ровера про «${title}»`, askQuestion: (title: string) => `Что умеет приложение «${title}»?`, credit: 'ВРЕМЕННЫЕ ОБОИ · ТОЛЬКО LOCALHOST' },
  en: { app: 'Sushin OS', slideshow: 'Slideshow (every 15 s)', next: 'Next wallpaper', search: 'Search…', assistantShow: 'Show assistant', assistantHide: 'Hide assistant', minimize: 'Minimize', close: 'Close', ask: (title: string) => `Ask Rover about “${title}”`, askQuestion: (title: string) => `What can the “${title}” app do?`, credit: 'TEMPORARY WALLPAPERS · LOCALHOST ONLY' },
} as const;

function readStoredDesktop(): StoredDesktop | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as StoredDesktop;

    const legacy = LEGACY_STORAGE_KEYS.map((key) =>
      window.localStorage.getItem(key),
    ).find(Boolean);
    if (!legacy) return null;
    const parsed = JSON.parse(legacy) as {
      theme?: Theme;
      wallpaper?: string;
      wallpaperOverride?: string | null;
      locale?: Locale;
      windows?: Partial<WindowMap>;
    };
    const old = parsed.wallpaperOverride ?? parsed.wallpaper ?? null;
    return {
      theme: parsed.theme,
      wallpaperOverride: old === 'day' ? 'forest' : old === 'night' ? 'night-peak' : null,
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

function runHref(action: Extract<MenuAction, { type: 'href' }>) {
  const link = document.createElement('a');
  link.href = action.href;
  if (action.download) link.download = '';
  if (action.external) {
    link.target = '_blank';
    link.rel = 'noreferrer';
  }
  link.click();
}

export function SushinDesktop({
  boxNewsPosts,
}: {
  boxNewsPosts: readonly BoxNewsSummary[];
}) {
  const desktopRef = useRef<HTMLDivElement | null>(null);
  const menuBarRef = useRef<HTMLElement | null>(null);
  const zCounter = useRef(5);
  const hasHydrated = useRef(false);
  const transitionTimers = useRef<Partial<Record<AppId, number>>>({});
  const askCounter = useRef(0);
  const [windows, setWindows] = useState<WindowMap>(initialWindows);
  const [windowPhases, setWindowPhases] =
    useState<WindowPhaseMap>(initialWindowPhases);
  const [theme, setTheme] = useState<Theme>('dark-aqua');
  const [scheduledWallpaper, setScheduledWallpaper] =
    useState<WallpaperId>('night-peak');
  const [wallpaperOverride, setWallpaperOverride] =
    useState<WallpaperId | null>(null);
  const [locale, setLocale] = useState<Locale>('ru');
  const [isMobile, setIsMobile] = useState(false);
  const [clock, setClock] = useState({
    time: '--:--',
    date: '—',
    zone: fallbackTimeZone,
    zoneLabel: 'Moscow',
  });
  const [activeMenu, setActiveMenu] = useState<MenuId | null>(null);
  const [dockHoverIndex, setDockHoverIndex] = useState<number | null>(null);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [assistantVisible, setAssistantVisible] = useState(true);
  const [assistantRequest, setAssistantRequest] =
    useState<AssistantRequest | null>(null);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const saved = readStoredDesktop();
      if (saved?.windows) {
        const restoredWindows = appIds.reduce<WindowMap>((next, id) => {
          next[id] = { ...initialWindows[id], ...saved.windows?.[id] };
          return next;
        }, {} as WindowMap);
        zCounter.current = Math.max(
          5,
          ...Object.values(restoredWindows).map((item) => item.zIndex),
        );
        setWindows(restoredWindows);
      }
      if (saved?.theme) setTheme(saved.theme);
      if (saved && 'wallpaperOverride' in saved) {
        setWallpaperOverride(
          isWallpaperId(saved.wallpaperOverride) ? saved.wallpaperOverride : null,
        );
      }
      if (saved?.assistantVisible === false) setAssistantVisible(false);
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
        JSON.stringify({ windows, theme, wallpaperOverride, locale, assistantVisible }),
      );
    } catch {
      // The desktop remains fully usable when browser storage is unavailable.
    }
  }, [assistantVisible, locale, theme, wallpaperOverride, windows]);

  // Automatic mode starts on the day or night photo for the local hour, then
  // runs a Morph slideshow. Reduced motion and hidden tabs hold the frame.
  useEffect(() => {
    const initial = window.setTimeout(() => {
      setScheduledWallpaper(automaticWallpaperFor(new Date().getHours()));
    }, 0);
    const timer = window.setInterval(() => {
      if (document.hidden || prefersReducedMotion()) return;
      setScheduledWallpaper(
        (current) => wallpapers[(wallpaperIndex(current) + 1) % wallpapers.length].id,
      );
    }, SLIDESHOW_MS);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, []);

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
          const visible = appIds
            .filter((id) => current[id].open && !current[id].minimized)
            .sort((a, b) => current[b].zIndex - current[a].zIndex);
          if (visible.length < 2) return current;
          const keep = visible[0];
          return appIds.reduce<WindowMap>((next, id) => {
            next[id] = { ...current[id], open: id === keep };
            return next;
          }, {} as WindowMap);
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
    const formatter = createVisitorClockFormatter(
      locale,
      detectVisitorTimeZone(),
    );
    const updateClock = () => {
      setClock(formatter.format(new Date()));
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
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveMenu(null);
      const spotlightShortcut =
        (event.metaKey || event.ctrlKey) &&
        (event.key.toLowerCase() === 'k' || event.code === 'Space');
      if (spotlightShortcut) {
        event.preventDefault();
        setActiveMenu(null);
        setSpotlightOpen((current) => !current);
      }
    };
    document.addEventListener('pointerdown', closeMenu);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', closeMenu);
      document.removeEventListener('keydown', onKey);
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

  const clearWindowTimer = (id: AppId) => {
    const timer = transitionTimers.current[id];
    if (timer) window.clearTimeout(timer);
    delete transitionTimers.current[id];
  };

  const settleWindowPhase = (
    id: AppId,
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

  const focusWindow = (id: AppId) => {
    const nextZ = ++zCounter.current;
    setWindows((current) => ({
      ...current,
      [id]: { ...current[id], zIndex: nextZ },
    }));
  };

  const openWindow = (id: AppId) => {
    if (id === 'vladislav') trackAnalyticsEvent('profile_open', {});
    if (id === 'cv') trackAnalyticsEvent('cv_view', { format: 'html' });
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
        appIds.forEach((windowId) => {
          if (windowId !== id) next[windowId] = { ...next[windowId], open: false };
        });
      }
      next[id] = { ...next[id], open: true, minimized: false, zIndex: nextZ };
      return next;
    });
    if (phase !== 'idle') settleWindowPhase(id);
    setActiveMenu(null);
  };

  const closeWindow = (id: AppId) => {
    clearWindowTimer(id);
    setActiveMenu(null);
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
  };

  const minimizeWindow = (id: AppId) => {
    clearWindowTimer(id);
    setWindowPhases((current) => ({ ...current, [id]: 'minimizing' }));
    setWindows((current) => ({
      ...current,
      [id]: { ...current[id], minimized: true },
    }));
    settleWindowPhase(id);
    setActiveMenu(null);
  };

  const updateWindow = (id: AppId, patch: Partial<ManagedWindow>) => {
    setWindows((current) => ({
      ...current,
      [id]: { ...current[id], ...patch },
    }));
  };

  const resetDesktop = () => {
    appIds.forEach(clearWindowTimer);
    zCounter.current = 5;
    setWindows(initialWindows);
    setWindowPhases(initialWindowPhases);
    setTheme('dark-aqua');
    setScheduledWallpaper(automaticWallpaperFor(new Date().getHours()));
    setWallpaperOverride(null);
    setAssistantVisible(true);
    setActiveMenu(null);
  };

  const toggleMenu = (menu: MenuId) => {
    setActiveMenu((current) => (current === menu ? null : menu));
  };

  const wallpaper = wallpaperOverride ?? scheduledWallpaper;

  const nextWallpaper = useCallback(() => {
    setWallpaperOverride((current) => {
      const index = wallpaperIndex(current ?? scheduledWallpaper);
      return wallpapers[(index + 1) % wallpapers.length].id;
    });
    setActiveMenu(null);
  }, [scheduledWallpaper]);

  const visibleWindows = appIds
    .filter((id) => windows[id].open && !windows[id].minimized)
    .sort((a, b) => windows[b].zIndex - windows[a].zIndex);
  const frontWindowId = visibleWindows[0] ?? null;
  const dictionary = dictionaries[locale];
  const shell = desktopMenus[locale];

  const runAction = (action: MenuAction) => {
    setActiveMenu(null);
    if (action.type === 'open') openWindow(action.app);
    else if (action.type === 'href') runHref(action);
    else if (!frontWindowId) return;
    else if (action.type === 'command') dispatchAppCommand(frontWindowId, action.command);
    else if (action.type === 'minimize') minimizeWindow(frontWindowId);
    else if (action.type === 'close') closeWindow(frontWindowId);
  };

  const askAssistant = (question: string) => {
    setAssistantVisible(true);
    askCounter.current += 1;
    setAssistantRequest({ id: askCounter.current, question });
    setActiveMenu(null);
  };

  const handleAssistantAction = (action: AssistantAction) => {
    if (action.type === 'open') openWindow(action.app);
    if (action.type === 'wallpaper-next') nextWallpaper();
    if (action.type === 'theme-toggle')
      setTheme((current) => (current === 'dark-aqua' ? 'aqua' : 'dark-aqua'));
  };

  const appContent = (id: AppId): ReactNode => {
    switch (id) {
      case 'fact':
        return <RandomFactPanel locale={locale} />;
      case 'vladislav':
        return (
          <VladislavPanel
            locale={locale}
            onOpenCv={() => openWindow('cv')}
            onOpenProjects={() => openWindow('projects')}
          />
        );
      case 'cv':
        return <CvPanel locale={locale} />;
      case 'projects':
        return <ProjectsPanel locale={locale} />;
      case 'skills':
        return <CapabilitiesPanel locale={locale} />;
      case 'social':
        return <SocialPanel locale={locale} />;
      case 'contact':
        return <ContactPanel locale={locale} />;
      case 'news':
        return <BoxNewsPanel locale={locale} posts={boxNewsPosts} />;
      case 'applications':
        return <ApplicationsApp locale={locale} onOpen={openWindow} />;
      case 'stickies':
        return <StickiesApp locale={locale} />;
      case 'calendar':
        return <CalendarApp locale={locale} />;
      case 'calculator':
        return <CalculatorApp locale={locale} />;
      case 'minesweeper':
        return <MinesweeperApp locale={locale} />;
      case 'synth':
        return <SynthApp locale={locale} />;
      case 'paint':
        return <PaintApp locale={locale} />;
      case 'ipod':
        return <IpodApp locale={locale} />;
      case 'winamp':
        return <WinampApp locale={locale} />;
      case 'videos':
        return <VideosApp locale={locale} />;
    }
  };

  const renderMenuItems = (items: readonly MenuItem[]) =>
    items.map((item, index) =>
      item === 'separator' ? (
        <hr key={`separator-${index}`} />
      ) : (
        <button
          disabled={
            (item.action.type === 'command' ||
              item.action.type === 'minimize' ||
              item.action.type === 'close') &&
            !frontWindowId
          }
          key={item.label.en}
          onClick={() => runAction(item.action)}
          role="menuitem"
          type="button"
        >
          <span />
          {item.label[locale]}
          {item.shortcut && <kbd>{item.shortcut}</kbd>}
        </button>
      ),
    );

  const menuTrigger = (id: MenuId, label: string, className = 'menu-label') => (
    <button
      aria-expanded={activeMenu === id}
      aria-haspopup="menu"
      className={`menu-trigger ${className}`}
      onClick={() => toggleMenu(id)}
      onPointerEnter={() => activeMenu && activeMenu !== id && setActiveMenu(id)}
      type="button"
    >
      {label}
    </button>
  );

  const frontApp = frontWindowId ? appDefinitions[frontWindowId] : null;

  const windowMenuItems = appIds
    .filter((id) => !dockApps.includes(id) || windows[id].open)
    .map((id) => ({ id, label: appDefinitions[id].title[locale] }));

  const dockItems: Array<{ id: AppId; kind: IconKind; label: string; group: number }> = [
    ...pinnedDock.map((item) => ({
      ...item,
      label: appDefinitions[item.id].title[locale],
      group: 0,
    })),
    // Like Mac OS X: running utilities and minimized windows appear after the
    // separator, then the Applications folder.
    ...appIds
      .filter(
        (id) =>
          windows[id].open &&
          id !== 'applications' &&
          (dockApps.includes(id) || windows[id].minimized) &&
          !pinnedDock.some((item) => item.id === id),
      )
      .map((id) => ({
        id,
        kind: appDefinitions[id].icon,
        label: appDefinitions[id].title[locale],
        group: 1,
      })),
    {
      id: 'applications',
      kind: 'applications',
      label: appDefinitions.applications.title[locale],
      group: 2,
    },
  ];

  const dockMotionStyle = (index: number) => {
    const active = dockHoverIndex === index;
    return {
      '--dock-scale': active ? 1.14 : 1,
      '--dock-lift': active ? '-8px' : '0px',
    } as CSSProperties;
  };

  const renderDesktopIcon = (item: (typeof desktopIcons)[number]) => {
    const active = windows[item.window].open && !windows[item.window].minimized;
    const label = dictionary.desktop[item.id];
    return (
      <button
        aria-label={`${dictionary.desktop.open} ${label}`}
        className={`desktop-icon ${active ? 'is-open' : ''}`}
        key={item.id}
        onClick={() => openWindow(item.window)}
        type="button"
      >
        <SystemIcon kind={item.kind} size={64} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <main
      className={`sushin-desktop theme-${theme} wallpaper-${wallpaper}`}
      data-locale={locale}
    >
      <div aria-hidden="true" className="desktop-wallpaper">
        <MorphGallery
          arrows={false}
          duration={1600}
          height="100%"
          index={wallpaperIndex(wallpaper)}
          interactive={false}
          items={wallpaperItems}
          overlay={false}
          thumbnails={false}
        />
      </div>

      <header className="os-menubar" ref={menuBarRef}>
        <div className="menu-left">
          <div className="menu-slot">
            <button
              aria-expanded={activeMenu === 'system'}
              aria-haspopup="menu"
              aria-label={dictionary.controls.osMenu}
              className="system-menu-trigger"
              onClick={() => toggleMenu('system')}
              type="button"
            >
              <span aria-hidden="true" className="os-mark" />
            </button>
            {activeMenu === 'system' && (
              <div className="os-menu is-system" role="menu">
                <button onClick={() => openWindow('vladislav')} role="menuitem" type="button">
                  <span />
                  {dictionary.actions.about}
                </button>
                <button onClick={() => openWindow('fact')} role="menuitem" type="button">
                  <span />
                  {dictionary.actions.randomFact}
                </button>
                <hr />
                <button
                  onClick={() => {
                    setActiveMenu(null);
                    setSpotlightOpen(true);
                  }}
                  role="menuitem"
                  type="button"
                >
                  <span />
                  {shell.search}
                  <kbd>⌘K</kbd>
                </button>
                <button
                  onClick={() => {
                    setAssistantVisible((current) => !current);
                    setActiveMenu(null);
                  }}
                  role="menuitem"
                  type="button"
                >
                  <span />
                  {assistantVisible ? shell.assistantHide : shell.assistantShow}
                </button>
                <button onClick={nextWallpaper} role="menuitem" type="button">
                  <span />
                  {shell.next}
                </button>
                <hr />
                <button onClick={resetDesktop} role="menuitem" type="button">
                  <span />
                  {dictionary.actions.resetOs}
                </button>
              </div>
            )}
          </div>

          <div className="menu-slot">
            {menuTrigger('app', frontApp ? frontApp.title[locale] : shell.app, 'menu-app-trigger')}
            {activeMenu === 'app' && (
              <div className="os-menu" role="menu">
                {frontApp ? (
                  <>
                    <button
                      onClick={() => askAssistant(shell.askQuestion(frontApp.title[locale]))}
                      role="menuitem"
                      type="button"
                    >
                      <span />
                      {shell.ask(frontApp.title[locale])}
                    </button>
                    <hr />
                    <button onClick={() => minimizeWindow(frontApp.id)} role="menuitem" type="button">
                      <span />
                      {shell.minimize}
                    </button>
                    <button onClick={() => closeWindow(frontApp.id)} role="menuitem" type="button">
                      <span />
                      {shell.close}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => openWindow('vladislav')} role="menuitem" type="button">
                      <span />
                      {dictionary.actions.about}
                    </button>
                    <hr />
                    <button onClick={resetDesktop} role="menuitem" type="button">
                      <span />
                      {dictionary.actions.resetOs}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {frontApp ? (
            frontApp.menus.map((menu) => (
              <div className="menu-slot" key={menu.id}>
                {menuTrigger(`app:${menu.id}`, menu.label[locale])}
                {activeMenu === `app:${menu.id}` && (
                  <div className="os-menu" role="menu">
                    {renderMenuItems(menu.items)}
                  </div>
                )}
              </div>
            ))
          ) : (
            <>
              <div className="menu-slot">
                {menuTrigger('file', dictionary.menus.file)}
                {activeMenu === 'file' && (
                  <div className="os-menu" role="menu">
                    <button onClick={() => openWindow('fact')} role="menuitem" type="button">
                      <span />
                      {dictionary.actions.openFact}
                    </button>
                    <button onClick={() => openWindow('vladislav')} role="menuitem" type="button">
                      <span />
                      {dictionary.actions.openProfile}
                    </button>
                  </div>
                )}
              </div>
              <div className="menu-slot">
                {menuTrigger('view', dictionary.menus.view)}
                {activeMenu === 'view' && (
                  <div className="os-menu is-view" role="menu">
                    <small>{dictionary.controls.appearance.toUpperCase()}</small>
                    {(['aqua', 'dark-aqua'] as const).map((value) => (
                      <button
                        aria-checked={theme === value}
                        key={value}
                        onClick={() => {
                          setTheme(value);
                          setActiveMenu(null);
                        }}
                        role="menuitemradio"
                        type="button"
                      >
                        <span>{theme === value ? '✓' : ''}</span>
                        {value === 'aqua' ? dictionary.controls.aqua : dictionary.controls.darkAqua}
                      </button>
                    ))}
                    <hr />
                    <small>{dictionary.controls.wallpaper.toUpperCase()}</small>
                    <button
                      aria-checked={wallpaperOverride === null}
                      onClick={() => {
                        setScheduledWallpaper(automaticWallpaperFor(new Date().getHours()));
                        setWallpaperOverride(null);
                        setActiveMenu(null);
                      }}
                      role="menuitemradio"
                      type="button"
                    >
                      <span>{wallpaperOverride === null ? '✓' : ''}</span>
                      {shell.slideshow}
                    </button>
                    {wallpapers.map((item) => (
                      <button
                        aria-checked={wallpaperOverride === item.id}
                        key={item.id}
                        onClick={() => {
                          setWallpaperOverride(item.id);
                          setActiveMenu(null);
                        }}
                        role="menuitemradio"
                        type="button"
                      >
                        <span>{wallpaperOverride === item.id ? '✓' : ''}</span>
                        {item.label[locale]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="menu-slot">
            {menuTrigger('window', dictionary.menus.window)}
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
          </div>
        </div>

        <MusicUtility locale={locale} />

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
              setTheme((current) => (current === 'dark-aqua' ? 'aqua' : 'dark-aqua'))
            }
            type="button"
          >
            ◐
          </button>
          <span className="timezone-label" title={clock.zone}>
            {clock.zoneLabel}
          </span>
          <span>{clock.date}</span>
          <strong>{clock.time}</strong>
          <button
            aria-label={`${shell.search} (⌘K)`}
            className="spotlight-toggle"
            onClick={() => setSpotlightOpen((current) => !current)}
            title="⌘K"
            type="button"
          >
            <Search aria-hidden="true" size={14} />
          </button>
        </div>
      </header>

      <div className="desktop-stage" ref={desktopRef}>
        <div className="desktop-icon-stack is-left">
          {desktopIcons.filter((item) => item.align === 'left').map(renderDesktopIcon)}
        </div>
        <div className="desktop-icon-stack is-right">
          {desktopIcons.filter((item) => item.align === 'right').map(renderDesktopIcon)}
        </div>

        <button
          aria-label={dictionary.actions.openFact}
          className={`desktop-fact-object ${windows.fact.open && !windows.fact.minimized ? 'is-open' : ''}`}
          onClick={() => openWindow('fact')}
          type="button"
        >
          <span className="desktop-fact-ring" aria-hidden="true" />
          <SystemIcon kind="facts" size={96} />
          <strong>Random Fact</strong>
          <small>{dictionary.desktop.open.toUpperCase()}</small>
        </button>

        {appIds.map((id) =>
          windows[id].open ? (
            <DesktopWindow
              active={frontWindowId === id}
              className={windowClassNames[id] ?? `app-window app-${id}-window`}
              desktopRef={desktopRef}
              id={id}
              key={id}
              locale={locale}
              maximized={windows[id].maximized}
              minimized={windows[id].minimized}
              mobile={isMobile}
              onClose={() => closeWindow(id)}
              onFocus={() => focusWindow(id)}
              onMinimize={() => minimizeWindow(id)}
              onMove={(position) => updateWindow(id, { position })}
              onToggleMaximize={() =>
                updateWindow(id, { maximized: !windows[id].maximized })
              }
              phase={windowPhases[id]}
              position={windows[id].position}
              title={appDefinitions[id].title[locale]}
              zIndex={windows[id].zIndex}
            >
              {appContent(id)}
            </DesktopWindow>
          ) : null,
        )}

        <nav aria-label="Sushin OS Dock" className="os-dock">
          {dockItems.map((item, index) => {
            const state = windows[item.id];
            const separator = index > 0 && dockItems[index - 1].group !== item.group;
            return (
              <Fragment key={`${item.group}-${item.id}`}>
                {separator && <span className="dock-separator" aria-hidden="true" />}
                <button
                  aria-label={item.label}
                  className={`${state.open ? 'is-running' : ''} ${state.minimized ? 'is-minimized-app' : ''}`}
                  data-dock-index={index}
                  onBlur={() => setDockHoverIndex(null)}
                  onClick={() => openWindow(item.id)}
                  onFocus={() => setDockHoverIndex(index)}
                  onPointerEnter={() => setDockHoverIndex(index)}
                  onPointerLeave={() => setDockHoverIndex(null)}
                  style={dockMotionStyle(index)}
                  type="button"
                >
                  <span className="dock-tooltip">{item.label}</span>
                  <SystemIcon kind={item.kind} size={52} />
                </button>
              </Fragment>
            );
          })}
        </nav>

        {assistantVisible && (
          <RoverAssistant
            locale={locale}
            onAction={handleAssistantAction}
            onHide={() => setAssistantVisible(false)}
            request={assistantRequest}
          />
        )}

        <LegalFold locale={locale} />
        <span className="wallpaper-credit">{shell.credit}</span>
      </div>

      {spotlightOpen && (
        <Spotlight
          locale={locale}
          onAsk={askAssistant}
          onClose={() => setSpotlightOpen(false)}
          onOpenApp={openWindow}
          posts={boxNewsPosts}
        />
      )}
    </main>
  );
}
