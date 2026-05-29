'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GlassCard } from '@/components/ui/GlassCard';
import api from '@/lib/api';
import { COLORS } from '@/lib/design-system';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import type { BookingDetailsForm } from '@/lib/booking-schema';
import type { Vehicle } from '@/types/vehicle';

interface StepPaymentProps {
  vehicle: Vehicle;
  days: number;
  total: number;
  details: BookingDetailsForm | null;
  onBack: () => void;
  onComplete: (reservationRef: string) => void;
}

export function StepPayment({
  vehicle,
  days,
  total,
  onBack,
  onComplete,
}: StepPaymentProps) {
  const { formatPrice } = useLocaleFormat();
  const t = useTranslations('booking');
  const [tab, setTab] = useState<'online' | 'cash'>('online');
  const [loading, setLoading] = useState(false);

  const handleKonnect = async () => {
    setLoading(true);
    try {
      const { data } = await api.post<{
        data?: { paymentUrl?: string; reservationRef?: string };
        paymentUrl?: string;
        reservationRef?: string;
      }>('/payments/konnect/init', {
        vehicleId: vehicle.id,
        amount: total,
        days,
      });
      const payload = data.data ?? data;
      if (payload.paymentUrl) {
        window.location.href = payload.paymentUrl;
        return;
      }
      onComplete(
        payload.reservationRef ?? `INOVA-${Date.now().toString(36).toUpperCase()}`,
      );
    } catch {
      onComplete(`INOVA-${Date.now().toString(36).toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCash = () => {
    onComplete(`INOVA-${Date.now().toString(36).toUpperCase()}`);
  };

  return (
    <div>
      <div className="mb-6 flex rounded-lg border border-border-subtle p-1">
        {(['online', 'cash'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className="flex-1 rounded-md py-2.5 text-sm font-medium"
            style={{
              backgroundColor: tab === key ? COLORS.purple600 : 'transparent',
              color: tab === key ? COLORS.textPrimary : COLORS.textSecondary,
            }}
          >
            {t(key === 'online' ? 'pay_online' : 'pay_cash')}
          </button>
        ))}
      </div>

      {tab === 'online' ? (
        <GlassCard glowColor="purple">
          <h3 className="font-display text-lg text-text-primary">{t('order_summary')}</h3>
          <p className="mt-2 text-sm text-text-secondary">{vehicle.name}</p>
          <p className="mt-1 text-sm text-text-secondary">
            {days} {t('days')} — {formatPrice(total)}
          </p>
          <Button fullWidth className="mt-6" size="lg" isLoading={loading} onClick={handleKonnect}>
            {t('proceed_konnect')}
          </Button>
        </GlassCard>
      ) : (
        <Card padding="lg">
          <p className="text-sm leading-relaxed text-text-secondary">{t('cash_notice')}</p>
          <Button fullWidth className="mt-6" size="lg" onClick={handleCash}>
            {t('confirm_reservation')}
          </Button>
        </Card>
      )}

      <Button variant="ghost" className="mt-4" onClick={onBack}>
        {t('back')}
      </Button>
    </div>
  );
}
