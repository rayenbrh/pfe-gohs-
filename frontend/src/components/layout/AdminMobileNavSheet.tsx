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
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, FONTS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

import { Logo } from './Logo';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/admin/fleet', icon: Car, key: 'fleet' },
  { href: '/admin/reservations', icon: CalendarDays, key: 'reservations' },
  { href: '/admin/clients', icon: Users, key: 'clients' },
  { href: '/admin/contracts', icon: FileText, key: 'contracts' },
  { href: '/admin/invoices', icon: Receipt, key: 'invoices' },
  { href: '/admin/maintenance', icon: Wrench, key: 'maintenance' },
  { href: '/admin/hr', icon: UserCog, key: 'hr' },
  { href: '/admin/settings', icon: Settings, key: 'settings' },
] as const;

interface AdminMobileNavSheetProps {
  open: boolean;
  onClose: () => void;
}

export function AdminMobileNavSheet({ open, onClose }: AdminMobileNavSheetProps) {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="mb-4">
        <Logo size="sm" />
      </div>
      <nav className="space-y-1">
        {navItems.map(({ href, icon: Icon, key }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={key}
              href={href}
              onClick={onClose}
              className={cn(
                'flex min-h-[44px] items-center gap-3 rounded-xl px-4 touch-manipulation',
                active && 'bg-bg-glass',
              )}
            >
              <Icon
                className="h-5 w-5 shrink-0"
                style={{ color: active ? COLORS.purple400 : COLORS.textMuted }}
              />
              <span
                className="text-sm"
                style={{
                  color: active ? COLORS.textPrimary : COLORS.textSecondary,
                  fontFamily: FONTS.body,
                }}
              >
                {t(key)}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-4 touch-manipulation"
        >
          <LogOut className="h-5 w-5" style={{ color: COLORS.danger }} />
          <span className="text-sm" style={{ color: COLORS.danger, fontFamily: FONTS.body }}>
            {t('logout')}
          </span>
        </button>
      </nav>
    </BottomSheet>
  );
}
