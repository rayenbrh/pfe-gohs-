'use client';

import { useTranslations } from 'next-intl';

import { DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/layout/PageHeader';

const mockData = [
  { id: '1', name: 'Sarah M.', email: 'sarah@example.com', phone: '+216 00 000 000' },
  { id: '2', name: 'Karim B.', email: 'karim@example.com', phone: '+216 00 000 001' },
];

export default function AdminClientsPage() {
  const t = useTranslations('admin');
  const tPages = useTranslations('adminPages');

  return (
    <>
      <PageHeader title={t('clients')} />
      <DataTable
        columns={[
          { key: 'name', header: tPages('col_name') },
          { key: 'email', header: tPages('col_email') },
          { key: 'phone', header: tPages('col_phone') },
        ]}
        data={mockData}
      />
    </>
  );
}
