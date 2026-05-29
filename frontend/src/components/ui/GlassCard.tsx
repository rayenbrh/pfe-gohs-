'use client';

import type { ReactNode } from 'react';

import { useTouchFeedback } from '@/hooks/useTouchFeedback';
import { BLUR, COLORS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

export type GlassCardGlow = 'purple' | 'cyan' | 'none';

export interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: GlassCardGlow;
  interactive?: boolean;
}

export function GlassCard({
  children,
  className,
  glowColor = 'none',
  interactive = true,
}: GlassCardProps) {
  const { touchProps, motionScale } = useTouchFeedback();

  return (
    <div className="relative">
      {glowColor !== 'none' ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-0"
          style={{
            inset: '-20px',
            borderRadius: '28px',
            background:
              glowColor === 'purple'
                ? 'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.18) 0%, transparent 65%)'
                : 'radial-gradient(ellipse at 50% 50%, rgba(34,211,238,0.14) 0%, transparent 65%)',
            filter: 'blur(1px)',
          }}
        />
      ) : null}

      <div
        className={cn(
          'relative z-[1] rounded-2xl border p-6 touch-manipulation transition-transform duration-75 ease-out',
          className,
        )}
        style={{
          background: COLORS.bgGlass,
          backdropFilter: BLUR.glass,
          WebkitBackdropFilter: BLUR.glass,
          borderColor: COLORS.borderDefault,
          transform: interactive ? `scale(${motionScale})` : undefined,
        }}
        {...(interactive ? touchProps : {})}
      >
        {children}
      </div>
    </div>
  );
}
