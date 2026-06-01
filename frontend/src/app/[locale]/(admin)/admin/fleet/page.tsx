'use client';

import { useTranslations } from 'next-intl';

import { DataTable } from '@/components/admin/DataTable';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { useAgencyFleet } from '@/hooks/useAgencyFleet';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';
import { DEFAULT_AGENCY_SLUG, useResolvedAgencySlug } from '@/lib/agency-context';

export default function AdminFleetPage() {
  const t = useTranslations('admin');
  const tPages = useTranslations('adminPages');
  const tCommon = useTranslations('common');
  const { formatPrice } = useLocaleFormat();
  const agencySlug = useResolvedAgencySlug() ?? DEFAULT_AGENCY_SLUG;
  const { data: vehicles = [], isLoading, isError } = useAgencyFleet(agencySlug);

  const tableData = vehicles.map((v) => ({
    id: v.id,
    name: v.name,
    status: v.status === 'available' ? 'available' : 'rented',
    price: v.pricePerDay,
  }));

  return (
    <>
      <div className="mb-8 flex items-center justify-between rtl:flex-row-reverse">
        <PageHeader title={t('fleet')} />
        <Link href="/admin/fleet/new">
          <Button>{t('fleet')}+</Button>
        </Link>
      </div>
      {isLoading ? (
        <p className="text-sm text-white/60">{tCommon('loading')}</p>
      ) : isError ? (
        <p className="text-sm text-red-400">{tCommon('load_error')}</p>
      ) : (
        <DataTable
          columns={[
            { key: 'name', header: tPages('col_vehicle') },
            {
              key: 'status',
              header: tPages('col_status'),
              render: (row) =>
                row.status === 'available'
                  ? tPages('status_available')
                  : tPages('status_rented'),
            },
            {
              key: 'price',
              header: tPages('col_price_day'),
              render: (row) => formatPrice(row.price as number),
            },
          ]}
          data={tableData}
        />
      )}
    </>
  );
}
