import Image from 'next/image';
import { aboutPersonal, aboutTimeline } from '@/content/career-content';
import { dictionaries, type Locale } from '@/content/i18n';
import { calculateAge, siteContent } from '@/content/site-content';

type VladislavPanelProps = {
  locale: Locale;
  onOpenCv: () => void;
  onOpenProjects: () => void;
};

export function VladislavPanel({
  locale,
  onOpenCv,
  onOpenProjects,
}: VladislavPanelProps) {
  const dictionary = dictionaries[locale];
  const profile = siteContent.profile;
  const age = calculateAge(profile.dateOfBirth);

  return (
    <div className="profile-panel">
      <div className="profile-portrait-slot">
        <Image
          alt={locale === 'ru' ? 'Портрет Владислава Сушина' : 'Portrait of Vladislav Sushin'}
          fill
          priority
          sizes="(max-width: 700px) 100vw, 290px"
          src="/media/profile/vladislav-sushin.jpg"
        />
        <div className="portrait-caption">
          <span>{dictionary.profile.openToWork}</span>
          <small>31.05.2000</small>
        </div>
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

        <section className="profile-timeline">
          <h3>{dictionary.career.timeline}</h3>
          <ol>
            {aboutTimeline.map((item) => (
              <li key={item.period}>
                <time>{item.period}</time>
                <span>{item.title[locale]}</span>
              </li>
            ))}
          </ol>
        </section>

        <p className="profile-personal">{aboutPersonal[locale]}</p>

        <div className="profile-actions">
          <button className="aqua-button is-primary" onClick={onOpenCv} type="button">
            {dictionary.career.aboutCv}
          </button>
          <button className="aqua-button" onClick={onOpenProjects} type="button">
            {dictionary.career.aboutProjects}
          </button>
          <a href="https://t.me/takoikakvse1" rel="noreferrer" target="_blank">
            {dictionary.career.aboutTelegram}
          </a>
        </div>
      </article>
    </div>
  );
}
