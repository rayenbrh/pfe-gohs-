'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { usePathname, useRouter } from '@/i18n/routing';
import { LOCALE_STORAGE_KEY } from '@/lib/i18n/locale';
import { COLORS, SHADOWS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

const localeCodes = ['fr', 'en', 'ar'] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const locales = [
    { code: 'fr' as const, label: t('locale_fr') },
    { code: 'en' as const, label: t('locale_en') },
    { code: 'ar' as const, label: t('locale_ar') },
  ];

  const switchLocale = (nextLocale: (typeof localeCodes)[number]) => {
    startTransition(() => {
      localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-lg border p-0.5 touch-manipulation"
      style={{
        backgroundColor: COLORS.bgSurface,
        borderColor: COLORS.borderSubtle,
      }}
      role="group"
      aria-label={t('language_switcher')}
    >
      {locales.map((loc) => {
        const isActive = locale === loc.code;
        return (
          <button
            key={loc.code}
            type="button"
            disabled={isPending}
            onClick={() => switchLocale(loc.code)}
            className={cn(
              'relative min-h-[44px] min-w-[44px] rounded-md px-2.5 py-1 text-sm font-medium transition-colors duration-150',
              isPending && 'opacity-60',
            )}
            style={{
              color: isActive ? COLORS.textPrimary : COLORS.textMuted,
              backgroundColor: isActive ? COLORS.purple600 : 'transparent',
              boxShadow: isActive ? SHADOWS.glowPurpleSm : 'none',
            }}
            onMouseEnter={
              !isActive && !isPending
                ? (e) => {
                    e.currentTarget.style.color = COLORS.textSecondary;
                  }
                : undefined
            }
            onMouseLeave={
              !isActive && !isPending
                ? (e) => {
                    e.currentTarget.style.color = COLORS.textMuted;
                  }
                : undefined
            }
            aria-pressed={isActive}
            aria-label={loc.code === 'ar' ? t('locale_ar_aria') : loc.label}
          >
            {loc.label}
          </button>
        );
      })}
    </div>
  );
}
