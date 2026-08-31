'use client';

import { ServiceState } from '@/components/sushin-os/service-state';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <ServiceState
      action={
        <button onClick={reset} type="button">
          Повторить
        </button>
      }
      eyebrow="SYSTEM"
      message="Можно безопасно повторить попытку — ваши настройки останутся на устройстве."
      title="Окно не открылось"
    />
  );
}
