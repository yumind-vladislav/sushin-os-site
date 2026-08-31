import Link from 'next/link';
import {
  LocalizedCopy,
  ServiceState,
} from '@/components/sushin-os/service-state';

export default function NotFound() {
  return (
    <ServiceState
      action={
        <Link href="/">
          <LocalizedCopy en="Return to Sushin OS" ru="Вернуться в Sushin OS" />
        </Link>
      }
      eyebrow={<LocalizedCopy en="ERROR 404" ru="ОШИБКА 404" />}
      message={
        <LocalizedCopy
          en="The link may be stale. Return to Sushin OS and open the window from there."
          ru="Ссылка могла устареть. Вернитесь в Sushin OS и откройте нужное окно оттуда."
        />
      }
      title={
        <LocalizedCopy
          en="That object is not on the desktop"
          ru="Такого объекта нет на рабочем столе"
        />
      }
    />
  );
}
