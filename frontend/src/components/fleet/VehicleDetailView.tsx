'use client';

import { Check, Gauge, Settings2, Users, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { COLORS, FONTS } from '@/lib/design-system';
import type { Vehicle, VehicleCategory } from '@/types/vehicle';

import { VehicleBookingPanel } from './VehicleBookingPanel';
import { VehicleGallery } from './VehicleGallery';

const categoryVariant: Record<VehicleCategory, 'purple' | 'cyan' | 'success' | 'default'> = {
  economy: 'default',
  luxury: 'purple',
  suv: 'cyan',
  utility: 'success',
  van: 'default',
};

interface VehicleDetailViewProps {
  vehicle: Vehicle;
  bookingBasePath?: string;
}

export function VehicleDetailView({ vehicle, bookingBasePath = '/booking' }: VehicleDetailViewProps) {
  const t = useTranslations('fleet');
  const tCommon = useTranslations('common');
  const { formatNumber } = useLocaleFormat();
  const [expanded, setExpanded] = useState(false);

  const categoryKey = `filter_${vehicle.category}` as
    | 'filter_economy'
    | 'filter_luxury'
    | 'filter_suv'
    | 'filter_utility'
    | 'filter_van';

  const specs = [
    { icon: Gauge, label: t('spec_year'), value: String(vehicle.year) },
    { icon: Users, label: t('spec_seats'), value: String(vehicle.seats) },
    { icon: Zap, label: t('spec_fuel'), value: t(`fuel_${vehicle.fuelType}`) },
    {
      icon: Settings2,
      label: t('spec_transmission'),
      value: t(`transmission_${vehicle.transmission}`),
    },
    {
      icon: Gauge,
      label: t('spec_mileage'),
      value: `${formatNumber(vehicle.mileage)} ${tCommon('km')}`,
    },
    { icon: Settings2, label: t('spec_engine'), value: vehicle.engine },
  ];

  const description =
    expanded || vehicle.description.length < 200
      ? vehicle.description
      : `${vehicle.description.slice(0, 200)}…`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="lg:w-[60%]">
          <VehicleGallery images={vehicle.images} name={vehicle.name} />

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <h1
              className="font-display text-3xl font-bold text-text-primary"
              style={{ fontFamily: FONTS.display }}
            >
              {vehicle.name}
            </h1>
            <Badge variant={categoryVariant[vehicle.category]} text={t(categoryKey)} />
            <Badge
              variant={vehicle.status === 'available' ? 'success' : 'danger'}
              text={vehicle.status === 'available' ? t('available') : t('unavailable')}
            />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {specs.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-border-subtle bg-bg-surface p-4"
              >
                <Icon className="mb-2 h-5 w-5 text-brand-400" />
                <p className="text-xs text-text-muted">{label}</p>
                <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <p
              className="text-[15px] leading-relaxed text-text-secondary"
              style={{ fontFamily: FONTS.body }}
            >
              {description}
            </p>
            {vehicle.description.length > 200 ? (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="mt-2 text-sm text-brand-400 hover:text-brand-300"
              >
                {expanded ? t('read_less') : t('read_more')}
              </button>
            ) : null}
          </div>

          <ul className="mt-8 space-y-2">
            {vehicle.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                <Check className="h-4 w-4 shrink-0 text-brand-600" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:w-[40%]">
          <VehicleBookingPanel vehicle={vehicle} bookingBasePath={bookingBasePath} />
        </div>
      </div>
      <div className="h-32 lg:hidden" aria-hidden />
    </div>
  );
}
