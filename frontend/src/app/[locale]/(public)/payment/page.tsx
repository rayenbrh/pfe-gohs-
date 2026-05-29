import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

export default function PaymentPage() {
  const t = useTranslations('payment');

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <PageHeader title={t('title')} description={t('description')} />
      <Card>
        <p className="text-text-secondary">{t('integration_soon')}</p>
      </Card>
    </div>
  );
}
