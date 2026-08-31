import type { SocialChannel } from '@/content/career-content';
import type { ProjectId } from '@/content/work-content';

export type AnalyticsPayloads = {
  cv_view: { format: 'html' | 'pdf' };
  cv_download: { format: 'pdf' | 'docx' };
  profile_open: Record<string, never>;
  contact_click: { channel: 'telegram' | 'gmail' | 'telegram_blog' };
  project_open: { project_id: ProjectId };
  box_news_open: { article_id: string };
  social_click: { network: SocialChannel['id'] };
  music_start: Record<string, never>;
  music_blocked: Record<string, never>;
  random_fact_spin: { fact_id: string };
};

export type AnalyticsEventName = keyof AnalyticsPayloads;

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
    __sushinMetricaInitialized?: boolean;
  }
}

const configuredCounterId = process.env.NEXT_PUBLIC_YANDEX_METRICA_ID;

export function parseMetricaCounterId(value?: string): number | null {
  if (!value || !/^\d{1,12}$/.test(value)) return null;
  const counterId = Number(value);
  return Number.isSafeInteger(counterId) && counterId > 0 ? counterId : null;
}

export function allowsAnalytics(doNotTrack?: string | null): boolean {
  return doNotTrack !== '1' && doNotTrack?.toLowerCase() !== 'yes';
}

export function metricaCounterId(): number | null {
  return parseMetricaCounterId(configuredCounterId);
}

export function ensureMetricaQueue(): typeof window.ym {
  if (typeof window === 'undefined') return undefined;
  if (typeof window.ym !== 'function') {
    const queue: unknown[][] = [];
    window.ym = (...args: unknown[]) => {
      queue.push(args);
    };
    Object.assign(window.ym, { a: queue, l: Date.now() });
  }
  return window.ym;
}

export function trackAnalyticsEvent<Name extends AnalyticsEventName>(
  event: Name,
  payload: AnalyticsPayloads[Name],
): boolean {
  const counterId = metricaCounterId();
  if (
    !counterId ||
    typeof window === 'undefined' ||
    !allowsAnalytics(window.navigator.doNotTrack)
  ) {
    return false;
  }
  ensureMetricaQueue()?.(counterId, 'reachGoal', event, payload);
  return true;
}
