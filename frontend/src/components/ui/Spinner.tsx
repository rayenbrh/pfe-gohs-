'use client';

import { useTranslations } from 'next-intl';

import { COLORS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor = 'purple' | 'cyan' | 'white';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

const sizeMap: Record<SpinnerSize, number> = {
  sm: 20,
  md: 32,
  lg: 48,
};

const colorMap: Record<SpinnerColor, [string, string]> = {
  purple: [COLORS.purple600, 'transparent'],
  cyan: [COLORS.cyan400, 'transparent'],
  white: ['#FFFFFF', 'transparent'],
};

export function Spinner({ size = 'md', color = 'purple', className }: SpinnerProps) {
  const t = useTranslations('common');
  const dimension = sizeMap[size];
  const [strokeStart, strokeEnd] = colorMap[color];
  const gradientId = `spinner-gradient-${color}-${size}`;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 32 32"
      fill="none"
      className={cn('animate-spin', className)}
      role="status"
      aria-label={t('loading_aria')}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={strokeStart} />
          <stop offset="100%" stopColor={strokeEnd} />
        </linearGradient>
      </defs>
      <circle
        cx="16"
        cy="16"
        r="13"
        stroke={`url(#${gradientId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="20 60"
      />
    </svg>
  );
}
