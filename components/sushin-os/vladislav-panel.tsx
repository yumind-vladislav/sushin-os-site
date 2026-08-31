import { dictionaries, type Locale } from '@/content/i18n';
import { calculateAge, siteContent } from '@/content/site-content';
import { SystemIcon } from './system-icon';

type VladislavPanelProps = {
  locale: Locale;
  onOpenFact: () => void;
};

export function VladislavPanel({ locale, onOpenFact }: VladislavPanelProps) {
  const dictionary = dictionaries[locale];
  const profile = siteContent.profile;
  const age = calculateAge(profile.dateOfBirth);

  return (
    <div className="profile-panel">
      <div className="profile-portrait-slot">
        <SystemIcon kind="vladislav" size={118} />
        <span>{dictionary.profile.openToWork}</span>
        <small>31.05.2000</small>
      </div>

      <article className="profile-copy">
        <span className="profile-eyebrow">{dictionary.profile.eyebrow}</span>
        <h2>{profile.name[locale]}</h2>
        <p className="profile-role">{profile.role[locale]}</p>
        <p className="profile-intro">{profile.summary[locale]}</p>

        <dl className="profile-meta">
          <div>
            <dt>{dictionary.profile.birthday}</dt>
            <dd>
              <time dateTime={profile.dateOfBirth}>31.05.2000</time>
            </dd>
          </div>
          <div>
            <dt>{dictionary.profile.age}</dt>
            <dd>{age}</dd>
          </div>
          <div>
            <dt>{dictionary.profile.status}</dt>
            <dd>{profile.availability[locale]}</dd>
          </div>
        </dl>

        <button className="aqua-button" onClick={onOpenFact} type="button">
          {dictionary.actions.backToFacts}
        </button>
      </article>
    </div>
  );
}
