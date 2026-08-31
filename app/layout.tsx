import type { Metadata } from 'next';
import './globals.css';

const localhostExtensionErrorGuard = `
(() => {
  const phantomExtensionId = 'bfnaelmomeimhlpmgjnjophhpkkoljpa';
  const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

  window.addEventListener('error', (event) => {
    const source = String(event.filename || event.error?.stack || '');
    const isPhantomEthereumConflict =
      localHosts.has(window.location.hostname) &&
      source.includes('chrome-extension://' + phantomExtensionId + '/') &&
      String(event.message || '').includes('Cannot redefine property: ethereum');

    if (!isPhantomEthereumConflict) return;

    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
})();
`;

const localeBootstrap = `
(() => {
  const storageKeys = [
    'sushin-os.desktop.v3',
    'sushin-os.desktop.v2',
    'sushin-os.desktop.v1',
  ];
  let savedLocale = null;

  try {
    const stored = storageKeys.map((key) => localStorage.getItem(key)).find(Boolean);
    const saved = JSON.parse(stored || 'null');
    savedLocale = saved?.locale;
  } catch {}

  const browserLocale = (navigator.languages || [navigator.language]).some(
    (language) => String(language).toLowerCase().startsWith('ru')
  ) ? 'ru' : 'en';
  const locale = savedLocale === 'ru' || savedLocale === 'en'
    ? savedLocale
    : browserLocale;

  document.documentElement.lang = locale;
  document.documentElement.dataset.uiLocale = locale;
})();
`;

export const metadata: Metadata = {
  title: 'Sushin OS — Владислав Сушин / Vladislav Sushin',
  description:
    'Интерактивный персональный рабочий стол Владислава Сушина в визуальной памяти macOS Catalina.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeBootstrap }} />
        <script dangerouslySetInnerHTML={{ __html: localhostExtensionErrorGuard }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
