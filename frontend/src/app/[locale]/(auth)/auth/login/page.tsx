'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import axios from 'axios';

import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Link, useRouter } from '@/i18n/routing';
import api, { unwrapApiResponse } from '@/lib/api';
import { COLORS, FONTS } from '@/lib/design-system';
import { useAuthStore } from '@/stores/authStore';
import { normalizeUser } from '@/types/user';

type LoginForm = {
  email: string;
  password: string;
};

type LoginError = 'invalid_credentials' | 'network' | null;

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<LoginError>(null);

  const loginSchema = z.object({
    email: z.string().email(t('validation_invalid_email')),
    password: z.string().min(1, t('validation_password_required')),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setFormError(null);

    try {
      const { data: body } = await api.post('/api/auth/login', {
        email: data.email,
        password: data.password,
      });

      const payload = unwrapApiResponse<{
        accessToken?: string;
        token?: string;
        user?: Record<string, unknown>;
      }>(body);

      const token = payload.accessToken ?? payload.token;
      if (!token) {
        setFormError('network');
        return;
      }
      const user = normalizeUser((payload.user ?? {}) as Record<string, unknown>);
      login(token, user);
      router.push('/admin/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setFormError('invalid_credentials');
          return;
        }
        if (!error.response) {
          setFormError('network');
          return;
        }
      }
      setFormError('network');
    }
  };

  return (
    <div
      className="auth-starfield relative flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: COLORS.bgBase }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none"
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100vw',
          maxWidth: '1400px',
          height: '55vh',
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124, 58, 237, 0.35) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center">
        <Link href="/" className="mb-8 shrink-0">
          <Logo markSize={48} />
        </Link>

        <GlassCard className="w-full p-8" glowColor="purple">
          <h1
            className="text-center text-2xl font-bold tracking-[0.15em]"
            style={{ fontFamily: FONTS.display, color: COLORS.textPrimary }}
          >
            {t('welcome_back')}
          </h1>
          <p
            className="mt-2 text-center text-sm"
            style={{ fontFamily: FONTS.body, color: COLORS.textMuted }}
          >
            {t('sign_in_subtitle')}
          </p>

          <div
            className="my-6 h-px w-full"
            style={{ backgroundColor: COLORS.borderSubtle }}
          />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              type="email"
              autoComplete="email"
              label={t('email')}
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              label={t('password')}
              icon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="inline-flex p-1"
                  style={{ color: COLORS.textMuted }}
                  aria-label={showPassword ? t('hide_password') : t('show_password')}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              className="mt-2"
            >
              {t('sign_in')}
            </Button>
          </form>

          {formError === 'invalid_credentials' ? (
            <GlassCard className="mt-4 flex items-center gap-3 p-4" glowColor="none">
              <AlertCircle className="h-5 w-5 shrink-0" style={{ color: COLORS.danger }} />
              <p className="text-sm" style={{ color: COLORS.danger, fontFamily: FONTS.body }}>
                {t('error_invalid_credentials')}
              </p>
            </GlassCard>
          ) : null}

          {formError === 'network' ? (
            <GlassCard className="mt-4 flex items-center gap-3 p-4" glowColor="none">
              <AlertCircle className="h-5 w-5 shrink-0" style={{ color: COLORS.warning }} />
              <p className="text-sm" style={{ color: COLORS.warning, fontFamily: FONTS.body }}>
                {t('error_connection')}
              </p>
            </GlassCard>
          ) : null}

          <p className="mt-6 text-center text-sm" style={{ fontFamily: FONTS.body }}>
            <Link
              href="/auth/forgot-password"
              className="transition-opacity hover:opacity-80"
              style={{ color: COLORS.purple400 }}
            >
              {t('forgot_password')}
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
