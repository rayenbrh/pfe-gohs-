'use client';

import { useEffect, useState } from 'react';
import { Plus, Power, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { COLORS, FONTS } from '@/lib/design-system';
import api, { unwrapApiResponse } from '@/lib/api';
import { useSuperAdminStore } from '@/stores/superAdminStore';

interface Account {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

const createSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
});
type CreateForm = z.infer<typeof createSchema>;

export default function AccountsPage() {
  const { token } = useSuperAdminStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [serverError, setServerError] = useState('');

  const authHeaders = { Authorization: `Bearer ${token}` };

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });

  const fetchAccounts = () => {
    api.get('/api/superadmin/accounts', { headers: authHeaders })
      .then(({ data }) => {
        const p = unwrapApiResponse<{ accounts: Account[] }>(data);
        setAccounts(p.accounts ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAccounts(); }, [token]);

  const toggleStatus = async (id: string, current: boolean) => {
    await api.patch(`/api/superadmin/accounts/${id}`, { isActive: !current }, { headers: authHeaders });
    fetchAccounts();
  };

  const onCreate = async (data: CreateForm) => {
    setServerError('');
    try {
      await api.post('/api/superadmin/accounts', data, { headers: authHeaders });
      reset();
      setShowCreate(false);
      fetchAccounts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg ?? 'Erreur serveur');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.textPrimary, fontFamily: FONTS.display }}>
            Comptes Super Admin
          </h1>
          <p className="mt-1 text-sm" style={{ color: COLORS.textMuted }}>Gérer les accès administrateurs globaux</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(v => !v)}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau compte
        </Button>
      </div>

      {showCreate && (
        <GlassCard className="mb-6 p-6">
          <h2 className="mb-4 font-semibold" style={{ color: COLORS.textPrimary }}>Créer un compte</h2>
          <form onSubmit={handleSubmit(onCreate)} className="grid grid-cols-3 gap-4">
            <Input label="Nom" error={errors.name?.message} {...register('name')} />
            <Input type="email" label="Email" error={errors.email?.message} {...register('email')} />
            <Input type="password" label="Mot de passe" error={errors.password?.message} {...register('password')} />
            {serverError && <p className="col-span-3 text-sm" style={{ color: COLORS.danger }}>{serverError}</p>}
            <div className="col-span-3 flex gap-3">
              <Button type="submit" variant="primary" isLoading={isSubmitting}>Créer</Button>
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Annuler</Button>
            </div>
          </form>
        </GlassCard>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : (
        <GlassCard className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${COLORS.borderSubtle}` }}>
                {['Compte', 'Email', 'Dernière connexion', 'Statut', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: COLORS.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((a, i) => (
                <tr
                  key={a._id}
                  className="transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: i < accounts.length - 1 ? `1px solid ${COLORS.borderSubtle}` : undefined }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                        style={{ backgroundColor: 'rgba(139,92,246,0.2)', color: '#8b5cf6' }}
                      >
                        {a.name[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: COLORS.textPrimary }}>{a.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: COLORS.textMuted }}>{a.email}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: COLORS.textMuted }}>
                    {a.lastLogin ? new Date(a.lastLogin).toLocaleString('fr-FR') : 'Jamais'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: a.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: a.isActive ? '#10b981' : '#ef4444',
                      }}
                    >
                      {a.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(a._id, a.isActive)}
                      className="rounded-lg p-1.5 hover:bg-white/10"
                    >
                      <Power className="h-4 w-4" style={{ color: a.isActive ? COLORS.danger : '#10b981' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
}
