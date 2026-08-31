import { dictionaries, type Locale } from '@/content/i18n';

export function ContactPanel({ locale }: { locale: Locale }) {
  const labels = dictionaries[locale].career;
  return (
    <div className="contact-panel">
      <small>NO FORM · DIRECT CONTACT</small>
      <h2>{labels.contactTitle}</h2>
      <p>{labels.contactCopy}</p>
      <div className="contact-actions">
        <a href="https://t.me/takoikakvse1" rel="noreferrer" target="_blank">
          {labels.personalTelegram}
        </a>
        <a href="mailto:vladislav.sushin@gmail.com">{labels.email}</a>
        <a href="https://t.me/yumind_reborn" rel="noreferrer" target="_blank">
          {labels.blog}
        </a>
      </div>
    </div>
  );
}
