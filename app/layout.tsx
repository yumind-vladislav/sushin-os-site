import type { Metadata } from 'next';
import { YandexMetrica } from '@/components/analytics/yandex-metrica';
import { siteUrl } from '@/lib/site';
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
    'sushin-os.desktop.v5',
    'sushin-os.desktop.v4',
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
  metadataBase: new URL(siteUrl),
  title: 'Sushin OS — Владислав Сушин / Vladislav Sushin',
  description:
    'Интерактивный персональный рабочий стол Владислава Сушина в визуальной памяти macOS Catalina.',
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    url: '/',
    locale: 'ru_RU',
    alternateLocale: ['en_US'],
    siteName: 'Sushin OS',
    title: 'Sushin OS — Владислав Сушин',
    description:
      'Project Manager в AI-разработке: CV, проекты, Box News и рабочие контакты.',
    images: [
      {
        url: '/wallpapers/northern-island-day.webp',
        width: 1672,
        height: 941,
        alt: 'Оригинальные дневные обои Sushin OS с северным островом',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sushin OS — Владислав Сушин',
    description:
      'Project Manager в AI-разработке: CV, проекты, Box News и рабочие контакты.',
    images: ['/wallpapers/northern-island-day.webp'],
  },
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
      <body>
        {children}
        <YandexMetrica />
      </body>
    </html>
  );
}
