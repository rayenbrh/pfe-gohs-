'use client';

import { Calendar, Fuel, Settings2, Users } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTouchFeedback } from '@/hooks/useTouchFeedback';
import { Link } from '@/i18n/routing';
import { COLORS, FONTS } from '@/lib/design-system';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import type { Vehicle, VehicleCategory } from '@/types/vehicle';

const categoryVariant: Record<VehicleCategory, 'purple' | 'cyan' | 'success' | 'default'> = {
  economy: 'default',
  luxury: 'purple',
  suv: 'cyan',
  utility: 'success',
  van: 'default',
};

interface VehicleCardProps {
  vehicle: Vehicle;
  index?: number;
  size?: 'default' | 'large' | 'compact';
  readOnly?: boolean;
  fleetBasePath?: string;
  bookingBasePath?: string;
}

export function VehicleCard({
  vehicle,
  size = 'default',
  readOnly = false,
  fleetBasePath = '/fleet',
  bookingBasePath = '/booking',
}: VehicleCardProps) {
  const t = useTranslations('fleet');
  const { formatPrice } = useLocaleFormat();
  const { touchProps, motionScale } = useTouchFeedback();

  const categoryKey = `filter_${vehicle.category}` as
    | 'filter_economy'
    | 'filter_luxury'
    | 'filter_suv'
    | 'filter_utility'
    | 'filter_van';

  const imageHeight = size === 'large' ? 240 : size === 'compact' ? 140 : 200;

  const specs = [
    { icon: Users, label: `${vehicle.seats}` },
    { icon: Fuel, label: t(`fuel_${vehicle.fuelType}`) },
    { icon: Settings2, label: t(`transmission_${vehicle.transmission}`) },
    { icon: Calendar, label: String(vehicle.year) },
  ];

  const detailHref = `${fleetBasePath}/${vehicle.id}`;
  const bookingHref = `${bookingBasePath}?vehicleId=${vehicle.id}`;

  const card = (
    <div className="relative">
      <div
        aria-hidden="true"
        className="vehicle-card-glow pointer-events-none absolute z-0"
        style={{
          inset: '-16px',
          borderRadius: '28px',
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.0) 0%, transparent 60%)',
          transition: 'background 0.3s ease',
        }}
      />

      <div
        className="relative z-[1] overflow-visible rounded-[14px] border touch-manipulation transition-transform duration-75 ease-out"
        style={{
          background: COLORS.bgSurface,
          borderColor: COLORS.borderDefault,
          transform: !readOnly ? `scale(${motionScale})` : undefined,
        }}
        {...(!readOnly ? touchProps : {})}
        onMouseEnter={(e) => {
          const glow = e.currentTarget.previousElementSibling as HTMLElement | null;
          if (glow) {
            glow.style.background =
              'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.20) 0%, transparent 60%)';
          }
        }}
        onMouseLeave={(e) => {
          const glow = e.currentTarget.previousElementSibling as HTMLElement | null;
          if (glow) {
            glow.style.background =
              'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.0) 0%, transparent 60%)';
          }
        }}
      >
        <Link href={detailHref} className="block touch-manipulation">
          <div
            className="group relative overflow-hidden bg-bg-elevated"
            style={{ height: imageHeight, borderRadius: '10px 10px 0 0' }}
          >
            <div className="relative h-full w-full">
              <Image
                src={vehicle.imageUrl}
                alt={vehicle.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 88vw, 33vw"
              />
            </div>
            <div className="absolute end-3 top-3">
              <Badge variant={categoryVariant[vehicle.category]} size="sm" text={t(categoryKey)} />
            </div>
          </div>
        </Link>

        <div className={size === 'compact' ? 'p-4' : 'p-5'}>
          <Link href={detailHref} className="touch-manipulation">
            <h3
              className={
                size === 'large'
                  ? 'text-xl font-medium text-text-primary'
                  : 'text-lg font-medium text-text-primary'
              }
              style={{ fontFamily: FONTS.body, fontWeight: 500 }}
            >
              {vehicle.name}
            </h3>
          </Link>

          {!readOnly && size !== 'compact' ? (
            <div className="mt-3 flex flex-wrap gap-3">
              {specs.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 text-sm text-text-muted"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex items-baseline gap-1">
            <span
              className="font-display text-[22px] font-bold"
              style={{ color: COLORS.purple300 }}
            >
              {formatPrice(vehicle.pricePerDay)}
            </span>
            <span className="text-[14px] text-text-muted">{t('per_day')}</span>
          </div>

          {!readOnly ? (
            <div className="mt-4 flex gap-2">
              <Link href={detailHref} className="min-w-0 flex-1 touch-manipulation">
                <Button variant="ghost" className="w-full" size="sm">
                  {t('details')}
                </Button>
              </Link>
              <Link href={bookingHref} className="min-w-0 flex-1 touch-manipulation">
                <Button className="w-full" size="sm" disabled={vehicle.status !== 'available'}>
                  {t('book_now')}
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (readOnly) {
    return <article>{card}</article>;
  }

  return <article>{card}</article>;
}
