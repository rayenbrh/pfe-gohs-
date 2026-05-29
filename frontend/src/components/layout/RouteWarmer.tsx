'use client';

import { useEffect } from 'react';

import { useRouter } from '@/i18n/routing';

const ROUTES = [
  '/admin/dashboard',
  '/admin/fleet',
  '/admin/reservations',
  '/admin/clients',
  '/admin/contracts',
  '/admin/invoices',
  '/admin/maintenance',
  '/admin/hr',
  '/admin/settings',
  '/landing',
  '/fleet',
  '/booking',
  '/auth/login',
] as const;

export function RouteWarmer() {
  const router = useRouter();

  useEffect(() => {
    ROUTES.forEach((route, index) => {
      window.setTimeout(() => {
        router.prefetch(route);
      }, index * 100);
    });
  }, [router]);

  return null;
}
