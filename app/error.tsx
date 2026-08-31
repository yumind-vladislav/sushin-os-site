'use client';

import {
  LocalizedCopy,
  ServiceState,
} from '@/components/sushin-os/service-state';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <ServiceState
      action={
        <button onClick={reset} type="button">
          <LocalizedCopy en="Try again" ru="Повторить" />
        </button>
      }
      eyebrow="SYSTEM"
      message={
        <LocalizedCopy
          en="It is safe to try again — your preferences remain on this device."
          ru="Можно безопасно повторить попытку — ваши настройки останутся на устройстве."
        />
      }
      title={
        <LocalizedCopy en="The window did not open" ru="Окно не открылось" />
      }
    />
  );
}
