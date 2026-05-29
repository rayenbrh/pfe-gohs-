'use client';

import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function AdminFleetNewPage() {
  const t = useTranslations('admin');
  const tPages = useTranslations('adminPages');

  return (
    <>
      <PageHeader title={`${t('fleet')}${tPages('vehicle_new_suffix')}`} />
      <Card className="max-w-xl space-y-4">
        <Input label={tPages('vehicle_name_label')} placeholder={tPages('vehicle_name_placeholder')} />
        <Input
          label={tPages('price_per_day_label')}
          type="number"
          placeholder={tPages('price_placeholder')}
        />
        <Button>{t('fleet')}</Button>
      </Card>
    </>
  );
}
