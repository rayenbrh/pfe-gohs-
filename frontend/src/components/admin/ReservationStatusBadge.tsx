'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/Badge';
import type { ReservationStatus } from '@/types/reservation';

const statusVariants: Record<
  ReservationStatus,
  'purple' | 'success' | 'warning' | 'danger' | 'info'
> = {
  pending: 'warning',
  confirmed: 'purple',
  active: 'success',
  completed: 'info',
  cancelled: 'danger',
};

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
}

export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
  const t = useTranslations('admin.status');
  return <Badge variant={statusVariants[status]}>{t(status)}</Badge>;
}
