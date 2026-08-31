import { ServiceState } from '@/components/sushin-os/service-state';

export default function Loading() {
  return (
    <ServiceState
      eyebrow="SYSTEM"
      message="Подготавливаем рабочий стол и локальные данные."
      title="Sushin OS запускается"
    />
  );
}
