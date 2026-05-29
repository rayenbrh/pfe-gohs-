'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';
import { COLORS, FONTS } from '@/lib/design-system';

interface StepConfirmationProps {
  reservationRef: string;
}

export function StepConfirmation({ reservationRef }: StepConfirmationProps) {
  const t = useTranslations('booking');

  useEffect(() => {
    void import('canvas-confetti').then((confetti) => {
      const fire = confetti.default;
      fire({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [COLORS.purple600, COLORS.purple400, COLORS.cyan400],
      });
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-border-default bg-bg-surface p-10 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)' }}
      >
        <span className="text-3xl">✓</span>
      </motion.div>
      <h2 className="font-display text-2xl font-bold text-text-primary">
        {t('success_title')}
      </h2>
      <p className="mt-2 text-text-secondary">{t('success_subtitle')}</p>
      <p
        className="mt-6 font-display text-2xl font-bold"
        style={{ color: COLORS.purple300, fontFamily: FONTS.display }}
      >
        {reservationRef}
      </p>
      <p className="mt-4 text-sm text-text-muted">{t('email_notice')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/fleet">
          <Button variant="ghost">{t('back_fleet')}</Button>
        </Link>
        <Button>{t('view_reservation')}</Button>
      </div>
    </motion.div>
  );
}
