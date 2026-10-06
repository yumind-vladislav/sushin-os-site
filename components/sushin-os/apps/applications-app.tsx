'use client';

import { appDefinitions, dockApps, type AppId } from '@/content/apps';
import type { Locale } from '@/content/i18n';
import { SystemIcon } from '../system-icon';

const labels = {
  ru: { count: (n: number) => `${n} программ` },
  en: { count: (n: number) => `${n} apps` },
} as const;

/** Finder-style folder with every utility, so the Dock keeps only essentials. */
export function ApplicationsApp({
  locale,
  onOpen,
}: {
  locale: Locale;
  onOpen: (id: AppId) => void;
}) {
  return (
    <div className="applications-app">
      <ul className="applications-grid">
        {dockApps.map((id) => {
          const app = appDefinitions[id];
          return (
            <li key={id}>
              <button
                className="applications-item"
                onClick={() => onOpen(id)}
                title={app.summary[locale]}
                type="button"
              >
                <SystemIcon kind={app.icon} size={56} />
                <span>{app.title[locale]}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="applications-status">{labels[locale].count(dockApps.length)}</p>
    </div>
  );
}
