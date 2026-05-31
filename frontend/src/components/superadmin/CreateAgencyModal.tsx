'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Building2, UserCog } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { COLORS, FONTS } from '@/lib/design-system';
import api from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  address: z.string().min(5, 'Adresse requise'),
  phone: z.string().min(8, 'Téléphone requis'),
  logo: z.string().url('URL invalide').optional().or(z.literal('')),
  adminName: z.string().min(2, 'Nom admin requis'),
  adminEmail: z.string().email('Email invalide'),
  adminPassword: z.string().min(8, 'Minimum 8 caractères'),
});
type FormData = z.infer<typeof schema>;

export function CreateAgencyModal({ onClose, onSuccess, token }: {
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}) {
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState<'agency' | 'admin'>('agency');

  const { register, handleSubmit, formState: { errors, isSubmitting }, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const goNext = async () => {
    const valid = await trigger(['name', 'address', 'phone']);
    if (valid) setStep('admin');
  };

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await api.post('/api/superadmin/agencies', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg ?? 'Une erreur est survenue');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <GlassCard className="w-full max-w-lg p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: COLORS.textPrimary, fontFamily: FONTS.display }}>
            Créer une agence
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10" style={{ color: COLORS.textMuted }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="mb-6 flex items-center gap-2">
          {(['agency', 'admin'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: step === s ? '#8b5cf6' : step === 'admin' && s === 'agency' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)',
                  color: step === s ? '#fff' : step === 'admin' && s === 'agency' ? '#10b981' : COLORS.textMuted,
                }}
              >
                {i + 1}
              </div>
              <span className="text-sm" style={{ color: step === s ? COLORS.textPrimary : COLORS.textMuted }}>
                {s === 'agency' ? 'Agence' : 'Administrateur'}
              </span>
              {i === 0 && <div className="h-px w-8 flex-1" style={{ backgroundColor: COLORS.borderSubtle }} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 'agency' && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4" style={{ color: '#8b5cf6' }} />
                <span className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>Informations de l'agence</span>
              </div>
              <Input label="Nom de l'agence" error={errors.name?.message} {...register('name')} />
              <Input label="Adresse" error={errors.address?.message} {...register('address')} />
              <Input label="Téléphone" error={errors.phone?.message} {...register('phone')} />
              <Input label="Logo (URL, optionnel)" error={errors.logo?.message} {...register('logo')} />
              <Button type="button" variant="primary" fullWidth onClick={goNext}>
                Suivant →
              </Button>
            </>
          )}

          {step === 'admin' && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <UserCog className="h-4 w-4" style={{ color: '#8b5cf6' }} />
                <span className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>Compte administrateur</span>
              </div>
              <Input label="Nom complet" error={errors.adminName?.message} {...register('adminName')} />
              <Input type="email" label="Email" error={errors.adminEmail?.message} {...register('adminEmail')} />
              <Input type="password" label="Mot de passe" error={errors.adminPassword?.message} {...register('adminPassword')} />

              {serverError && (
                <p className="text-sm rounded-lg p-3" style={{ color: COLORS.danger, backgroundColor: 'rgba(239,68,68,0.1)' }}>
                  {serverError}
                </p>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setStep('agency')} className="flex-1">
                  ← Retour
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting} className="flex-1">
                  Créer l'agence
                </Button>
              </div>
            </>
          )}
        </form>
      </GlassCard>
    </div>
  );
}
