'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import api, { unwrapApiResponse } from '@/lib/api';
import { COLORS, FONTS } from '@/lib/design-system';
import { useAuthStore } from '@/stores/authStore';
import { normalizeUser } from '@/types/user';

const schema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Téléphone requis'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string(),
  nationality: z.string().min(2, 'Nationalité requise'),
  idType: z.enum(['cin', 'passport', 'driving_license']),
  idNumber: z.string().min(3, 'Numéro requis'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});
type Form = z.infer<typeof schema>;

export default function AgencyRegisterPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { login } = useAuthStore();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { idType: 'cin' },
  });

  const onSubmit = async (data: Form) => {
    setServerError('');
    const { confirmPassword, ...payload } = data;
    try {
      const { data: body } = await api.post(`/api/agency/${slug}/auth/register`, payload);
      const res = unwrapApiResponse<{
        accessToken: string;
        user: Record<string, unknown>;
        agency: { name: string; slug: string; logo?: string };
      }>(body);

      const user = normalizeUser({ ...res.user, agencySlug: slug });
      login(res.accessToken, user, res.agency);
      router.push(`/agency/${slug}/`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg ?? 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: COLORS.bgBase }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.3) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-[520px]">
        <h1 className="mb-6 text-center text-2xl font-bold" style={{ color: COLORS.textPrimary, fontFamily: FONTS.display }}>
          Créer un compte client
        </h1>

        <GlassCard className="p-8" glowColor="purple">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Prénom" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Nom" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input type="email" label="Email" error={errors.email?.message} {...register('email')} />
            <Input label="Téléphone" error={errors.phone?.message} {...register('phone')} />
            <Input label="Nationalité" error={errors.nationality?.message} {...register('nationality')} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                  Type de pièce d'identité
                </label>
                <select
                  className="w-full rounded-lg border px-3 py-2.5 text-sm"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: COLORS.borderSubtle, color: COLORS.textPrimary }}
                  {...register('idType')}
                >
                  <option value="cin">CIN</option>
                  <option value="passport">Passeport</option>
                  <option value="driving_license">Permis de conduire</option>
                </select>
              </div>
              <Input label="Numéro" error={errors.idNumber?.message} {...register('idNumber')} />
            </div>

            <Input type="password" label="Mot de passe" error={errors.password?.message} {...register('password')} />
            <Input type="password" label="Confirmer le mot de passe" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

            {serverError && (
              <GlassCard className="flex items-center gap-3 p-3" glowColor="none">
                <AlertCircle className="h-4 w-4 shrink-0" style={{ color: COLORS.danger }} />
                <p className="text-sm" style={{ color: COLORS.danger }}>{serverError}</p>
              </GlassCard>
            )}

            <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting} className="mt-2">
              Créer mon compte
            </Button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: COLORS.textMuted }}>
            Déjà inscrit ?{' '}
            <Link href={`/agency/${slug}/auth/login`} style={{ color: COLORS.purple400 }}>
              Se connecter
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
