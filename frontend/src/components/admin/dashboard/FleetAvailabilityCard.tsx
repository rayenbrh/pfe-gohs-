'use client';

import { useTranslations } from 'next-intl';

import { COLORS, FONTS } from '@/lib/design-system';
import type { FleetAvailabilityCategory } from '@/types/admin';

function barColor(percent: number) {
  if (percent >= 60) return COLORS.success;
  if (percent >= 35) return COLORS.warning;
  return COLORS.danger;
}

interface FleetAvailabilityCardProps {
  categories: FleetAvailabilityCategory[];
}

export function FleetAvailabilityCard({ categories }: FleetAvailabilityCardProps) {
  const t = useTranslations('fleet');
  const tAdmin = useTranslations('admin');

  return (
    <div
      className="h-full rounded-[14px] border p-5"
      style={{
        backgroundColor: COLORS.bgSurface,
        borderColor: COLORS.borderDefault,
      }}
    >
      <h3
        className="mb-5 text-base font-semibold text-text-primary"
        style={{ fontFamily: FONTS.body }}
      >
        {tAdmin('fleet_overview')}
      </h3>
      <div className="space-y-5">
        {categories.map((cat, i) => {
          const percent = cat.total > 0 ? (cat.available / cat.total) * 100 : 0;
          const categoryKey = `filter_${cat.category}` as
            | 'filter_economy'
            | 'filter_luxury'
            | 'filter_suv'
            | 'filter_van';
          const label = t(categoryKey);
          return (
            <div key={cat.category}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-text-secondary">{label}</span>
                <span className="text-text-primary">
                  {cat.available}/{cat.total} {tAdmin('available_label')}
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded"
                style={{ backgroundColor: COLORS.bgElevated }}
              >
                <div
                  className="h-full rounded transition-[width] duration-500 ease-out"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: barColor(percent),
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
