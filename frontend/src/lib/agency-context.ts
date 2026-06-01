'use client';

import { useEffect, useState } from 'react';

import { useAuthStore } from '@/stores/authStore';

import { useAgencySlugFromPath } from '@/hooks/useAgencySlugFromPath';

/** Agency slug from auth, localStorage, or current URL (for admin routes). */
export function useResolvedAgencySlug(): string | null {
  const userSlug = useAuthStore((s) => s.user?.agencySlug ?? s.agency?.slug ?? null);
  const pathSlug = useAgencySlugFromPath();
  const [storedSlug, setStoredSlug] = useState<string | null>(null);

  useEffect(() => {
    setStoredSlug(localStorage.getItem('agency_slug'));
  }, []);

  return userSlug ?? storedSlug ?? pathSlug;
}

/** Resolve agency slug from auth store, then localStorage (for /admin/* routes). */
export function getResolvedAgencySlug(): string | null {
  const state = useAuthStore.getState();
  const fromUser = state.user?.agencySlug ?? state.agency?.slug;
  if (fromUser) return fromUser;

  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('agency_slug');
    if (stored) return stored;
  }

  if (typeof window !== 'undefined') {
    const m = window.location.pathname.match(/\/agency\/([^/]+)/);
    if (m?.[1]) return m[1];
  }

  return null;
}

export function agencyAuthLoginPath(slug: string): string {
  return `/agency/${slug}/auth/login`;
}

export function agencyAuthRegisterPath(slug: string): string {
  return `/agency/${slug}/auth/register`;
}

export const DEFAULT_AGENCY_SLUG = 'inova-ride';
