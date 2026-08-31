export const fallbackTimeZone = 'Europe/Moscow';

type ClockLocale = 'ru' | 'en';

export function resolveVisitorTimeZone(
  resolvedTimeZone?: string | null,
): string {
  const candidate = resolvedTimeZone?.trim();
  return candidate || fallbackTimeZone;
}

export function detectVisitorTimeZone(): string {
  try {
    return resolveVisitorTimeZone(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
  } catch {
    return fallbackTimeZone;
  }
}

export function timeZoneLabel(timeZone: string): string {
  return (
    timeZone.split('/').at(-1)?.replaceAll('_', ' ') ||
    timeZone ||
    'Moscow'
  );
}

export function createVisitorClockFormatter(
  locale: ClockLocale,
  resolvedTimeZone?: string | null,
) {
  const timeZone = resolveVisitorTimeZone(resolvedTimeZone);
  const language = locale === 'ru' ? 'ru-RU' : 'en-GB';
  const timeFormatter = new Intl.DateTimeFormat(language, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  });
  const dateFormatter = new Intl.DateTimeFormat(language, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone,
  });
  const zoneLabel = timeZoneLabel(timeZone);

  return {
    timeZone,
    zoneLabel,
    format(now: Date) {
      return {
        time: timeFormatter.format(now),
        date: dateFormatter.format(now),
        zone: timeZone,
        zoneLabel,
      };
    },
  };
}
