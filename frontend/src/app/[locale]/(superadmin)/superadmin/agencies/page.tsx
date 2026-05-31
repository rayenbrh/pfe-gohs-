'use client';

import { useEffect, useState } from 'react';
import { Building2, Plus, Pencil, Power, Search } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { COLORS, FONTS } from '@/lib/design-system';
import api, { unwrapApiResponse } from '@/lib/api';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { CreateAgencyModal } from '@/components/superadmin/CreateAgencyModal';

interface Agency {
  _id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AgenciesPage() {
  const { token } = useSuperAdminStore();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchAgencies = () => {
    api.get('/api/superadmin/agencies', { headers: authHeaders })
      .then(({ data }) => {
        const payload = unwrapApiResponse<{ agencies: Agency[] }>(data);
        setAgencies(payload.agencies ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAgencies(); }, [token]);

  const toggleStatus = async (id: string, current: boolean) => {
    await api.patch(`/api/superadmin/agencies/${id}`, { isActive: !current }, { headers: authHeaders });
    fetchAgencies();
  };

  const filtered = agencies.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.slug.includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.textPrimary, fontFamily: FONTS.display }}>
            Agences
          </h1>
          <p className="mt-1 text-sm" style={{ color: COLORS.textMuted }}>
            Gérer les agences de location
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle agence
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Rechercher une agence…"
          icon={<Search className="h-4 w-4" />}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-3 py-16">
          <Building2 className="h-10 w-10" style={{ color: COLORS.textMuted }} />
          <p style={{ color: COLORS.textMuted }}>Aucune agence trouvée</p>
        </GlassCard>
      ) : (
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: COLORS.borderSubtle }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${COLORS.borderSubtle}` }}>
                {['Agence', 'Slug', 'Adresse', 'Téléphone', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: COLORS.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((agency, i) => (
                <tr
                  key={agency._id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? `1px solid ${COLORS.borderSubtle}` : undefined,
                  }}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 font-medium" style={{ color: COLORS.textPrimary }}>
                    <div className="flex items-center gap-2">
                      {agency.logo ? (
                        <img src={agency.logo} alt="" className="h-7 w-7 rounded-md object-cover" />
                      ) : (
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold"
                          style={{ backgroundColor: 'rgba(139,92,246,0.2)', color: '#8b5cf6' }}
                        >
                          {agency.name[0]?.toUpperCase()}
                        </div>
                      )}
                      {agency.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: COLORS.textMuted }}>{agency.slug}</td>
                  <td className="px-4 py-3 max-w-[180px] truncate" style={{ color: COLORS.textMuted }}>{agency.address}</td>
                  <td className="px-4 py-3" style={{ color: COLORS.textMuted }}>{agency.phone}</td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: agency.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: agency.isActive ? '#10b981' : '#ef4444',
                      }}
                    >
                      {agency.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(agency._id, agency.isActive)}
                      className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
                      title={agency.isActive ? 'Désactiver' : 'Activer'}
                    >
                      <Power className="h-4 w-4" style={{ color: agency.isActive ? COLORS.danger : '#10b981' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateAgencyModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); fetchAgencies(); }}
          token={token ?? ''}
        />
      )}
    </div>
  );
}
