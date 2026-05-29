'use client';

import { Eye, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DataTable } from '@/components/admin/DataTable';
import { ReservationStatusBadge } from '@/components/admin/ReservationStatusBadge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Spinner } from '@/components/ui/Spinner';
import { Link } from '@/i18n/routing';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { COLORS } from '@/lib/design-system';
import type { RecentReservationRow } from '@/types/admin';

interface RecentReservationsTableProps {
  data: RecentReservationRow[];
  isLoading?: boolean;
}

function MobileReservationCard({ row }: { row: RecentReservationRow }) {
  const t = useTranslations('common');
  const { formatPrice } = useLocaleFormat();

  return (
    <GlassCard className="!p-4" glowColor="none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium text-text-primary">{row.clientName}</p>
          <p className="mt-0.5 truncate text-sm text-text-secondary">{row.vehicleName}</p>
          <p className="mt-2 font-mono text-xs text-brand-300">{row.id}</p>
          <p className="mt-1 text-xs text-text-muted">
            {row.startDate} → {row.endDate}
          </p>
          <p className="mt-2 text-sm font-medium text-text-primary">
            {formatPrice(row.total)}
          </p>
          <div className="mt-2">
            <ReservationStatusBadge status={row.status} />
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Link
            href={`/admin/reservations/${row.id.replace('RES-', '')}`}
            className="touch-target inline-flex items-center justify-center rounded-lg p-2 text-text-muted hover:text-brand-400"
            aria-label={t('view')}
          >
            <Eye className="h-5 w-5" />
          </Link>
          <button
            type="button"
            className="touch-target inline-flex items-center justify-center rounded-lg p-2 text-text-muted hover:text-brand-400"
            aria-label={t('edit_action')}
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

export function RecentReservationsTable({
  data,
  isLoading,
}: RecentReservationsTableProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const { formatPrice } = useLocaleFormat();

  return (
    <div
      className="rounded-[14px] border"
      style={{
        backgroundColor: COLORS.bgSurface,
        borderColor: COLORS.borderDefault,
        padding: 20,
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-text-primary">
          {t('recent_reservations')}
        </h3>
        <Link
          href="/admin/reservations"
          className="touch-target inline-flex min-h-[44px] items-center text-sm text-brand-400 hover:text-brand-300"
        >
          {t('view_all')} →
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="space-y-3 md:hidden">
            {data.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">{tCommon('no_data')}</p>
            ) : (
              data.map((row) => <MobileReservationCard key={row.id} row={row} />)
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <DataTable
              isLoading={false}
              stickyColumnKeys={['id', 'status']}
              data={data}
              columns={[
                {
                  key: 'id',
                  header: '#ID',
                  sticky: true,
                  render: (row) => (
                    <span className="font-mono text-xs text-brand-300">{row.id}</span>
                  ),
                },
                { key: 'clientName', header: t('col_client') },
                { key: 'vehicleName', header: t('col_vehicle') },
                {
                  key: 'dates',
                  header: t('col_dates'),
                  render: (row) => (
                    <span className="text-xs text-text-secondary">
                      {row.startDate} → {row.endDate}
                    </span>
                  ),
                },
                {
                  key: 'total',
                  header: t('col_total'),
                  render: (row) => formatPrice(row.total),
                },
                {
                  key: 'status',
                  header: t('col_status'),
                  stickyEnd: true,
                  render: (row) => <ReservationStatusBadge status={row.status} />,
                },
                {
                  key: 'actions',
                  header: t('col_actions'),
                  render: (row) => (
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/reservations/${row.id.replace('RES-', '')}`}
                        className="touch-target inline-flex items-center justify-center rounded p-2 text-text-muted hover:text-brand-400"
                        aria-label={tCommon('view')}
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <button
                        type="button"
                        className="touch-target inline-flex items-center justify-center rounded p-2 text-text-muted hover:text-brand-400"
                        aria-label={tCommon('edit_action')}
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}
