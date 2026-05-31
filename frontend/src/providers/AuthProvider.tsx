'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initFromStorage = useAuthStore((s) => s.initFromStorage);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) return; // already initialised — don't re-run

    // Detect agency slug from URL so /auth/me hits the correct tenant endpoint
    const m = window.location.pathname.match(/\/agency\/([^/]+)/);
    const slug = m?.[1] ?? undefined;
    void initFromStorage(slug);
  }, []); // run once on mount only

  return <>{children}</>;
}
