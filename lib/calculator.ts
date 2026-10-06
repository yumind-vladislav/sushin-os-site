export type Operator = '+' | '-' | '*' | '/';

/** Rounds away binary noise such as 0.1 + 0.2 = 0.30000000000000004. */
export function applyOperator(left: number, right: number, operator: Operator): number {
  const raw =
    operator === '+'
      ? left + right
      : operator === '-'
        ? left - right
        : operator === '*'
          ? left * right
          : right === 0
            ? Number.NaN
            : left / right;
  return Number.isFinite(raw) ? Number.parseFloat(raw.toPrecision(12)) : Number.NaN;
}

/**
 * Shows the raw entry while typing (keeps a trailing separator or zeros) and a
 * localized number otherwise.
 */
export function formatNumber(value: number, locale: string, entry?: string): string {
  if (Number.isNaN(value)) return locale === 'ru' ? 'Ошибка' : 'Error';
  if (entry && /[.]$|\.\d*0$/.test(entry)) {
    return locale === 'ru' ? entry.replace('.', ',') : entry;
  }
  return new Intl.NumberFormat(locale, { maximumSignificantDigits: 12 }).format(value);
}
