'use client';

import { useTranslations } from 'next-intl';

import { VehicleCard } from '@/components/fleet/VehicleCard';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { COLORS } from '@/lib/design-system';
import type { Vehicle } from '@/types/vehicle';

interface StepVehicleProps {
  vehicle: Vehicle;
  startDate: Date | null;
  endDate: Date | null;
  days: number;
  total: number;
  onContinue: () => void;
}

export function StepVehicle({
  vehicle,
  startDate,
  endDate,
  days,
  total,
  onContinue,
}: StepVehicleProps) {
  const t = useTranslations('booking');
  const { formatPrice, formatDate } = useLocaleFormat();

  return (
    <div>
      <VehicleCard vehicle={vehicle} readOnly size="compact" />
      <GlassCard className="mt-6" glowColor="purple">
        <div className="space-y-2 text-sm text-text-secondary">
          {startDate && endDate ? (
            <>
              <p>
                {t('start_date')}:{' '}
                <span className="text-text-primary">
                  {formatDate(startDate)}
                </span>
              </p>
              <p>
                {t('end_date')}:{' '}
                <span className="text-text-primary">{formatDate(endDate)}</span>
              </p>
              <p>
                {t('nights_count', { count: days })}
              </p>
            </>
          ) : (
            <p>{t('dates_not_set')}</p>
          )}
        </div>
        <p
          className="mt-4 font-display text-2xl font-bold tabular-nums rtl:text-end"
          style={{ color: COLORS.purple300 }}
        >
          {t('total_price')}: {formatPrice(total)}
        </p>
      </GlassCard>
      <Button fullWidth size="lg" className="mt-6" onClick={onContinue}>
        {t('confirm_continue')}
      </Button>
    </div>
  );
}
