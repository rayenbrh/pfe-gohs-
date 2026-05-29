import { useTranslations } from 'next-intl';

import { ReservationStatusBadge } from '@/components/admin/ReservationStatusBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

interface AdminReservationDetailPageProps {
  params: { id: string };
}

export default function AdminReservationDetailPage({ params }: AdminReservationDetailPageProps) {
  const t = useTranslations('admin');
  const tPages = useTranslations('adminPages');

  return (
    <>
      <PageHeader title={`${t('reservations')} #${params.id}`} />
      <Card>
        <ReservationStatusBadge status="confirmed" />
        <p className="mt-4 text-text-secondary">{tPages('reservation_detail_desc')}</p>
      </Card>
    </>
  );
}
