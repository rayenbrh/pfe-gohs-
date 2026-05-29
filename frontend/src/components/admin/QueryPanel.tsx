'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { COLORS } from '@/lib/design-system';

interface QueryPanelProps {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  children: React.ReactNode;
  minHeight?: number;
}

export function QueryPanel({
  isLoading,
  isError,
  errorMessage,
  onRetry,
  children,
  minHeight = 200,
}: QueryPanelProps) {
  const t = useTranslations('common');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 text-center"
        style={{ minHeight }}
      >
        <p className="text-sm" style={{ color: COLORS.danger }}>
          {errorMessage ?? t('load_error')}
        </p>
        <Button variant="ghost" size="sm" onClick={onRetry}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
