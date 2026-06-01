'use client';

import { CalendarPlus, Car, House, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/routing';
import { COLORS, FONTS, SHADOWS } from '@/lib/design-system';
import { useAgencyBasePath } from '@/hooks/useAgencySlugFromPath';

const defaultTabs = [
  { href: '/landing', icon: House, key: 'home', match: ['/landing', '/'] },
  { href: '/agency/inova-ride/fleet', icon: Car, key: 'fleet', match: ['/fleet', '/agency/'] },
  { href: '/booking', icon: CalendarPlus, key: 'book', match: ['/booking'], primary: true },
  { href: '/auth/login', icon: User, key: 'account', match: ['/auth/login', '/auth/register'] },
] as const;

function isActive(pathname: string, match: readonly string[], exact = false) {
  return match.some((m) =>
    exact ? pathname === m : pathname === m || pathname.startsWith(`${m}/`),
  );
}

export function BottomTabBar() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const agencyBase = useAgencyBasePath();

  const tabs = agencyBase
    ? [
        { href: agencyBase, icon: House, key: 'home', match: [agencyBase], exact: true },
        {
          href: `${agencyBase}/fleet`,
          icon: Car,
          key: 'fleet',
          match: [`${agencyBase}/fleet`],
        },
        {
          href: `${agencyBase}/booking`,
          icon: CalendarPlus,
          key: 'book',
          match: [`${agencyBase}/booking`],
          primary: true,
        },
        {
          href: `${agencyBase}/auth/login`,
          icon: User,
          key: 'account',
          match: [`${agencyBase}/auth/login`, `${agencyBase}/auth/register`],
        },
      ]
    : defaultTabs;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[100] border-t sm:hidden"
      style={{
        backgroundColor: 'rgba(7, 6, 13, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderColor: COLORS.borderSubtle,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label={tCommon('main_navigation')}
    >
      <div className="mx-auto flex h-16 max-w-lg items-end justify-around px-2">
        {tabs.map((tab) => {
          const active = isActive(
            pathname,
            tab.match,
            'exact' in tab && Boolean(tab.exact),
          );
          const Icon = tab.icon;
          const label = t(`tab_${tab.key}` as 'tab_home');

          if ('primary' in tab && tab.primary) {
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className="relative -mt-5 flex min-h-[52px] min-w-[52px] flex-col items-center justify-center touch-manipulation"
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: COLORS.purple600,
                    boxShadow: SHADOWS.glowPurpleSm,
                  }}
                >
                  <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className="relative flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 touch-manipulation"
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              {active ? (
                <span
                  className="absolute top-0 h-1 w-1 rounded-full"
                  style={{ backgroundColor: COLORS.purple600 }}
                />
              ) : null}
              <Icon
                className="h-6 w-6"
                style={{ color: active ? COLORS.purple400 : COLORS.textDisabled }}
                strokeWidth={active ? 2.25 : 1.75}
              />
              {active ? (
                <span
                  className="text-[10px] font-medium leading-none"
                  style={{ color: COLORS.purple300, fontFamily: FONTS.display }}
                >
                  {label}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
