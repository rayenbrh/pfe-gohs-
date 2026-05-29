'use client';

import { useTranslations } from 'next-intl';

import { Spinner } from '@/components/ui/Spinner';
import { COLORS, FONTS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sticky?: boolean;
  stickyEnd?: boolean;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  className?: string;
  stickyColumnKeys?: string[];
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading,
  className,
  stickyColumnKeys = [],
}: DataTableProps<T>) {
  const t = useTranslations('common');

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const getCol = (key: string) => columns.find((c) => c.key === key);

  const isStickyStart = (key: string) => {
    const col = getCol(key);
    return col?.sticky || (stickyColumnKeys.includes(key) && !col?.stickyEnd);
  };

  const isStickyEnd = (key: string) => getCol(key)?.stickyEnd === true;

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[720px] border-collapse bg-transparent">
        <thead>
          <tr style={{ backgroundColor: COLORS.bgSurface }}>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'border-b px-4 py-3 text-start font-medium uppercase',
                  isStickyStart(String(col.key)) && 'sticky start-0 z-10',
                  isStickyEnd(String(col.key)) && 'sticky end-0 z-10',
                )}
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  color: COLORS.textMuted,
                  borderColor: COLORS.borderSubtle,
                  backgroundColor:
                    isStickyStart(String(col.key)) || isStickyEnd(String(col.key))
                      ? COLORS.bgSurface
                      : undefined,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-text-muted"
              >
                {t('no_data')}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id}
                className="border-b transition-colors"
                style={{
                  borderColor: COLORS.borderSubtle,
                  backgroundColor:
                    rowIndex % 2 === 1 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(138, 92, 246, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    rowIndex % 2 === 1 ? 'rgba(255, 255, 255, 0.01)' : 'transparent';
                }}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      'px-4 py-3.5',
                      isStickyStart(String(col.key)) && 'sticky start-0 z-10',
                      isStickyEnd(String(col.key)) && 'sticky end-0 z-10',
                    )}
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 14,
                      color: COLORS.textPrimary,
                      padding: '14px 16px',
                      backgroundColor:
                        isStickyStart(String(col.key)) || isStickyEnd(String(col.key))
                          ? rowIndex % 2 === 1
                            ? 'rgba(255, 255, 255, 0.02)'
                            : COLORS.bgBase
                          : undefined,
                    }}
                  >
                    {col.render
                      ? col.render(row)
                      : String(row[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
