'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { trackAnalyticsEvent } from '@/lib/analytics';

export function BoxNewsAnalyticsSignal({ articleId }: { articleId: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackAnalyticsEvent('box_news_open', { article_id: articleId });
  }, [articleId]);
  return null;
}

export function CvRouteActions() {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackAnalyticsEvent('cv_view', { format: 'html' });
  }, []);

  return (
    <>
      <Link href="/">← Sushin OS</Link>
      <a
        download
        href="/cv/vladislav-sushin-project-manager-2026.docx"
        onClick={() => trackAnalyticsEvent('cv_download', { format: 'docx' })}
      >
        Скачать DOCX
      </a>
      <Link
        href="/cv/vladislav-sushin-project-manager-2026.pdf"
        onClick={() => trackAnalyticsEvent('cv_view', { format: 'pdf' })}
      >
        Открыть PDF
      </Link>
    </>
  );
}
