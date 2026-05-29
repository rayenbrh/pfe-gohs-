'use client';

import { useTranslations } from 'next-intl';

import { COLORS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showMark?: boolean;
  size?: 'sm' | 'md';
  markSize?: number;
}

export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <path
        d="M14 2L24 7.5V20.5L14 26L4 20.5V7.5L14 2Z"
        stroke={COLORS.purple600}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 17L11 13.5H17L20 17"
        stroke={COLORS.purple600}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="17.5" r="1.25" fill={COLORS.purple600} />
      <circle cx="18" cy="17.5" r="1.25" fill={COLORS.purple600} />
      <path
        d="M11 13.5L12.5 10H15.5L17 13.5"
        stroke={COLORS.purple600}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, showMark = true, size = 'md', markSize }: LogoProps) {
  const t = useTranslations('layout');
  const textSize = size === 'sm' ? 'text-base' : 'text-xl';
  const iconSize = markSize ?? (size === 'sm' ? 24 : 28);

  return (
    <span className={cn('inline-flex items-center gap-2.5 rtl:flex-row-reverse', className)}>
      {showMark ? <LogoMark size={iconSize} /> : null}
      <span className={cn('font-display font-bold leading-none tracking-tight', textSize)}>
        <span style={{ color: COLORS.purple300 }}>{t('logo_inova')}</span>
        <span style={{ color: COLORS.purple600 }}>{t('logo_ride')}</span>
      </span>
    </span>
  );
}
