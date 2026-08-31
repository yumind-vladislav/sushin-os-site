'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CvDocument } from '@/components/cv/cv-document';
import { dictionaries, type Locale } from '@/content/i18n';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { ServiceState } from './service-state';

type CvView = 'html' | 'pdf';

export function CvPanel({ locale }: { locale: Locale }) {
  const [view, setView] = useState<CvView>('html');
  const [pdfState, setPdfState] = useState<'loading' | 'ready' | 'unavailable'>(
    'loading',
  );
  const [pdfVersion, setPdfVersion] = useState(0);
  const labels = dictionaries[locale].career;
  const chooseView = (nextView: CvView) => {
    setView(nextView);
    if (nextView === 'pdf') setPdfState('loading');
    trackAnalyticsEvent('cv_view', { format: nextView });
  };
  const retryPdf = () => {
    setPdfState('loading');
    setPdfVersion((current) => current + 1);
  };

  return (
    <div className="cv-panel">
      <header className="cv-panel-toolbar">
        <div>
          <strong>{labels.cvTitle}</strong>
          <small>{labels.cvRussianOnly}</small>
        </div>
        <div aria-label={labels.cvTitle} className="cv-segmented" role="tablist">
          {(['html', 'pdf'] as const).map((item) => (
            <button
              aria-selected={view === item}
              key={item}
              onClick={() => chooseView(item)}
              role="tab"
              type="button"
            >
              {item === 'html' ? labels.html : labels.pdf}
            </button>
          ))}
        </div>
      </header>

      <div className="cv-panel-body">
        {view === 'html' ? (
          <CvDocument compact />
        ) : (
          <div className="cv-pdf-shell">
            <iframe
              className={pdfState === 'ready' ? 'is-ready' : ''}
              key={pdfVersion}
              onError={() => setPdfState('unavailable')}
              onLoad={() => setPdfState('ready')}
              src="/cv/vladislav-sushin-project-manager-2026.pdf"
              title="CV Владислава Сушина в PDF"
            />
            {pdfState !== 'ready' && (
              <ServiceState
                action={
                  pdfState === 'unavailable' ? (
                    <button onClick={retryPdf} type="button">
                      {dictionaries[locale].states.retry}
                    </button>
                  ) : undefined
                }
                compact
                eyebrow="PDF"
                message={
                  pdfState === 'loading'
                    ? labels.pdfLoading
                    : labels.pdfUnavailable
                }
                title={labels.cvTitle}
              />
            )}
          </div>
        )}
      </div>

      <footer className="cv-panel-actions">
        <span>{labels.actuality}</span>
        <Link
          href="/cv/"
          onClick={() => trackAnalyticsEvent('cv_view', { format: 'html' })}
        >
          {labels.openFull}
        </Link>
        <a
          download
          href="/cv/vladislav-sushin-project-manager-2026.pdf"
          onClick={() => trackAnalyticsEvent('cv_download', { format: 'pdf' })}
        >
          {labels.downloadPdf}
        </a>
        <a
          download
          href="/cv/vladislav-sushin-project-manager-2026.docx"
          onClick={() => trackAnalyticsEvent('cv_download', { format: 'docx' })}
        >
          {labels.downloadDocx}
        </a>
      </footer>
    </div>
  );
}
