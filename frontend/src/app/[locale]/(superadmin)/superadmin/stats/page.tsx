'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, UserCheck, UserCog } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { COLORS, FONTS } from '@/lib/design-system';
import api, { unwrapApiResponse } from '@/lib/api';
import { useSuperAdminStore } from '@/stores/superAdminStore';

interface GlobalStats {
  agencies: { total: number; active: number };
  users: { total: number; admins: number; employees: number; clients: number };
}

export default function StatsPage() {
  const { token } = useSuperAdminStore();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.get('/api/superadmin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setStats(unwrapApiResponse<GlobalStats>(data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const metrics = stats ? [
    { label: 'Agences totales', value: stats.agencies.total, icon: Building2, color: '#8b5cf6' },
    { label: 'Agences actives', value: stats.agencies.active, icon: Building2, color: '#10b981' },
    { label: 'Tous les utilisateurs', value: stats.users.total, icon: Users, color: '#3b82f6' },
    { label: 'Administrateurs', value: stats.users.admins, icon: UserCog, color: '#f59e0b' },
    { label: 'Employés', value: stats.users.employees, icon: Users, color: '#06b6d4' },
    { label: 'Clients', value: stats.users.clients, icon: UserCheck, color: '#10b981' },
  ] : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: COLORS.textPrimary, fontFamily: FONTS.display }}>
          Statistiques globales
        </h1>
        <p className="mt-1 text-sm" style={{ color: COLORS.textMuted }}>
          Métriques agrégées de toutes les agences
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {metrics.map(({ label, value, icon: Icon, color }) => (
            <GlassCard key={label} className="p-5">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
                >
                  <Icon className="h-6 w-6" style={{ color }} />
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: COLORS.textPrimary, fontFamily: FONTS.display }}>{value}</p>
                  <p className="text-sm" style={{ color: COLORS.textMuted }}>{label}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
