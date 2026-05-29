'use client';

import { useTranslations } from 'next-intl';

import { Logo } from '@/components/layout/Logo';
import { GlassCard } from '@/components/ui/GlassCard';
import { Link } from '@/i18n/routing';
import { COLORS, FONTS } from '@/lib/design-system';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');

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

        <GlassCard className="w-full p-8 text-center" glowColor="purple">
          <h1
            className="text-xl font-bold tracking-[0.12em]"
            style={{ fontFamily: FONTS.display, color: COLORS.textPrimary }}
          >
            {t('forgot_password_title')}
          </h1>
          <p
            className="mt-3 text-sm"
            style={{ fontFamily: FONTS.body, color: COLORS.textMuted }}
          >
            {t('forgot_password_placeholder')}
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm transition-opacity hover:opacity-80"
            style={{ color: COLORS.purple400, fontFamily: FONTS.body }}
          >
            {t('back_to_login')}
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}
