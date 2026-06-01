'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initFromStorage = useAuthStore((s) => s.initFromStorage);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) return; // already initialised — don't re-run

    const m = window.location.pathname.match(/\/agency\/([^/]+)/);
    const slugFromUrl = m?.[1];
    const slugFromStorage = localStorage.getItem('agency_slug') ?? undefined;
    void initFromStorage(slugFromUrl ?? slugFromStorage);
  }, []); // run once on mount only

  return <>{children}</>;
}
