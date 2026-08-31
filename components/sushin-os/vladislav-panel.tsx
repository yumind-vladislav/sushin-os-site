'use client';

import { vladislavProfile } from '@/content/sushin-os-content';
import { SystemIcon } from './system-icon';

type VladislavPanelProps = {
  onOpenFact: () => void;
};

export function VladislavPanel({ onOpenFact }: VladislavPanelProps) {
  return (
    <div className="profile-panel">
      <div className="profile-portrait-slot">
        <SystemIcon kind="vladislav" size={118} />
        <span>PHOTO SLOT</span>
        <small>AWAITING SOURCE</small>
      </div>

      <article className="profile-copy">
        <span className="profile-eyebrow">PROFILE · CONTENT-SAFE PREVIEW</span>
        <h2>{vladislavProfile.name}</h2>
        <p className="profile-role">{vladislavProfile.role}</p>
        <p className="profile-intro">{vladislavProfile.intro}</p>

        <dl className="profile-meta">
          <div>
            <dt>BIRTHDAY</dt>
            <dd>{vladislavProfile.birthdayLabel}</dd>
          </div>
          <div>
            <dt>AGE</dt>
            <dd>{vladislavProfile.ageLabel}</dd>
          </div>
        </dl>

        <ul className="content-status" aria-label="Статус контента профиля">
          {vladislavProfile.contentStatus.map((item) => (
            <li key={item.label}>
              <span>{item.label}</span>
              <b>{item.value}</b>
            </li>
          ))}
        </ul>

        <button className="aqua-button" onClick={onOpenFact} type="button">
          Вернуться к Random Fact
        </button>
      </article>
    </div>
  );
}
