'use client';

import { useEffect } from 'react';
import {
  allowsAnalytics,
  ensureMetricaQueue,
  metricaCounterId,
} from '@/lib/analytics';

export function YandexMetrica() {
  useEffect(() => {
    const counterId = metricaCounterId();
    if (
      !counterId ||
      !allowsAnalytics(window.navigator.doNotTrack) ||
      window.__sushinMetricaInitialized
    ) {
      return;
    }

    const ym = ensureMetricaQueue();
    if (!ym) return;

    window.__sushinMetricaInitialized = true;
    ym(counterId, 'init', {
      accurateTrackBounce: true,
      clickmap: true,
      defer: true,
      trackLinks: true,
      webvisor: false,
    });

    const script = document.createElement('script');
    script.async = true;
    script.dataset.sushinMetrica = String(counterId);
    script.src = 'https://mc.yandex.ru/metrika/tag.js';
    document.head.append(script);
  }, []);

  return null;
}
