'use client';

import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Users, UserCheck, UserCog } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { COLORS, FONTS } from '@/lib/design-system';
import api, { unwrapApiResponse } from '@/lib/api';
import { useSuperAdminStore } from '@/stores/superAdminStore';

interface GlobalStats {
  agencies: { total: number; active: number };
  users: { total: number; admins: number; employees: number; clients: number };
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <GlassCard className="flex items-center gap-4 p-5">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: COLORS.textPrimary, fontFamily: FONTS.display }}>{value}</p>
        <p className="text-sm" style={{ color: COLORS.textMuted }}>{label}</p>
      </div>
    </GlassCard>
  );
}

export default function SuperAdminDashboard() {
  const { token } = useSuperAdminStore();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.get('/api/superadmin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        const payload = unwrapApiResponse<GlobalStats>(data);
        setStats(payload);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: COLORS.textPrimary, fontFamily: FONTS.display }}>
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm" style={{ color: COLORS.textMuted }}>
          Vue d'ensemble de la plateforme
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard label="Agences totales" value={stats?.agencies.total ?? 0} icon={Building2} color="#8b5cf6" />
          <StatCard label="Agences actives" value={stats?.agencies.active ?? 0} icon={CheckCircle2} color="#10b981" />
          <StatCard label="Utilisateurs totaux" value={stats?.users.total ?? 0} icon={Users} color="#3b82f6" />
          <StatCard label="Clients" value={stats?.users.clients ?? 0} icon={UserCheck} color="#f59e0b" />
        </div>
      )}

      {!loading && stats && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          <GlassCard className="p-6">
            <h2 className="mb-4 text-lg font-semibold" style={{ color: COLORS.textPrimary }}>Répartition des utilisateurs</h2>
            <div className="space-y-3">
              {[
                { label: 'Administrateurs', value: stats.users.admins, color: '#8b5cf6' },
                { label: 'Employés', value: stats.users.employees, color: '#3b82f6' },
                { label: 'Clients', value: stats.users.clients, color: '#10b981' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm" style={{ color: COLORS.textMuted }}>{label}</span>
                  </div>
                  <span className="font-semibold" style={{ color: COLORS.textPrimary }}>{value}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="mb-4 text-lg font-semibold" style={{ color: COLORS.textPrimary }}>Agences</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: COLORS.textMuted }}>Total</span>
                <span className="font-semibold" style={{ color: COLORS.textPrimary }}>{stats.agencies.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: COLORS.textMuted }}>Actives</span>
                <span className="font-semibold" style={{ color: '#10b981' }}>{stats.agencies.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: COLORS.textMuted }}>Inactives</span>
                <span className="font-semibold" style={{ color: COLORS.danger }}>{stats.agencies.total - stats.agencies.active}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
