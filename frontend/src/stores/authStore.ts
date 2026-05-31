import { create } from 'zustand';

import { clearToken, getToken, setToken } from '@/lib/auth';
import { normalizeUser, type User } from '@/types/user';

interface AgencyInfo {
  name: string;
  slug: string;
  logo?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  agency: AgencyInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User, agency?: AgencyInfo) => void;
  logout: () => void;
  initFromStorage: (agencySlug?: string) => Promise<void>;
}

function getAgencySlugFromPath(): string | null {
  if (typeof window === 'undefined') return null;
  const m = window.location.pathname.match(/\/agency\/([^/]+)/);
  return m?.[1] ?? null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  agency: null,
  isAuthenticated: false,
  isLoading: true,

  login: (token, user, agency) => {
    setToken(token);
    set({ token, user, agency: agency ?? null, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    clearToken();
    if (typeof localStorage !== 'undefined') localStorage.removeItem('agency_slug');
    set({ user: null, token: null, agency: null, isAuthenticated: false, isLoading: false });

    if (typeof window !== 'undefined') {
      const slug = getAgencySlugFromPath();
      if (slug) {
        window.location.href = `/agency/${slug}/auth/login`;
      } else {
        window.location.href = '/';
      }
    }
  },

  initFromStorage: async (agencySlug?: string) => {
    if (get().isAuthenticated) return;

    const stored = getToken();
    if (!stored) {
      set({ user: null, token: null, agency: null, isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true, token: stored });

    try {
      const { default: apiClient, unwrapApiResponse } = await import('@/lib/api');
      const slug = agencySlug ?? getAgencySlugFromPath();
      const endpoint = slug
        ? `/api/agency/${slug}/auth/me`
        : '/api/auth/me';

      const { data: body } = await apiClient.get(endpoint);
      const payload = unwrapApiResponse<{
        user?: Record<string, unknown>;
        agency?: AgencyInfo;
      }>(body);
      const rawUser = (payload.user ?? payload) as Record<string, unknown>;
      const user = normalizeUser(rawUser);

      set({
        user,
        token: stored,
        agency: payload.agency ?? null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      clearToken();
      set({ user: null, token: null, agency: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
