'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import axios from 'axios';

import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import api, { unwrapApiResponse } from '@/lib/api';
import { COLORS, FONTS } from '@/lib/design-system';
import { useSuperAdminStore } from '@/stores/superAdminStore';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { login } = useSuperAdminStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<'credentials' | 'network' | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      const { data: body } = await api.post('/api/superadmin/auth/login', data);
      const payload = unwrapApiResponse<{ accessToken: string; user: Record<string, unknown> }>(body);
      if (!payload.accessToken) { setError('network'); return; }
      login(payload.accessToken, payload.user as { id: string; name: string; email: string; role: string });
      router.push('/superadmin/dashboard');
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
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            <ShieldCheck className="h-7 w-7" style={{ color: '#10b981' }} />
          </div>
          <h1 className="text-2xl font-bold tracking-wide" style={{ color: COLORS.textPrimary, fontFamily: FONTS.display }}>
            Super Admin
          </h1>
          <p className="text-sm" style={{ color: COLORS.textMuted }}>Plateforme de gestion globale</p>
        </div>

        <GlassCard className="w-full p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              type="email"
              label="Adresse e-mail"
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
              <p className="text-sm" style={{ color: COLORS.warning }}>Erreur de connexion au serveur</p>
            </GlassCard>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
