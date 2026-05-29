import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

export default function AdminHrPage() {
  const t = useTranslations('admin');
  const tPages = useTranslations('adminPages');

  return (
    <>
      <PageHeader title={t('hr')} />
      <Card>
        <p className="text-text-secondary">{tPages('hr_desc')}</p>
      </Card>
    </>
  );
}
