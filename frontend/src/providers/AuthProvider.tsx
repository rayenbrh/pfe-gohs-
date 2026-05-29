'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/stores/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initFromStorage = useAuthStore((s) => s.initFromStorage);

  useEffect(() => {
    void initFromStorage();
  }, [initFromStorage]);

  return <>{children}</>;
}
