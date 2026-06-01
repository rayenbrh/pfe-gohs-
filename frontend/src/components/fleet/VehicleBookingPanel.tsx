'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { DateRangePicker } from '@/components/booking/DateRangePicker';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Link } from '@/i18n/routing';
import { countDaysBetween, formatDateISO, parseDateISO } from '@/lib/fleet-utils';
import { COLORS, FONTS } from '@/lib/design-system';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import type { Vehicle } from '@/types/vehicle';

interface VehicleBookingPanelProps {
  vehicle: Vehicle;
  initialStart?: string;
  initialEnd?: string;
  bookingBasePath?: string;
}

function BookingFormContent({
  vehicle,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  days,
  subtotal,
  taxes,
  total,
  bookingHref,
}: {
  vehicle: Vehicle;
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (d: Date | null) => void;
  setEndDate: (d: Date | null) => void;
  days: number;
  subtotal: number;
  taxes: number;
  total: number;
  bookingHref: string;
}) {
  const t = useTranslations('fleet');
  const { formatPrice } = useLocaleFormat();

  return (
    <>
      <div className="flex items-baseline gap-1">
        <span
          className="font-display text-[36px] font-bold"
          style={{ color: COLORS.purple300 }}
        >
          {formatPrice(vehicle.pricePerDay)}
        </span>
        <span className="text-text-muted">{t('per_day')}</span>
      </div>

      <div className="mt-6">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(s, e) => {
            setStartDate(s);
            setEndDate(e);
          }}
          unavailableDates={vehicle.unavailableDates}
        />
      </div>

      {days > 0 ? (
        <div
          className="mt-6 space-y-2 border-t pt-4 text-sm"
          style={{ borderColor: COLORS.borderSubtle }}
        >
          <div className="flex justify-between text-text-secondary">
            <span>
              {days} {t('days')} × {formatPrice(vehicle.pricePerDay)}
            </span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>{t('taxes')}</span>
            <span className="tabular-nums">{formatPrice(taxes)}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-text-primary">{t('total')}</span>
            <span
              className="font-display text-2xl font-bold tabular-nums rtl:text-start"
              style={{ color: COLORS.purple300 }}
            >
              {formatPrice(total)}
            </span>
          </div>
        </div>
      ) : null}

      <Link href={bookingHref} className="mt-6 block touch-manipulation">
        <Button fullWidth size="lg" disabled={!startDate || !endDate}>
          {t('book_this_vehicle')}
        </Button>
      </Link>

      <a
        href="https://wa.me/21670000000"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block text-center text-sm text-brand-400 hover:text-brand-300 touch-manipulation"
        style={{ fontFamily: FONTS.body }}
      >
        {t('need_help')}
      </a>
    </>
  );
}

export function VehicleBookingPanel({
  vehicle,
  initialStart,
  initialEnd,
  bookingBasePath = '/booking',
}: VehicleBookingPanelProps) {
  const t = useTranslations('fleet');
  const { formatPrice } = useLocaleFormat();
  const [startDate, setStartDate] = useState<Date | null>(() =>
    initialStart ? parseDateISO(initialStart) : null,
  );
  const [endDate, setEndDate] = useState<Date | null>(() =>
    initialEnd ? parseDateISO(initialEnd) : null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return countDaysBetween(startDate, endDate);
  }, [startDate, endDate]);

  const subtotal = days * vehicle.pricePerDay;
  const taxes = 0;
  const total = subtotal + taxes;

  const bookingHref =
    startDate && endDate
      ? `${bookingBasePath}?vehicleId=${vehicle.id}&start=${formatDateISO(startDate)}&end=${formatDateISO(endDate)}`
      : `${bookingBasePath}?vehicleId=${vehicle.id}`;

  const formProps = {
    vehicle,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    days,
    subtotal,
    taxes,
    total,
    bookingHref,
  };

  return (
    <>
      {/* Desktop sticky panel */}
      <GlassCard glowColor="purple" className="sticky top-24 hidden lg:block">
        <BookingFormContent {...formProps} />
      </GlassCard>

      {/* Mobile sticky bottom bar */}
      <div
        className="fixed inset-x-0 z-50 border-t lg:hidden"
        style={{
          bottom: 'calc(64px + env(safe-area-inset-bottom))',
          backgroundColor: 'rgba(7, 6, 13, 0.95)',
          backdropFilter: 'blur(24px)',
          borderColor: COLORS.borderSubtle,
        }}
      >
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-sm text-text-muted">{t('per_day')}</p>
            <p
              className="font-display text-xl font-bold"
              style={{ color: COLORS.purple300 }}
            >
              {days > 0 ? formatPrice(total) : formatPrice(vehicle.pricePerDay)}
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setSheetOpen(true)}
            className="min-w-[120px] shrink-0"
          >
            {t('book_now')}
          </Button>
        </div>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <BookingFormContent {...formProps} />
      </BottomSheet>
    </>
  );
}
