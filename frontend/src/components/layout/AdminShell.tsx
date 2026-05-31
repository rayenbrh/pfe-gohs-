'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { useRouter } from '@/i18n/routing';
import { COLORS } from '@/lib/design-system';
import { useAuthStore } from '@/stores/authStore';
import { isAdminOrEmployee } from '@/types/user';

import { AdminMobileNavSheet } from './AdminMobileNavSheet';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [guardReady, setGuardReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const slug = typeof localStorage !== 'undefined'
        ? localStorage.getItem('agency_slug')
        : null;
      if (slug) {
        router.replace(`/agency/${slug}/auth/login` as Parameters<typeof router.replace>[0]);
      } else {
        router.replace('/auth/login');
      }
      setGuardReady(false);
      return;
    }

    if (!user || !isAdminOrEmployee(user.role)) {
      router.replace('/');
      setGuardReady(false);
      return;
    }

    setGuardReady(true);
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !guardReady) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: COLORS.bgBase }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen overflow-x-hidden rtl:flex-row-reverse"
      style={{ backgroundColor: COLORS.bgBase }}
    >
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onMenuClick={() => setMobileNavOpen(true)} />
        <main
          className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6"
          style={{
            minHeight: 'calc(100vh - 64px)',
            backgroundColor: COLORS.bgBase,
          }}
        >
          {children}
        </main>
      </div>

      <AdminMobileNavSheet open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </div>
  );
}
