'use client';

import { CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';

export default function PaymentSuccessPage() {
  const t = useTranslations('payment');

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <CheckCircle className="h-20 w-20 text-emerald-400" />
      <h1 className="mt-6 font-display text-2xl font-bold text-text-primary">{t('success_title')}</h1>
      <p className="mt-2 text-text-secondary">{t('success_message')}</p>
      <Link href="/landing" className="mt-8">
        <Button>{t('back_home')}</Button>
      </Link>
    </div>
  );
}
