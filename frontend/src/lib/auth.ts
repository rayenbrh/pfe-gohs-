const TOKEN_KEY = 'inova-token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** @deprecated Use getToken — kept for gradual migration */
export function getAccessToken(): string | null {
  return getToken();
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('inova_access_token');
  localStorage.removeItem('inova_refresh_token');
}

export function hasValidToken(): boolean {
  const token = getToken();
  return Boolean(token && token.length > 0);
}
