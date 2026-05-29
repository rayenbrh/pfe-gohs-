import { create } from 'zustand';

import { clearToken, getToken, setToken } from '@/lib/auth';
import { getLocaleFromPathname } from '@/lib/locale-path';
import { normalizeUser, type User } from '@/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  initFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: (token, user) => {
    setToken(token);
    set({
      token,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    clearToken();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });

    if (typeof window !== 'undefined') {
      const locale = getLocaleFromPathname(window.location.pathname);
      window.location.href = `/${locale}/auth/login`;
    }
  },

  initFromStorage: async () => {
    const stored = getToken();
    if (!stored) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, token: stored });

    try {
      const { default: apiClient, unwrapApiResponse } = await import('@/lib/api');
      const { data: body } = await apiClient.get('/api/auth/me');
      const payload = unwrapApiResponse<{ user?: Record<string, unknown> }>(body);
      const rawUser = (payload.user ?? payload) as Record<string, unknown>;
      const user = normalizeUser(rawUser);

      set({
        user,
        token: stored,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      clearToken();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
