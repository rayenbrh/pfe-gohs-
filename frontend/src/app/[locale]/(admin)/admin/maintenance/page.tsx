import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

export default function AdminMaintenancePage() {
  const t = useTranslations('admin');
  const tPages = useTranslations('adminPages');

  return (
    <>
      <PageHeader title={t('maintenance')} />
      <Card>
        <p className="text-text-secondary">{tPages('maintenance_desc')}</p>
      </Card>
    </>
  );
}
