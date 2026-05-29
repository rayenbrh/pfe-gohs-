import axios, { type AxiosError } from 'axios';

import { appToast } from '@/lib/app-toast';
import { getToken } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';

/** Backend wraps payloads as `{ status, data: T }` or `{ success, data: T }`. */
export function unwrapApiResponse<T>(body: unknown): T {
  if (body !== null && typeof body === 'object' && 'data' in body) {
    const envelope = body as { data?: T };
    if (envelope.data !== undefined) {
      return envelope.data;
    }
  }
  return body as T;
}

if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
  console.error(
    '❌ NEXT_PUBLIC_API_URL is not set. Create frontend/.env.local with NEXT_PUBLIC_API_URL=http://localhost:5000',
  );
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken() ?? useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (process.env.NODE_ENV === 'development') {
      const method = error.config?.method?.toUpperCase() ?? 'REQUEST';
      const url = error.config?.url ?? 'unknown';
      console.warn(
        `[API] ${method} ${url} failed:`,
        error.response?.status ?? 'Network error',
      );
    }

    const status = error.response?.status;
    const hadAuth = Boolean(error.config?.headers?.Authorization);

    if (status === 401 && hadAuth) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    if (status === 429) {
      appToast('Too many requests, please slow down', 'warning');
    } else if (status && status >= 500) {
      appToast('Server error, please try again', 'error');
    }

    return Promise.reject(error);
  },
);

export default api;
