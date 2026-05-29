import { type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { COLORS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'purple'
  | 'cyan'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'default';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  text?: string;
  icon?: LucideIcon | ReactNode;
  children?: ReactNode;
  className?: string;
}

const variantStyles: Record<
  BadgeVariant,
  { bg: string; border: string; color: string; dotColor: string }
> = {
  purple: {
    bg: 'rgba(124, 58, 237, 0.12)',
    border: 'rgba(124, 58, 237, 0.35)',
    color: COLORS.purple300,
    dotColor: COLORS.purple600,
  },
  cyan: {
    bg: 'rgba(34, 211, 238, 0.10)',
    border: 'rgba(34, 211, 238, 0.35)',
    color: COLORS.cyan400,
    dotColor: COLORS.cyan400,
  },
  success: {
    bg: COLORS.successBg,
    border: 'rgba(52, 211, 153, 0.35)',
    color: COLORS.success,
    dotColor: COLORS.success,
  },
  warning: {
    bg: COLORS.warningBg,
    border: 'rgba(251, 191, 36, 0.35)',
    color: COLORS.warning,
    dotColor: COLORS.warning,
  },
  danger: {
    bg: COLORS.dangerBg,
    border: 'rgba(248, 113, 113, 0.35)',
    color: COLORS.danger,
    dotColor: COLORS.danger,
  },
  info: {
    bg: COLORS.infoBg,
    border: 'rgba(96, 165, 250, 0.35)',
    color: COLORS.info,
    dotColor: COLORS.info,
  },
  default: {
    bg: COLORS.bgGlass,
    border: COLORS.borderDefault,
    color: COLORS.textSecondary,
    dotColor: COLORS.textMuted,
  },
};

const sizeStyles: Record<BadgeSize, { padding: string; fontSize: number; dotSize: number }> = {
  sm: { padding: '2px 8px', fontSize: 11, dotSize: 5 },
  md: { padding: '4px 10px', fontSize: 12, dotSize: 6 },
};

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  text,
  icon,
  children,
  className,
}: BadgeProps) {
  const content = text ?? children;
  const styles = variantStyles[variant];
  const sizing = sizeStyles[size];

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'function') {
      const Icon = icon as LucideIcon;
      return <Icon className="h-3 w-3 shrink-0" style={{ color: styles.color }} />;
    }
    return <span className="inline-flex shrink-0">{icon}</span>;
  };

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full border font-medium', className)}
      style={{
        backgroundColor: styles.bg,
        borderColor: styles.border,
        color: styles.color,
        padding: sizing.padding,
        fontSize: sizing.fontSize,
      }}
    >
      {dot ? (
        <span
          className="shrink-0 rounded-full"
          style={{
            width: sizing.dotSize,
            height: sizing.dotSize,
            backgroundColor: styles.dotColor,
            boxShadow: `0 0 6px ${styles.dotColor}`,
          }}
        />
      ) : null}
      {renderIcon()}
      {content ? <span>{content}</span> : null}
    </span>
  );
}
