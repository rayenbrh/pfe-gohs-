'use client';

import type { MouseEvent, MouseEventHandler, ReactNode } from 'react';

import { COLORS, SHADOWS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

export type CardPadding = 'sm' | 'md' | 'lg';

export interface CardProps {
  children: ReactNode;
  padding?: CardPadding;
  hover?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
}

const paddingMap: Record<CardPadding, string> = {
  sm: '16px',
  md: '24px',
  lg: '32px',
};

export function Card({
  children,
  padding = 'md',
  hover = false,
  onClick,
  className,
}: CardProps) {
  const isInteractive = Boolean(onClick) || hover;

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e as unknown as MouseEvent<HTMLDivElement>);
              }
            }
          : undefined
      }
      className={cn(
        'rounded-[14px] border transition-[transform,border-color,box-shadow] duration-[250ms] ease-out',
        isInteractive && 'cursor-pointer',
        className,
      )}
      style={{
        backgroundColor: COLORS.bgSurface,
        borderColor: COLORS.borderDefault,
        padding: paddingMap[padding],
      }}
      onMouseEnter={
        hover
          ? (e) => {
              e.currentTarget.style.transform = 'scale(1.01)';
              e.currentTarget.style.borderColor = COLORS.borderStrong;
              e.currentTarget.style.boxShadow = SHADOWS.cardHover;
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = COLORS.borderDefault;
              e.currentTarget.style.boxShadow = 'none';
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
