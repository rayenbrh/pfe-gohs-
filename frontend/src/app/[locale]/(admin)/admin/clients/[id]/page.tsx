import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

interface AdminClientDetailPageProps {
  params: { id: string };
}

export default function AdminClientDetailPage({ params }: AdminClientDetailPageProps) {
  const t = useTranslations('admin');
  const tPages = useTranslations('adminPages');

  return (
    <>
      <PageHeader title={`${t('clients')} #${params.id}`} />
      <Card>
        <p className="text-text-secondary">{tPages('client_profile_desc')}</p>
      </Card>
    </>
  );
}
