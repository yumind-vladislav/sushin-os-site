import { ExternalLink } from 'lucide-react';
import { socialChannels } from '@/content/career-content';
import { dictionaries, type Locale } from '@/content/i18n';
import { trackAnalyticsEvent } from '@/lib/analytics';

export function SocialPanel({ locale }: { locale: Locale }) {
  return (
    <div className="social-panel">
      <header>
        <small>DIRECT LINKS · 01–07</small>
        <h2>{dictionaries[locale].career.socialTitle}</h2>
      </header>
      <ol>
        {socialChannels.map((channel, index) => (
          <li key={channel.id}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <a
              href={channel.href}
              onClick={() =>
                trackAnalyticsEvent('social_click', { network: channel.id })
              }
              rel="noreferrer"
              target="_blank"
            >
              <strong>{channel.name}</strong>
              <small>{channel.purpose[locale]}</small>
              <ExternalLink aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
