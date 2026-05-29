'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';

import { LOCALE_STORAGE_KEY } from '@/lib/i18n/locale';

/** Keeps document dir/lang and localStorage in sync with the active locale */
export function LocaleSync() {
  const locale = useLocale();

  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  return null;
}
