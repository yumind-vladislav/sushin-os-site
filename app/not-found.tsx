import Link from 'next/link';
import { ServiceState } from '@/components/sushin-os/service-state';

export default function NotFound() {
  return (
    <ServiceState
      action={<Link href="/">Вернуться в Sushin OS</Link>}
      eyebrow="ОШИБКА 404"
      message="Ссылка могла устареть. Вернитесь в Sushin OS и откройте нужное окно оттуда."
      title="Такого объекта нет на рабочем столе"
    />
  );
}
