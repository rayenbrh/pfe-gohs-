'use client';

import { useLocale } from 'next-intl';

import {
  formatDateLocalized,
  formatDateShort,
  formatNumber,
  formatPriceDT,
} from '@/lib/i18n/locale';
import { formatRelativeTime } from '@/lib/i18n/relative-time';

export function useLocaleFormat() {
  const locale = useLocale();

  return {
    locale,
    formatPrice: (amount: number) => formatPriceDT(amount, locale),
    formatNumber: (value: number) => formatNumber(value, locale),
    formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) =>
      formatDateLocalized(date, locale, options),
    formatDateShort: (date: Date | string) => formatDateShort(date, locale),
    formatRelative: (date: Date | string) => formatRelativeTime(date, locale),
    intlLocale: locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-TN' : 'en-GB',
  };
}
