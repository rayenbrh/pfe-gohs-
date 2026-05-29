import { ar, enGB, fr } from 'date-fns/locale';

import type { Locale } from '@/i18n/routing';

export const LOCALE_STORAGE_KEY = 'inova-locale';

export function toIntlLocale(locale: string): string {
  const map: Record<Locale, string> = {
    fr: 'fr-FR',
    en: 'en-GB',
    ar: 'ar-TN',
  };
  return map[locale as Locale] ?? 'fr-FR';
}

export function getDateFnsLocale(locale: string) {
  const map = { fr, en: enGB, ar } as const;
  return map[locale as Locale] ?? fr;
}

/** Tunisian Dinar — locale-aware formatting per product spec */
export function formatPriceDT(amount: number, locale: string): string {
  const intl = toIntlLocale(locale);

  if (locale === 'fr') {
    return `${new Intl.NumberFormat(intl, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} DT`;
  }

  return `${new Intl.NumberFormat(intl, {
    maximumFractionDigits: 0,
  }).format(amount)} DT`;
}

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(toIntlLocale(locale)).format(value);
}

export function formatDateLocalized(
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(value);
}

export function formatDateShort(date: Date | string, locale: string): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value);
}
