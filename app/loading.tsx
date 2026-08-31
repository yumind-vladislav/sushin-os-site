import {
  LocalizedCopy,
  ServiceState,
} from '@/components/sushin-os/service-state';

export default function Loading() {
  return (
    <ServiceState
      eyebrow="SYSTEM"
      message={
        <LocalizedCopy
          en="Preparing the desktop and local data."
          ru="Подготавливаем рабочий стол и локальные данные."
        />
      }
      title={
        <LocalizedCopy en="Sushin OS is starting" ru="Sushin OS запускается" />
      }
    />
  );
}
