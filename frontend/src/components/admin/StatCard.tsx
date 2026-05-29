'use client';

import { type LucideIcon } from 'lucide-react';

import { useCountUp } from '@/hooks/useCountUp';
import { COLORS, FONTS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

export type StatCardValueColor = 'brand' | 'cyan' | 'success' | 'brandLight';

const valueColors: Record<StatCardValueColor, string> = {
  brand: COLORS.purple300,
  cyan: COLORS.cyan400,
  success: COLORS.success,
  brandLight: COLORS.purple200,
};

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  trend?: number;
  trendMonthLabel?: string;
  valueColor?: StatCardValueColor;
  formatValue?: (n: number) => string;
  decimals?: number;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendMonthLabel,
  valueColor = 'brand',
  formatValue,
  decimals = 0,
  className,
}: StatCardProps) {
  const { ref, value: count } = useCountUp(value, {
    start: true,
    duration: 1600,
    decimals,
  });

  const display = formatValue ? formatValue(count) : String(count);
  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={cn('rounded-[14px] border p-5', className)}
      style={{
        backgroundColor: COLORS.bgSurface,
        borderColor: COLORS.borderDefault,
        borderInlineStartWidth: 3,
        borderInlineStartColor: COLORS.purple600,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] border"
            style={{
              backgroundColor: 'rgba(124, 58, 237, 0.12)',
              borderColor: COLORS.borderSubtle,
            }}
          >
            <Icon className="h-5 w-5" style={{ color: COLORS.purple400 }} />
          </div>
          <span
            ref={ref}
            className="block font-display text-2xl font-bold leading-none sm:text-[32px]"
            style={{ color: valueColors[valueColor], fontFamily: FONTS.display }}
          >
            {display}
          </span>
          <p
            className="mt-2 text-[13px]"
            style={{ color: COLORS.textMuted, fontFamily: FONTS.body }}
          >
            {label}
          </p>
          {trend !== undefined ? (
            <span
              className="mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: trendPositive ? COLORS.successBg : COLORS.dangerBg,
                color: trendPositive ? COLORS.success : COLORS.danger,
              }}
            >
              {trendPositive ? '+' : ''}
              {trend.toFixed(0)}% {trendMonthLabel}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
