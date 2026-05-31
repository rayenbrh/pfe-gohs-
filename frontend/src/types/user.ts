export type UserRole = 'super_admin' | 'admin' | 'employee' | 'client';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  agencySlug?: string;
}

export function isAdminOrEmployee(role: UserRole): boolean {
  return role === 'admin' || role === 'employee';
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'admin';
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === 'super_admin';
}

export function normalizeUser(raw: Record<string, unknown>): User {
  const firstName = raw.firstName ? String(raw.firstName) : '';
  const lastName = raw.lastName ? String(raw.lastName) : '';
  const name = String(raw.name ?? (firstName ? `${firstName} ${lastName}`.trim() : '') ?? '');

  return {
    _id: String(raw._id ?? raw.id ?? ''),
    name,
    email: String(raw.email ?? ''),
    role: (raw.role as UserRole) ?? 'client',
    avatarUrl: raw.avatarUrl ? String(raw.avatarUrl) : undefined,
    agencySlug: raw.agencySlug ? String(raw.agencySlug) : undefined,
  };
}
