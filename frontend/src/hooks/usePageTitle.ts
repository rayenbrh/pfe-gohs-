'use client';

import { useTranslations } from 'next-intl';

import { usePathname } from '@/i18n/routing';

const pathToAdminKey: { pattern: string; key: string }[] = [
  { pattern: '/admin/dashboard', key: 'dashboard' },
  { pattern: '/admin/fleet/new', key: 'fleet' },
  { pattern: '/admin/fleet', key: 'fleet' },
  { pattern: '/admin/reservations', key: 'reservations' },
  { pattern: '/admin/clients', key: 'clients' },
  { pattern: '/admin/contracts', key: 'contracts' },
  { pattern: '/admin/invoices', key: 'invoices' },
  { pattern: '/admin/maintenance', key: 'maintenance' },
  { pattern: '/admin/hr', key: 'hr' },
  { pattern: '/admin/settings', key: 'settings' },
];

export function usePageTitle(): string {
  const pathname = usePathname();
  const t = useTranslations('admin');

  const match = pathToAdminKey.find(({ pattern }) => pathname.startsWith(pattern));
  return match ? t(match.key as 'dashboard') : t('dashboard');
}
