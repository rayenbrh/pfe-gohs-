import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

export default function AdminContractsPage() {
  const t = useTranslations('admin');
  const tPages = useTranslations('adminPages');

  return (
    <>
      <PageHeader title={t('contracts')} />
      <Card>
        <p className="text-text-secondary">{tPages('contracts_desc')}</p>
      </Card>
    </>
  );
}
