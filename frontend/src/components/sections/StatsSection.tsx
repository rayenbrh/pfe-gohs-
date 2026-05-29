'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';

import { GlassCard } from '@/components/ui/GlassCard';
import { useCountUp } from '@/hooks/useCountUp';
import { useInView } from '@/hooks/useInView';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { COLORS, FONTS } from '@/lib/design-system';

interface StatItemProps {
  value: number;
  suffix?: string;
  decimals?: number;
  label: string;
  format?: (n: number) => string;
}

function StatItem({ value, suffix = '', decimals = 0, label, format }: StatItemProps) {
  const { formatNumber } = useLocaleFormat();
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });
  const { ref: countRef, value: count } = useCountUp(value, { decimals, start: isInView });

  const display = format ? format(count) : `${formatNumber(count)}${suffix}`;

  return (
    <div ref={cardRef}>
      <GlassCard className="relative text-center" glowColor="purple">
        <span
          ref={countRef}
          className="block font-display text-[48px] font-bold leading-none"
          style={{ color: COLORS.purple300, fontFamily: FONTS.display }}
        >
          {display}
        </span>
        <p
          className="mt-2 text-sm text-text-secondary"
          style={{ fontFamily: FONTS.body }}
        >
          {label}
        </p>
        <span
          className="absolute bottom-0 start-0 h-0.5 transition-[width] duration-700 ease-out"
          style={{
            backgroundColor: COLORS.purple600,
            width: isInView ? '100%' : '0%',
            transitionDelay: '300ms',
          }}
        />
      </GlassCard>
    </div>
  );
}

export function StatsSection() {
  const t = useTranslations('landing.stats');
  const { formatNumber } = useLocaleFormat();

  return (
    <section className="relative" style={{ padding: '72px 24px 80px', background: 'transparent' }}>
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
      <div
        className="pointer-events-none absolute inset-0 section-grid opacity-40"
        aria-hidden
      />

      <div className="relative z-[3] mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p
            className="text-[11px] tracking-[0.2em] text-text-muted"
            style={{ fontFamily: FONTS.display }}
          >
            {t('eyebrow')}
          </p>
          <h2
            className="mt-3 text-2xl text-text-primary md:text-[32px]"
            style={{ fontFamily: FONTS.body }}
          >
            {t('title')}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          <StatItem value={48} label={t('vehicles')} />
          <StatItem
            value={10000}
            suffix="+"
            label={t('clients')}
            format={(n) => `${formatNumber(n)}+`}
          />
          <StatItem value={5} label={t('cities')} />
          <StatItem
            value={4.9}
            decimals={1}
            label={t('rating')}
            format={(n) => `${n.toFixed(1)}★`}
          />
        </div>
      </div>
    </section>
  );
}
