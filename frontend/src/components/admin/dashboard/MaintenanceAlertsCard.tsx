'use client';

import { Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/Badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { COLORS, FONTS } from '@/lib/design-system';
import type { MaintenanceAlert } from '@/types/admin';

interface MaintenanceAlertsCardProps {
  alerts: MaintenanceAlert[];
}

export function MaintenanceAlertsCard({ alerts }: MaintenanceAlertsCardProps) {
  const t = useTranslations('admin');

  if (alerts.length === 0) return null;

  return (
    <GlassCard glowColor="cyan" className="!p-5">
      <div className="mb-4 flex items-center gap-2">
        <Wrench className="h-5 w-5" style={{ color: COLORS.warning }} />
        <h3
          className="text-base font-semibold"
          style={{ color: COLORS.warning, fontFamily: FONTS.body }}
        >
          {t('maintenance_due')}
        </h3>
      </div>
      <ul className="divide-y" style={{ borderColor: COLORS.borderSubtle }}>
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-medium text-text-primary">{alert.vehicleName}</p>
              <p className="text-xs text-text-muted">{alert.maintenanceType}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-secondary">{alert.dueDate}</span>
              <Badge variant="warning" size="sm" text={t('due_soon')} />
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
