'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';

export default function LocaleNotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-6xl font-bold text-text-primary">{t('code')}</h1>
      <p className="text-lg text-text-secondary">{t('title')}</p>
      <Link href="/landing">
        <Button>{t('back_home')}</Button>
      </Link>
    </div>
  );
}
