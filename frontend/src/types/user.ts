export type UserRole = 'admin' | 'super_admin' | 'agent' | 'staff' | 'client';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin' || role === 'agent';
}

export function normalizeUser(raw: Record<string, unknown>): User {
  return {
    _id: String(raw._id ?? raw.id ?? ''),
    name: String(raw.name ?? ''),
    email: String(raw.email ?? ''),
    role: (raw.role as UserRole) ?? 'client',
    avatarUrl: raw.avatarUrl ? String(raw.avatarUrl) : undefined,
  };
}
