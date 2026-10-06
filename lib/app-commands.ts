'use client';

import { useEffect, useRef } from 'react';

// Menu bar items and the assistant talk to app windows through this bus, so a
// window can own its state while the shell still drives it from outside.
const eventName = 'sushin-os:app-command';

type AppCommandDetail = { appId: string; command: string };

export function dispatchAppCommand(appId: string, command: string) {
  window.dispatchEvent(
    new CustomEvent<AppCommandDetail>(eventName, { detail: { appId, command } }),
  );
}

export function useAppCommand(
  appId: string,
  handler: (command: string) => void,
) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const listener = (event: Event) => {
      const { detail } = event as CustomEvent<AppCommandDetail>;
      if (detail?.appId === appId) handlerRef.current(detail.command);
    };
    window.addEventListener(eventName, listener);
    return () => window.removeEventListener(eventName, listener);
  }, [appId]);
}
