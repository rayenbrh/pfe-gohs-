import { create } from 'zustand';

const TOKEN_KEY = 'sa_token';

interface SuperAdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SuperAdminState {
  user: SuperAdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: SuperAdminUser) => void;
  logout: () => void;
  initFromStorage: () => void;
}

function saveToken(token: string) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
}

function loadToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function clearToken() {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}

export const useSuperAdminStore = create<SuperAdminState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (token, user) => {
    saveToken(token);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    clearToken();
    set({ token: null, user: null, isAuthenticated: false });
    if (typeof window !== 'undefined') window.location.href = '/superadmin/login';
  },

  initFromStorage: () => {
    const token = loadToken();
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
}));
