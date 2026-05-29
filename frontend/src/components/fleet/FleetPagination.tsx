'use client';

import { useTranslations } from 'next-intl';

import { COLORS, FONTS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface FleetPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function FleetPagination({ page, totalPages, onPageChange }: FleetPaginationProps) {
  const t = useTranslations('common');
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    0,
    Math.min(totalPages, 7),
  );

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-2"
      aria-label={t('pagination')}
      style={{ fontFamily: FONTS.body }}
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
        style={{ borderColor: COLORS.borderDefault, color: COLORS.textSecondary }}
      >
        <span className="rtl:rotate-180">←</span>
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={cn('h-9 min-w-[36px] rounded-lg border text-sm font-medium')}
          style={{
            backgroundColor: p === page ? COLORS.purple600 : 'transparent',
            borderColor: p === page ? COLORS.purple600 : COLORS.borderDefault,
            color: p === page ? COLORS.textPrimary : COLORS.textSecondary,
          }}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
        style={{ borderColor: COLORS.borderDefault, color: COLORS.textSecondary }}
      >
        <span className="rtl:rotate-180">→</span>
      </button>
    </nav>
  );
}
