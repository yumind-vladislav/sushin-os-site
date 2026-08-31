import type { ReactNode } from 'react';

type ServiceStateProps = {
  eyebrow?: string;
  title: string;
  message: string;
  action?: ReactNode;
  compact?: boolean;
};

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
