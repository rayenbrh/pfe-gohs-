import { formatDistanceToNow } from 'date-fns';

import { getDateFnsLocale } from '@/lib/i18n/locale';

export function formatRelativeTime(date: Date | string, locale: string): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(value, {
    addSuffix: true,
    locale: getDateFnsLocale(locale),
  });
}
