import Link from 'next/link';
import { dictionaries, type Locale } from '@/content/i18n';

export function LegalFold({ locale }: { locale: Locale }) {
  const labels = dictionaries[locale].legal;
  return (
    <details className="legal-fold">
      <summary>{labels.title}</summary>
      <div>
        <strong>{labels.owner}</strong>
        <p>{labels.copy}</p>
        <nav aria-label={labels.title}>
          <Link href="/privacy/">{labels.privacy}</Link>
          <Link href="/terms/">{labels.terms}</Link>
          <a href="mailto:vladislav.sushin@icloud.com">{labels.email}</a>
        </nav>
      </div>
    </details>
  );
}
