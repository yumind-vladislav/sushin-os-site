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

export const metadata: Metadata = {
  title: 'Sushin OS — Vladislav Sushin',
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
    <html lang="ru">
      <head>
        <script dangerouslySetInnerHTML={{ __html: localhostExtensionErrorGuard }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
