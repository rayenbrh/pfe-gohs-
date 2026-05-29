'use client';

import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';

import { VehicleCard } from '@/components/fleet/VehicleCard';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';
import { landingVehicles } from '@/lib/mock-vehicles';
import { COLORS, FONTS, SHADOWS } from '@/lib/design-system';
import { cn } from '@/lib/utils';
import type { VehicleCategory } from '@/types/vehicle';

import { SectionBadge } from './SectionBadge';

type FilterKey = 'all' | VehicleCategory;

const filters: FilterKey[] = ['all', 'economy', 'luxury', 'suv', 'utility', 'van'];

const filterTranslationKey: Record<FilterKey, string> = {
  all: 'filter_all',
  economy: 'filter_economy',
  luxury: 'filter_luxury',
  suv: 'filter_suv',
  utility: 'filter_utility',
  van: 'filter_van',
};

export function FleetPreviewSection() {
  const t = useTranslations('landing.fleet');
  const tFleet = useTranslations('fleet');
  const [active, setActive] = useState<FilterKey>('all');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  const filtered = useMemo(
    () =>
      active === 'all'
        ? landingVehicles
        : landingVehicles.filter((v) => v.category === active),
    [active],
  );

  return (
    <section ref={ref} className="relative" style={{ padding: '80px 24px' }}>
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <SectionBadge>{t('badge')}</SectionBadge>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mt-6 font-display text-3xl font-bold text-text-primary md:text-[40px]"
            style={{ fontFamily: FONTS.display }}
          >
            {t('title')}
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-10 flex flex-wrap justify-center gap-2"
        >
          {filters.map((key) => {
            const isActive = active === key;
            return (
              <motion.button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                whileTap={{ scale: 0.97 }}
                className={cn('rounded-full border px-4 py-2 text-sm font-medium')}
                style={{
                  fontFamily: FONTS.body,
                  backgroundColor: isActive ? COLORS.purple600 : COLORS.bgGlass,
                  borderColor: isActive ? COLORS.purple600 : COLORS.borderDefault,
                  color: isActive ? COLORS.textPrimary : COLORS.textSecondary,
                  boxShadow: isActive ? SHADOWS.glowPurpleSm : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = COLORS.borderStrong;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = COLORS.borderDefault;
                }}
              >
                {tFleet(filterTranslationKey[key])}
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div layout className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vehicle, i) => (
            <motion.div
              key={vehicle.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
            >
              <VehicleCard vehicle={vehicle} index={i} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-12 flex justify-center"
        >
          <Link href="/fleet">
            <Button variant="ghost" size="lg">
              {t('view_all')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
