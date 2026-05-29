'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';

import { BookingWizard } from '@/components/booking/BookingWizard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Spinner } from '@/components/ui/Spinner';

function BookingContent() {
  return <BookingWizard />;
}

export default function BookingPage() {
  const t = useTranslations('booking');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <PageHeader title={t('title')} />
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        }
      >
        <BookingContent />
      </Suspense>
    </div>
  );
}
