'use client';

import { motion, useInView } from 'framer-motion';
import { Calendar, Car, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

import { Card } from '@/components/ui/Card';
import { COLORS, FONTS } from '@/lib/design-system';

import { SectionBadge } from './SectionBadge';

const steps = [
  { key: 'step1', icon: Car },
  { key: 'step2', icon: Calendar },
  { key: 'step3', icon: MapPin },
] as const;

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HowItWorksSection() {
  const t = useTranslations('landing.how_it_works');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative scroll-mt-24"
      style={{ padding: '80px 24px', background: 'transparent' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[2]"
        style={{
          height: '80px',
          background: `linear-gradient(to bottom, ${COLORS.bgBase} 0%, transparent 100%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: COLORS.bgSurface, opacity: 0.6 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2]"
        style={{
          height: '80px',
          background: `linear-gradient(to top, ${COLORS.bgBase} 0%, transparent 100%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 section-grid opacity-40" aria-hidden />

      <div className="relative z-[3] mx-auto max-w-7xl">
        <div className="text-center">
          <SectionBadge>{t('badge')}</SectionBadge>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mt-6 font-display text-3xl font-bold text-text-primary md:text-4xl"
            style={{ fontFamily: FONTS.display }}
          >
            {t('title')}
          </motion.h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="relative mt-14 grid gap-8 md:grid-cols-3 md:gap-6"
        >
          <svg
            className="pointer-events-none absolute left-[28%] top-[120px] hidden h-8 w-[44%] md:block"
            viewBox="0 0 400 40"
            fill="none"
            aria-hidden
          >
            <motion.path
              d="M 0 20 H 360 M 350 12 L 370 20 L 350 28"
              stroke={COLORS.purple400}
              strokeWidth="2"
              strokeDasharray="8 6"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={inView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.4 }}
            />
          </svg>
          <svg
            className="pointer-events-none absolute left-[61%] top-[120px] hidden h-8 w-[28%] md:block"
            viewBox="0 0 200 40"
            fill="none"
            aria-hidden
          >
            <motion.path
              d="M 0 20 H 160 M 150 12 L 170 20 L 150 28"
              stroke={COLORS.purple400}
              strokeWidth="2"
              strokeDasharray="8 6"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={inView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.55 }}
            />
          </svg>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.key} variants={cardVariant} className="relative">
                <Card padding="lg" className="relative h-full text-center">
                  <span
                    className="pointer-events-none absolute -end-2 -top-4 font-display text-[48px] font-bold opacity-30"
                    style={{ color: COLORS.purple700, fontFamily: FONTS.display }}
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div
                    className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border"
                    style={{
                      background: COLORS.bgGlass,
                      borderColor: COLORS.borderDefault,
                    }}
                  >
                    <Icon className="h-12 w-12" style={{ color: COLORS.purple400 }} />
                  </div>
                  <h3
                    className="text-xl font-semibold text-text-primary"
                    style={{ fontFamily: FONTS.body, fontWeight: 600 }}
                  >
                    {t(`${step.key}_title`)}
                  </h3>
                  <p
                    className="mx-auto mt-2 max-w-[240px] text-sm leading-relaxed text-text-secondary"
                    style={{ fontFamily: FONTS.body }}
                  >
                    {t(`${step.key}_desc`)}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
