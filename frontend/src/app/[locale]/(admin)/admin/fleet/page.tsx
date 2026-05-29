'use client';

import { useTranslations } from 'next-intl';

import { DataTable } from '@/components/admin/DataTable';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';

const mockData = [
  { id: '1', name: 'Tesla Model 3', status: 'available', price: 120 },
  { id: '2', name: 'BMW X5', status: 'rented', price: 150 },
];

export default function AdminFleetPage() {
  const t = useTranslations('admin');
  const tPages = useTranslations('adminPages');
  const { formatPrice } = useLocaleFormat();

  return (
    <>
      <div className="mb-8 flex items-center justify-between rtl:flex-row-reverse">
        <PageHeader title={t('fleet')} />
        <Link href="/admin/fleet/new">
          <Button>{t('fleet')}+</Button>
        </Link>
      </div>
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
        data={mockData}
      />
    </>
  );
}
