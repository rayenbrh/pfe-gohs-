'use client';

import { useTranslations } from 'next-intl';

import { DataTable } from '@/components/admin/DataTable';
import { ReservationStatusBadge } from '@/components/admin/ReservationStatusBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import type { ReservationStatus } from '@/types/reservation';

const mockData = [
  { id: '1', client: 'Sarah M.', vehicle: 'Tesla Model 3', status: 'confirmed' as ReservationStatus },
  { id: '2', client: 'Karim B.', vehicle: 'BMW X5', status: 'pending' as ReservationStatus },
];

export default function AdminReservationsPage() {
  const t = useTranslations('admin');
  const tPages = useTranslations('adminPages');

  return (
    <>
      <PageHeader title={t('reservations')} />
      <DataTable
        columns={[
          { key: 'client', header: tPages('col_client') },
          { key: 'vehicle', header: tPages('col_vehicle') },
          {
            key: 'status',
            header: tPages('col_status'),
            render: (row) => <ReservationStatusBadge status={row.status} />,
          },
        ]}
        data={mockData}
      />
    </>
  );
}
