import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { formatDateLocalized as formatDate, formatPriceDT as formatCurrency } from '@/lib/i18n/locale';
