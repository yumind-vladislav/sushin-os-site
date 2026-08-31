import { dictionaries, type Locale } from '@/content/i18n';
import { capabilityGroups } from '@/content/work-content';

export function CapabilitiesPanel({ locale }: { locale: Locale }) {
  const labels = dictionaries[locale].work;

  return (
    <div className="capabilities-panel">
      <header>
        <small>{labels.directionsEyebrow}</small>
        <h2>{labels.directionsTitle}</h2>
        <p>{labels.directionsCopy}</p>
      </header>
      <div className="capability-grid">
        {capabilityGroups.map((group, index) => (
          <section key={group.id}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{group.title[locale]}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item.en}>{item[locale]}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="capability-note">{labels.directionsNote}</p>
    </div>
  );
}
