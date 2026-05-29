'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { COLORS, FONTS } from '@/lib/design-system';
import { FLEET_PRICE_MAX, FLEET_PRICE_MIN } from '@/lib/fleet-data';
import { cn } from '@/lib/utils';
import type { FleetFilters, FuelType, TransmissionType, VehicleCategory } from '@/types/vehicle';
import { DEFAULT_FLEET_FILTERS } from '@/types/vehicle';

interface VehicleFiltersProps {
  filters: FleetFilters;
  onChange: (filters: FleetFilters) => void;
  onApply: () => void;
  onReset: () => void;
  className?: string;
}

const categories: (VehicleCategory | 'all')[] = [
  'all',
  'economy',
  'luxury',
  'suv',
  'utility',
  'van',
];

const categoryKeys: Record<VehicleCategory | 'all', string> = {
  all: 'filter_all',
  economy: 'filter_economy',
  luxury: 'filter_luxury',
  suv: 'filter_suv',
  utility: 'filter_utility',
  van: 'filter_van',
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-3 text-[11px] tracking-[0.15em]"
      style={{ fontFamily: FONTS.display, color: COLORS.textMuted }}
    >
      {children}
    </p>
  );
}

function CustomCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5">
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
        style={{
          backgroundColor: checked ? COLORS.purple600 : COLORS.bgSurface,
          borderColor: checked ? COLORS.purple600 : COLORS.borderDefault,
        }}
      >
        {checked ? (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm text-text-secondary" style={{ fontFamily: FONTS.body }}>
        {label}
      </span>
    </label>
  );
}

export function VehicleFilters({
  filters,
  onChange,
  onApply,
  onReset,
  className,
}: VehicleFiltersProps) {
  const t = useTranslations('fleet');
  const { formatPrice } = useLocaleFormat();

  const toggleTransmission = (value: TransmissionType) => {
    const next = filters.transmission.includes(value)
      ? filters.transmission.filter((x) => x !== value)
      : [...filters.transmission, value];
    onChange({ ...filters, transmission: next });
  };

  const toggleFuel = (value: FuelType) => {
    const next = filters.fuelTypes.includes(value)
      ? filters.fuelTypes.filter((x) => x !== value)
      : [...filters.fuelTypes, value];
    onChange({ ...filters, fuelTypes: next });
  };

  return (
    <aside
      className={cn('flex flex-col gap-6', className)}
      style={{ fontFamily: FONTS.body }}
    >
      <div>
        <SectionLabel>{t('filter_category')}</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onChange({ ...filters, category: cat })}
                className="rounded-full border px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: active ? COLORS.purple600 : COLORS.bgGlass,
                  borderColor: active ? COLORS.purple600 : COLORS.borderDefault,
                  color: active ? COLORS.textPrimary : COLORS.textSecondary,
                }}
              >
                {t(categoryKeys[cat])}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel>{t('filter_price')}</SectionLabel>
        <div className="relative pt-2">
          <input
            type="range"
            min={FLEET_PRICE_MIN}
            max={FLEET_PRICE_MAX}
            value={filters.priceMin}
            onChange={(e) =>
              onChange({
                ...filters,
                priceMin: Math.min(Number(e.target.value), filters.priceMax - 10),
              })
            }
            className="range-brand absolute top-3 z-10 w-full"
          />
          <input
            type="range"
            min={FLEET_PRICE_MIN}
            max={FLEET_PRICE_MAX}
            value={filters.priceMax}
            onChange={(e) =>
              onChange({
                ...filters,
                priceMax: Math.max(Number(e.target.value), filters.priceMin + 10),
              })
            }
            className="range-brand absolute top-3 w-full"
          />
        </div>
        <p
          className="mt-8 text-[13px]"
          style={{ fontFamily: FONTS.display, color: COLORS.purple300 }}
        >
          {formatPrice(filters.priceMin)} — {formatPrice(filters.priceMax)} {t('per_day')}
        </p>
      </div>

      <div>
        <SectionLabel>{t('filter_transmission')}</SectionLabel>
        <CustomCheckbox
          checked={filters.transmission.includes('manual')}
          onChange={() => toggleTransmission('manual')}
          label={t('transmission_manual')}
        />
        <CustomCheckbox
          checked={filters.transmission.includes('automatic')}
          onChange={() => toggleTransmission('automatic')}
          label={t('transmission_auto')}
        />
      </div>

      <div>
        <SectionLabel>{t('filter_fuel')}</SectionLabel>
        {(['diesel', 'petrol', 'electric', 'hybrid'] as FuelType[]).map((fuel) => (
          <CustomCheckbox
            key={fuel}
            checked={filters.fuelTypes.includes(fuel)}
            onChange={() => toggleFuel(fuel)}
            label={t(`fuel_${fuel}`)}
          />
        ))}
      </div>

      <div>
        <SectionLabel>{t('filter_seats')}</SectionLabel>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={2}
            max={9}
            value={filters.seatsMin}
            onChange={(e) =>
              onChange({
                ...filters,
                seatsMin: Math.min(Number(e.target.value), filters.seatsMax),
              })
            }
            className="h-10 w-16 rounded-lg border bg-bg-surface px-2 text-center text-sm text-text-primary"
            style={{ borderColor: COLORS.borderDefault }}
          />
          <span className="text-text-muted">—</span>
          <input
            type="number"
            min={2}
            max={9}
            value={filters.seatsMax}
            onChange={(e) =>
              onChange({
                ...filters,
                seatsMax: Math.max(Number(e.target.value), filters.seatsMin),
              })
            }
            className="h-10 w-16 rounded-lg border bg-bg-surface px-2 text-center text-sm text-text-primary"
            style={{ borderColor: COLORS.borderDefault }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button fullWidth onClick={onApply}>
          {t('apply_filters')}
        </Button>
        <Button variant="ghost" fullWidth onClick={onReset}>
          {t('reset_filters')}
        </Button>
      </div>
    </aside>
  );
}

export { DEFAULT_FLEET_FILTERS };
