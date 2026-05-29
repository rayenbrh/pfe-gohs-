'use client';

import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';

import { useTouchFeedback } from '@/hooks/useTouchFeedback';
import { COLORS, FONTS, SHADOWS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'cyan';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonIconPosition = 'left' | 'right';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: ButtonIconPosition;
  fullWidth?: boolean;
}

const sizeMap: Record<ButtonSize, CSSProperties> = {
  sm: { minHeight: 44, padding: '0 16px', fontSize: 14 },
  md: { minHeight: 44, padding: '0 20px', fontSize: 14 },
  lg: { minHeight: 48, padding: '0 32px', fontSize: 16 },
};

function LoadingRing() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={COLORS.purple600}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="28 56"
      />
    </svg>
  );
}

function getVariantStyles(variant: ButtonVariant): {
  base: CSSProperties;
  hover?: CSSProperties;
} {
  switch (variant) {
    case 'primary':
      return {
        base: {
          background: `linear-gradient(135deg, ${COLORS.purple600}, ${COLORS.purple400})`,
          color: '#FFFFFF',
          fontFamily: FONTS.display,
          letterSpacing: '0.05em',
          border: 'none',
          boxShadow: 'none',
        },
        hover: { boxShadow: SHADOWS.glowPurpleSm },
      };
    case 'ghost':
      return {
        base: {
          background: 'transparent',
          color: COLORS.purple300,
          border: `1px solid ${COLORS.borderStrong}`,
          fontFamily: FONTS.body,
        },
        hover: {
          background: COLORS.bgGlass,
          boxShadow: SHADOWS.glowPurpleSm,
          borderColor: COLORS.borderStrong,
        },
      };
    case 'danger':
      return {
        base: {
          background: COLORS.dangerBg,
          color: COLORS.danger,
          border: `1px solid ${COLORS.danger}`,
          fontFamily: FONTS.body,
        },
      };
    case 'cyan':
      return {
        base: {
          background: `linear-gradient(135deg, #0891B2, ${COLORS.cyan400})`,
          color: '#FFFFFF',
          border: 'none',
          fontFamily: FONTS.display,
          letterSpacing: '0.05em',
        },
        hover: { boxShadow: SHADOWS.glowCyan },
      };
    default:
      return { base: {} };
  }
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      style,
      type = 'button',
      onClick,
      onFocus,
      onBlur,
      form,
      name,
      value,
      autoFocus,
      tabIndex,
      'aria-label': ariaLabel,
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;
    const variantStyles = getVariantStyles(variant);
    const { touchProps, motionScale } = useTouchFeedback();

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        onFocus={onFocus}
        onBlur={onBlur}
        form={form}
        name={name}
        value={value}
        autoFocus={autoFocus}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        className={cn(
          'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-[10px] font-medium touch-manipulation',
          'transition-[transform,box-shadow,background-color,border-color] duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40',
          fullWidth && 'w-full',
          isDisabled && 'cursor-not-allowed opacity-40',
          className,
        )}
        style={{
          ...sizeMap[size],
          ...variantStyles.base,
          transform: isDisabled ? undefined : `scale(${motionScale})`,
          ...style,
        }}
        onMouseEnter={
          !isDisabled && variantStyles.hover
            ? (e) => {
                Object.assign(e.currentTarget.style, variantStyles.hover);
              }
            : undefined
        }
        onMouseLeave={
          !isDisabled && variantStyles.hover
            ? (e) => {
                Object.assign(e.currentTarget.style, {
                  ...variantStyles.base,
                  transform: `scale(${motionScale})`,
                });
              }
            : undefined
        }
        {...touchProps}
      >
        {isLoading ? (
          <LoadingRing />
        ) : (
          <>
            {icon && iconPosition === 'left' ? (
              <span className="inline-flex shrink-0">{icon}</span>
            ) : null}
            {children ? <span>{children}</span> : null}
            {icon && iconPosition === 'right' ? (
              <span className="inline-flex shrink-0">{icon}</span>
            ) : null}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
