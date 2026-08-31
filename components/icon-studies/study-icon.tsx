import type { IconDirectionId, IconKind } from '@/content/icon-manifest';

type StudyIconProps = {
  direction: IconDirectionId;
  kind: IconKind;
  size?: number;
  className?: string;
};

export function StudyIcon({
  direction,
  kind,
  size = 112,
  className = '',
}: StudyIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={`study-icon ${className}`}
      height={size}
      viewBox="0 0 512 512"
      width={size}
    >
      <use href={`/icons/source/icon-studies.svg#${direction}-${kind}`} />
    </svg>
  );
}
