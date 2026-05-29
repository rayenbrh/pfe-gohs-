import { routing, type Locale } from '@/i18n/routing';

export function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split('/')[1];
  if (routing.locales.includes(segment as Locale)) {
    return segment as Locale;
  }
  return routing.defaultLocale;
}
