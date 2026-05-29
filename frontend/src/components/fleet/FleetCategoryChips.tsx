'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { COLORS, SHADOWS } from '@/lib/design-system';
import { cn } from '@/lib/utils';
import type { VehicleCategory } from '@/types/vehicle';

const categories: (VehicleCategory | 'all')[] = [
  'all',
  'economy',
  'luxury',
  'suv',
  'van',
  'utility',
];

interface FleetCategoryChipsProps {
  active: VehicleCategory | 'all';
  onChange: (category: VehicleCategory | 'all') => void;
  onOpenFilters: () => void;
}

export function FleetCategoryChips({ active, onChange, onOpenFilters }: FleetCategoryChipsProps) {
  const t = useTranslations('fleet');

  return (
    <div className="mb-4 flex items-center gap-2 lg:hidden">
      <div className="scrollbar-none flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const isActive = active === cat;
          const label =
            cat === 'all'
              ? t('filter_all')
              : t(`filter_${cat}` as 'filter_economy');
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium touch-manipulation',
                'min-h-[44px]',
              )}
              style={{
                backgroundColor: isActive ? COLORS.purple600 : COLORS.bgSurface,
                borderColor: isActive ? COLORS.purple600 : COLORS.borderDefault,
                color: isActive ? '#fff' : COLORS.textSecondary,
                boxShadow: isActive ? SHADOWS.glowPurpleSm : 'none',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onOpenFilters}
        className="shrink-0 rounded-full border px-3 py-2.5 text-sm touch-manipulation min-h-[44px] min-w-[44px]"
        style={{
          borderColor: COLORS.borderDefault,
          backgroundColor: COLORS.bgSurface,
          color: COLORS.textSecondary,
        }}
        aria-label={t('filters')}
      >
        <SlidersHorizontal className="h-5 w-5" />
      </button>
    </div>
  );
}
