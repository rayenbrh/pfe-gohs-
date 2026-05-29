'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { COLORS, FONTS } from '@/lib/design-system';

interface FleetEmptyStateProps {
  onReset: () => void;
}

export function FleetEmptyState({ onReset }: FleetEmptyStateProps) {
  const t = useTranslations('fleet');

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg
        width="120"
        height="80"
        viewBox="0 0 120 80"
        fill="none"
        className="mb-6"
        aria-hidden
      >
        <rect
          x="20"
          y="35"
          width="80"
          height="30"
          rx="8"
          stroke={COLORS.purple600}
          strokeWidth="1.5"
          fill={COLORS.bgGlass}
        />
        <circle cx="35" cy="65" r="8" stroke={COLORS.purple400} strokeWidth="1.5" />
        <circle cx="85" cy="65" r="8" stroke={COLORS.purple400} strokeWidth="1.5" />
        <path
          d="M35 35 L50 20 H75 L90 35"
          stroke={COLORS.purple400}
          strokeWidth="1.5"
          fill="none"
        />
        <text
          x="60"
          y="48"
          textAnchor="middle"
          fill={COLORS.purple300}
          fontSize="18"
          fontFamily="monospace"
        >
          ?
        </text>
      </svg>
      <p
        className="text-lg text-text-secondary"
        style={{ fontFamily: FONTS.body }}
      >
        {t('empty_title')}
      </p>
      <Button variant="ghost" className="mt-6" onClick={onReset}>
        {t('reset_filters')}
      </Button>
    </div>
  );
}
