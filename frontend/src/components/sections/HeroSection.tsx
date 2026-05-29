'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Link } from '@/i18n/routing';
import { COLORS, FONTS } from '@/lib/design-system';

const headlineContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const headlineItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
};

export function HeroSection() {
  const t = useTranslations('landing.hero');

  const statPills = [
    { value: t('pill_vehicles_value'), label: t('pill_vehicles_label'), fullWidth: true },
    { value: t('pill_clients_value'), label: t('pill_clients_label'), fullWidth: false },
    { value: t('pill_support_value'), label: t('pill_support_label'), fullWidth: false },
  ];

  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center"
      style={{ padding: 0, overflow: 'visible' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(138,92,246,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(138,92,246,0.055) 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px',
          maskImage:
            'radial-gradient(ellipse 85% 80% at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 85% 80% at 50% 50%, black 30%, transparent 80%)',
          zIndex: 0,
        }}
      />

      <div className="relative z-[1] mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <GlassCard glowColor="purple" className="!inline-flex !rounded-full !px-5 !py-2">
            <span
              className="text-sm font-medium"
              style={{ color: COLORS.purple300, fontFamily: FONTS.body }}
            >
              {t('badge')}
            </span>
          </GlassCard>
        </motion.div>

        <motion.h1
          variants={headlineContainer}
          initial="hidden"
          animate="show"
          className="font-display font-bold leading-[1.05] tracking-[0.1em]"
        >
          <motion.span
            variants={headlineItem}
            className="block text-[40px] text-text-primary md:text-[72px]"
            style={{ fontFamily: FONTS.display }}
          >
            {t('headline_1')}
          </motion.span>
          <motion.span
            variants={headlineItem}
            className="relative mt-1 inline-block text-[52px] md:text-[88px]"
            style={{
              fontFamily: FONTS.display,
              background: `linear-gradient(135deg, ${COLORS.purple400} 0%, ${COLORS.cyan400} 50%, ${COLORS.purple300} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('headline_2')}
            <motion.span
              className="absolute -bottom-1 start-0 h-[3px] rounded-full"
              style={{ backgroundColor: COLORS.purple600 }}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
            />
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 max-w-[560px] text-sm text-text-secondary sm:text-[15px] md:text-lg"
          style={{ fontFamily: FONTS.body }}
        >
          {t('subheadline')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4"
        >
          <Link href="/booking" className="w-full sm:w-auto">
            <Button size="lg" fullWidth className="sm:!w-auto">
              {t('cta_book')}
            </Button>
          </Link>
          <Link href="/fleet" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="lg"
              fullWidth
              className="sm:!w-auto"
              icon={<ArrowRight className="h-5 w-5" />}
              iconPosition="right"
            >
              {t('cta_explore')}
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1, delayChildren: 0.9 } },
          }}
          className="mt-12 grid w-full max-w-md grid-cols-2 gap-3 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-4"
        >
          {statPills.map((pill) => (
            <motion.div
              key={pill.label}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                show: { opacity: 1, scale: 1 },
              }}
              className={pill.fullWidth ? 'col-span-2' : 'col-span-1'}
            >
              <GlassCard className="!px-5 !py-3 text-center" glowColor="none">
                <p
                  className="font-display text-lg font-bold"
                  style={{ color: COLORS.purple300, fontFamily: FONTS.display }}
                >
                  {pill.value}
                </p>
                <p className="text-sm text-text-muted" style={{ fontFamily: FONTS.body }}>
                  {pill.label}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-[1] hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span
          className="text-sm tracking-[0.2em] text-text-muted"
          style={{ fontFamily: FONTS.display }}
        >
          {t('scroll')}
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-5 w-5 text-text-muted" />
        </motion.div>
      </motion.div>
    </section>
  );
}
