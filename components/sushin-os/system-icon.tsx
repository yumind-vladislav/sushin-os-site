import type { IconKind } from '@/content/icon-manifest';

type SystemIconProps = {
  kind: IconKind;
  size?: number;
  className?: string;
};

export function SystemIcon({ kind, size = 72, className = '' }: SystemIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={`os-system-icon ${className}`}
      height={size}
      viewBox="0 0 512 512"
      width={size}
    >
      <use href={`/icons/source/icon-studies.svg#system-${kind}`} />
    </svg>
  );
}
