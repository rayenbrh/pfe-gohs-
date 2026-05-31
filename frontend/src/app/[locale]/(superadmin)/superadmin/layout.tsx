'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, ChartBar, LayoutDashboard, LogOut, Settings, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { COLORS, FONTS } from '@/lib/design-system';

const navItems = [
  { href: '/superadmin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/superadmin/agencies', label: 'Agences', icon: Building2 },
  { href: '/superadmin/accounts', label: 'Comptes', icon: Users },
  { href: '/superadmin/stats', label: 'Statistiques', icon: ChartBar },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initFromStorage, logout, user } = useSuperAdminStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    initFromStorage();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !pathname.includes('/login')) {
      router.push('/superadmin/login');
    }
  }, [isAuthenticated, pathname]);

  if (!isAuthenticated && !pathname.includes('/login')) {
    return null;
  }

  if (pathname.includes('/login')) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: COLORS.bgBase }}>
      {/* Sidebar */}
      <aside
        className="flex w-64 flex-col border-r"
        style={{ borderColor: COLORS.borderSubtle, backgroundColor: 'rgba(255,255,255,0.03)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b px-6 py-5" style={{ borderColor: COLORS.borderSubtle }}>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            <ShieldCheck className="h-5 w-5" style={{ color: '#10b981' }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: COLORS.textPrimary, fontFamily: FONTS.display }}>Super Admin</p>
            <p className="text-xs" style={{ color: COLORS.textMuted }}>Gestion globale</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                style={{
                  color: isActive ? '#10b981' : COLORS.textMuted,
                  backgroundColor: isActive ? 'rgba(16,185,129,0.1)' : 'transparent',
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="border-t px-4 py-4" style={{ borderColor: COLORS.borderSubtle }}>
          <div className="mb-3 flex items-center gap-2 px-1">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
              style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#10b981' }}
            >
              {user?.name?.[0]?.toUpperCase() ?? 'SA'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium" style={{ color: COLORS.textPrimary }}>{user?.name}</p>
              <p className="truncate text-xs" style={{ color: COLORS.textMuted }}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5"
            style={{ color: COLORS.textMuted }}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
