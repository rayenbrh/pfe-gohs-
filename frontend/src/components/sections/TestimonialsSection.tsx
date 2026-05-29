'use client';

import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

import { GlassCard } from '@/components/ui/GlassCard';
import { COLORS, FONTS } from '@/lib/design-system';

import { SectionBadge } from './SectionBadge';

const testimonialKeys = ['t1', 't2', 't3'] as const;

export function TestimonialsSection() {
  const t = useTranslations('landing.testimonials');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="relative" style={{ padding: '72px 24px 80px' }}>
      <div className="mx-auto max-w-7xl">
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

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonialKeys.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <GlassCard glowColor="purple" className="flex h-full flex-col">
                <p
                  className="flex-1 text-[15px] italic leading-relaxed text-text-secondary"
                  style={{ fontFamily: FONTS.body }}
                >
                  &ldquo;{t(`${key}_quote`)}&rdquo;
                </p>
                <div className="mt-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold"
                    style={{
                      backgroundColor: COLORS.purple700,
                      color: COLORS.textPrimary,
                    }}
                  >
                    {t(`${key}_initials`)}
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold text-text-primary"
                      style={{ fontFamily: FONTS.body, fontWeight: 600 }}
                    >
                      {t(`${key}_name`)}
                    </p>
                    <p className="text-xs text-text-muted">{t(`${key}_location`)}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
