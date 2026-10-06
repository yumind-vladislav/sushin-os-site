import Image from 'next/image';
import { temporaryIconFiles, type IconKind } from '@/content/icon-manifest';

type SystemIconProps = {
  kind: IconKind;
  size?: number;
  className?: string;
};

export function SystemIcon({ kind, size = 72, className = '' }: SystemIconProps) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={`os-system-icon ${className}`}
      draggable={false}
      height={size}
      src={temporaryIconFiles[kind]}
      unoptimized
      width={size}
    />
  );
}
