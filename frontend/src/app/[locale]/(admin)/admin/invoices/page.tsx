import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

export default function AdminInvoicesPage() {
  const t = useTranslations('admin');
  const tPages = useTranslations('adminPages');

  return (
    <>
      <PageHeader title={t('invoices')} />
      <Card>
        <p className="text-text-secondary">{tPages('invoices_desc')}</p>
      </Card>
    </>
  );
}
