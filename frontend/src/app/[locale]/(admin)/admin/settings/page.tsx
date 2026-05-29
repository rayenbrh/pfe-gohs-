import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

export default function AdminSettingsPage() {
  const t = useTranslations('admin');
  const tPages = useTranslations('adminPages');

  return (
    <>
      <PageHeader title={t('settings')} />
      <Card>
        <p className="text-text-secondary">{tPages('settings_desc')}</p>
      </Card>
    </>
  );
}
