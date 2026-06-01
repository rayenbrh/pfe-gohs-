'use client';

import { MenuIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Link } from '@/i18n/routing';
import {
  agencyAuthLoginPath,
  DEFAULT_AGENCY_SLUG,
} from '@/lib/agency-context';
import { COLORS } from '@/lib/design-system';
import { useAgencyBasePath } from '@/hooks/useAgencySlugFromPath';
import { cn } from '@/lib/utils';

import { Logo } from './Logo';
import { MobileNav } from './MobileNav';
import { NavLink } from './NavLink';

export function Navbar() {
  const t = useTranslations('nav');
  const [mobileOpen, setMobileOpen] = useState(false);
  const agencyBase = useAgencyBasePath();
  const slug = agencyBase?.replace('/agency/', '') ?? DEFAULT_AGENCY_SLUG;

  const centerLinks = [
    { href: agencyBase ? `${agencyBase}/fleet` : `/agency/${DEFAULT_AGENCY_SLUG}/fleet`, label: t('fleet') },
    {
      href: agencyBase ? `${agencyBase}#how-it-works` : '/landing#how-it-works',
      label: t('how_it_works'),
    },
    { href: '/landing#contact', label: t('contact') },
  ] as const;

  const loginHref = agencyBase ? agencyAuthLoginPath(slug) : '/auth/login';
  const bookingHref = agencyBase ? `${agencyBase}/booking` : '/booking';
  const homeHref = agencyBase ?? '/';

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: 'rgba(7, 6, 13, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: COLORS.borderSubtle,
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[72px] rtl:flex-row-reverse">
          {/* Left — logo */}
          <Link href={homeHref} className="shrink-0">
            <Logo />
          </Link>

          {/* Center — desktop nav */}
          <nav className="hidden items-center gap-8 md:flex rtl:flex-row-reverse">
            {centerLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right — actions */}
          <div className="flex items-center gap-2 sm:gap-3 rtl:flex-row-reverse">
            <LanguageSwitcher />
            <Link href={loginHref} className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">
                {t('login')}
              </Button>
            </Link>
            <Link href={bookingHref} className="hidden sm:inline-flex">
              <Button size="sm">{t('book_now')}</Button>
            </Link>
            <button
              type="button"
              className={cn(
                'touch-target hidden items-center justify-center rounded-lg p-2 sm:inline-flex md:hidden',
              )}
              style={{ color: COLORS.textSecondary }}
              onClick={() => setMobileOpen(true)}
              aria-label={t('menu')}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen nav only on tablet; phones use BottomTabBar */}
      <div className="hidden sm:block md:hidden">
        <MobileNav
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          links={centerLinks}
          loginHref={loginHref}
          bookingHref={bookingHref}
        />
      </div>
    </>
  );
}
