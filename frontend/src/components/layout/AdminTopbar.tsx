'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Menu, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/Input';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/hooks/useAuth';
import { Link, useRouter } from '@/i18n/routing';
import { COLORS, FONTS } from '@/lib/design-system';

interface AdminTopbarProps {
  onMenuClick?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const pageTitle = usePageTitle();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const tCommon = useTranslations('common');
  const displayName = user?.name ?? tCommon('admin_user');
  const initials = getInitials(displayName);
  const hasNotifications = true;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { label: tAdmin('profile'), href: '/admin/settings' },
    { label: tAdmin('settings'), href: '/admin/settings' },
    { label: tAdmin('logout'), action: 'logout' as const },
  ];

  return (
    <header
      className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b px-4 lg:px-6 rtl:flex-row-reverse"
      style={{
        backgroundColor: 'rgba(7, 6, 13, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: COLORS.borderSubtle,
      }}
    >
      <div className="flex min-w-0 items-center gap-3 rtl:flex-row-reverse">
        <button
          type="button"
          className="touch-target inline-flex items-center justify-center rounded-lg p-2 lg:hidden"
          style={{ color: COLORS.textSecondary }}
          onClick={onMenuClick}
          aria-label={tCommon('menu')}
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1
          className="truncate"
          style={{
            fontFamily: FONTS.display,
            fontSize: 16,
            color: COLORS.textPrimary,
          }}
        >
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 rtl:flex-row-reverse">
        <div className="relative hidden w-[280px] sm:block">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: COLORS.textMuted }}
          />
          <Input
            placeholder={`${t('search')}${tCommon('search_suffix')}`}
            className="[&_input]:ps-10"
            aria-label={t('search')}
          />
        </div>

        <motion.button
          type="button"
          className="touch-target relative inline-flex items-center justify-center rounded-lg p-2"
          style={{ color: COLORS.textMuted }}
          whileHover={{ color: COLORS.textPrimary }}
          aria-label={tCommon('notifications')}
        >
          <Bell className="h-5 w-5" />
          {hasNotifications ? (
            <span
              className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS.purple600 }}
            />
          ) : null}
        </motion.button>

        <div className="relative" ref={dropdownRef}>
          <motion.button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="touch-target flex h-11 w-11 items-center justify-center rounded-full"
            style={{
              backgroundColor: COLORS.purple700,
              fontFamily: FONTS.display,
              fontSize: 12,
              color: COLORS.textPrimary,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
          >
            {initials}
          </motion.button>

          <AnimatePresence>
            {dropdownOpen ? (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute end-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-lg border py-1 shadow-card"
                style={{
                  backgroundColor: COLORS.bgElevated,
                  borderColor: COLORS.borderDefault,
                }}
                role="menu"
              >
                {menuItems.map((item) =>
                  item.action === 'logout' ? (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      className="block w-full px-4 py-2.5 text-start text-sm"
                      style={{ color: COLORS.textSecondary, fontFamily: FONTS.body }}
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = COLORS.danger;
                        e.currentTarget.style.backgroundColor = COLORS.bgGlass;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = COLORS.textSecondary;
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm"
                      style={{ color: COLORS.textSecondary, fontFamily: FONTS.body }}
                      onClick={() => setDropdownOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = COLORS.textPrimary;
                        e.currentTarget.style.backgroundColor = COLORS.bgGlass;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = COLORS.textSecondary;
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
