'use client';

import { XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';

export default function PaymentCancelPage() {
  const t = useTranslations('payment');
  const tCommon = useTranslations('common');

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <XCircle className="h-20 w-20 text-red-400" />
      <h1 className="mt-6 font-display text-2xl font-bold text-text-primary">{t('cancel_title')}</h1>
      <p className="mt-2 text-text-secondary">{t('cancel_message')}</p>
      <Link href="/booking" className="mt-8">
        <Button variant="ghost">{tCommon('retry')}</Button>
      </Link>
    </div>
  );
}
