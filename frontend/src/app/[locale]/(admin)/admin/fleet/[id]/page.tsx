import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

interface AdminFleetDetailPageProps {
  params: { id: string };
}

export default function AdminFleetDetailPage({ params }: AdminFleetDetailPageProps) {
  const t = useTranslations('admin');
  const tPages = useTranslations('adminPages');

  return (
    <>
      <PageHeader title={`${t('fleet')} #${params.id}`} />
      <Card>
        <p className="text-text-secondary">{tPages('vehicle_edit_desc')}</p>
      </Card>
    </>
  );
}
