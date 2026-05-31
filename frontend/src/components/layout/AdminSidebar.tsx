'use client';

import {
  CalendarDays,
  Car,
  FileText,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  UserCog,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/Badge';
import { Link, usePathname } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, FONTS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

import { Logo } from './Logo';

const allNavItems = [
  { href: '/admin/dashboard',    icon: LayoutDashboard, key: 'dashboard',    adminOnly: false },
  { href: '/admin/fleet',        icon: Car,             key: 'fleet',        adminOnly: true  },
  { href: '/admin/reservations', icon: CalendarDays,    key: 'reservations', adminOnly: false },
  { href: '/admin/clients',      icon: Users,           key: 'clients',      adminOnly: false },
  { href: '/admin/contracts',    icon: FileText,        key: 'contracts',    adminOnly: false },
  { href: '/admin/invoices',     icon: Receipt,         key: 'invoices',     adminOnly: false },
  { href: '/admin/maintenance',  icon: Wrench,          key: 'maintenance',  adminOnly: true  },
  { href: '/admin/hr',           icon: UserCog,         key: 'hr',           adminOnly: true  },
];

interface AdminSidebarProps {
  variant?: 'desktop' | 'drawer';
  onClose?: () => void;
}

export function AdminSidebar({ variant = 'desktop', onClose }: AdminSidebarProps) {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const tCommon = useTranslations('common');
  const tLayout = useTranslations('layout');
  const isAdmin = user?.role === 'admin';
  const displayName = user?.name ?? tCommon('admin_user');
  const roleLabel = isAdmin ? tCommon('role_admin') : tCommon('role_staff');

  const mainNavItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  const navContent = (
    <>
      <div
        className="flex h-[72px] shrink-0 flex-col justify-center border-b px-4"
        style={{ borderColor: COLORS.borderSubtle }}
      >
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" prefetch onClick={onClose}>
            <Logo size="sm" />
          </Link>
          {variant === 'drawer' && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 lg:hidden"
              style={{ color: COLORS.textMuted }}
              aria-label={tCommon('close')}
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <p
            className="truncate text-sm font-medium"
            style={{ color: COLORS.textPrimary, fontFamily: FONTS.body }}
          >
            {displayName}
          </p>
          <Badge variant="purple" size="sm" text={roleLabel} />
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link key={item.href} href={item.href} prefetch onClick={onClose} className="relative block">
              {active ? (
                <span
                  className="absolute inset-0 rounded-[10px]"
                  style={{
                    backgroundColor: 'rgba(124, 58, 237, 0.15)',
                    borderInlineStart: `3px solid ${COLORS.purple600}`,
                  }}
                />
              ) : null}
              <span
                className={cn('relative flex items-center gap-3 rounded-[10px] px-4 py-2.5 transition-colors duration-150')}
                style={{
                  fontSize: 14,
                  fontFamily: FONTS.body,
                  color: active ? COLORS.textPrimary : COLORS.textSecondary,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = COLORS.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = COLORS.textSecondary;
                  }
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t(item.key)}
              </span>
            </Link>
          );
        })}

        <div className="my-3 h-px" style={{ backgroundColor: COLORS.borderSubtle }} />

        <Link href="/admin/settings" prefetch onClick={onClose} className="relative block">
          {pathname.startsWith('/admin/settings') ? (
            <span
              className="absolute inset-0 rounded-[10px]"
              style={{
                backgroundColor: 'rgba(124, 58, 237, 0.15)',
                borderLeft: `3px solid ${COLORS.purple600}`,
              }}
            />
          ) : null}
          <span
            className="relative flex items-center gap-3 rounded-[10px] px-4 py-2.5"
            style={{ fontSize: 14, color: COLORS.textSecondary, fontFamily: FONTS.body }}
          >
            <Settings className="h-4 w-4" />
            {t('settings')}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => {
            logout();
            onClose?.();
          }}
          className="flex w-full items-center gap-3 rounded-[10px] px-4 py-2.5 text-start transition-colors duration-150"
          style={{ fontSize: 14, color: COLORS.textSecondary, fontFamily: FONTS.body }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = COLORS.danger;
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = COLORS.textSecondary;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </button>
      </nav>

      <p
        className="shrink-0 border-t px-4 py-3"
        style={{
          borderColor: COLORS.borderSubtle,
          color: COLORS.textDisabled,
          fontSize: 11,
          fontFamily: FONTS.display,
        }}
      >
        {tLayout('admin_version')}
      </p>
    </>
  );

  if (variant === 'drawer') {
    return (
      <>
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="fixed inset-y-0 end-0 z-[70] flex w-[260px] flex-col lg:hidden"
          style={{
            backgroundColor: COLORS.bgSurface,
            borderInlineStart: `1px solid ${COLORS.borderSubtle}`,
          }}
        >
          {navContent}
        </motion.aside>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[69] bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      </>
    );
  }

  return (
    <aside
      className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col"
      style={{
        backgroundColor: COLORS.bgSurface,
        borderInlineEnd: `1px solid ${COLORS.borderSubtle}`,
      }}
    >
      {navContent}
    </aside>
  );
}
