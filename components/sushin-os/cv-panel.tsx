'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CvDocument } from '@/components/cv/cv-document';
import { dictionaries, type Locale } from '@/content/i18n';

type CvView = 'html' | 'pdf';

export function CvPanel({ locale }: { locale: Locale }) {
  const [view, setView] = useState<CvView>('html');
  const labels = dictionaries[locale].career;

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
              onClick={() => setView(item)}
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
          <iframe
            src="/cv/vladislav-sushin-project-manager-2026.pdf"
            title="CV Владислава Сушина в PDF"
          />
        )}
      </div>

      <footer className="cv-panel-actions">
        <span>{labels.actuality}</span>
        <Link href="/cv/">{labels.openFull}</Link>
        <a download href="/cv/vladislav-sushin-project-manager-2026.docx">
          {labels.downloadDocx}
        </a>
      </footer>
    </div>
  );
}
