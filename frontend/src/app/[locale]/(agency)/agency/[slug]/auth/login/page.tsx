'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import axios from 'axios';
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
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
type Form = z.infer<typeof schema>;

export default function AgencyLoginPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<'credentials' | 'network' | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setError(null);
    try {
      const { data: body } = await api.post(`/api/agency/${slug}/auth/login`, data);
      const payload = unwrapApiResponse<{
        accessToken: string;
        user: Record<string, unknown>;
        agency: { name: string; slug: string; logo?: string };
      }>(body);

      if (!payload.accessToken) { setError('network'); return; }
      const user = normalizeUser({ ...payload.user, agencySlug: slug });
      login(payload.accessToken, user, payload.agency);
      localStorage.setItem('agency_slug', slug);

      const role = user.role;
      if (role === 'admin' || role === 'employee') {
        router.push('/admin/dashboard');
      } else {
        router.push(`/agency/${slug}/`);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('credentials');
      } else {
        setError('network');
      }
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: COLORS.bgBase }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.3) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center gap-6">
        <h1 className="text-2xl font-bold" style={{ color: COLORS.textPrimary, fontFamily: FONTS.display }}>
          Connexion
        </h1>

        <GlassCard className="w-full p-8" glowColor="purple">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              type="email"
              label="Email"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Mot de passe"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              endAdornment={
                <button type="button" onClick={() => setShowPassword(v => !v)} className="p-1" style={{ color: COLORS.textMuted }}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('password')}
            />
            <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting} className="mt-2">
              Se connecter
            </Button>
          </form>

          {error === 'credentials' && (
            <GlassCard className="mt-4 flex items-center gap-3 p-3" glowColor="none">
              <AlertCircle className="h-4 w-4 shrink-0" style={{ color: COLORS.danger }} />
              <p className="text-sm" style={{ color: COLORS.danger }}>Identifiants incorrects</p>
            </GlassCard>
          )}
          {error === 'network' && (
            <GlassCard className="mt-4 flex items-center gap-3 p-3" glowColor="none">
              <AlertCircle className="h-4 w-4 shrink-0" style={{ color: COLORS.warning }} />
              <p className="text-sm" style={{ color: COLORS.warning }}>Erreur de connexion</p>
            </GlassCard>
          )}

          <p className="mt-6 text-center text-sm" style={{ color: COLORS.textMuted }}>
            Pas encore de compte ?{' '}
            <Link href={`/agency/${slug}/auth/register`} style={{ color: COLORS.purple400 }}>
              S'inscrire
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
