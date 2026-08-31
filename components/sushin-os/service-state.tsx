import type { ReactNode } from 'react';

type ServiceStateProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  message: ReactNode;
  action?: ReactNode;
  compact?: boolean;
};

type LocalizedCopyProps = {
  ru: string;
  en: string;
};

export function LocalizedCopy({ ru, en }: LocalizedCopyProps) {
  return (
    <>
      <span className="service-copy" data-service-locale="ru">
        {ru}
      </span>
      <span className="service-copy" data-service-locale="en" lang="en">
        {en}
      </span>
    </>
  );
}

export function ServiceState({
  eyebrow,
  title,
  message,
  action,
  compact = false,
}: ServiceStateProps) {
  return (
    <section
      aria-live="polite"
      className={compact ? 'service-state is-compact' : 'route-state'}
    >
      <div className={compact ? 'service-state-card' : 'route-state-card'}>
        {eyebrow && <small>{eyebrow}</small>}
        <h2>{title}</h2>
        <p>{message}</p>
        {action}
      </div>
    </section>
  );
}
