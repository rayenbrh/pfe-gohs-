'use client';

import { useLocale } from 'next-intl';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { COLORS, FONTS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

export type InputIconPosition = 'left' | 'right';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: InputIconPosition;
  endAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      endAdornment,
      id,
      disabled,
      style,
      ...props
    },
    ref,
  ) => {
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const inputId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

    const resolvedIconPosition = isRtl
      ? iconPosition === 'left'
        ? 'right'
        : 'left'
      : iconPosition;

    const hasError = Boolean(error);

    return (
      <div className={cn('flex w-full flex-col', className)}>
        {label ? (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-[13px] tracking-[0.05em]"
            style={{ color: COLORS.textMuted, fontFamily: FONTS.body }}
          >
            {label}
          </label>
        ) : null}

        <div
          className={cn(
            'relative flex items-center rounded-[10px] border',
            disabled && 'cursor-not-allowed opacity-50',
          )}
          style={{
            backgroundColor: COLORS.bgSurface,
            borderColor: hasError ? COLORS.danger : COLORS.borderDefault,
            padding: icon ? '0 16px' : '12px 16px',
          }}
        >
          {icon && resolvedIconPosition === 'left' ? (
            <span
              className="me-3 inline-flex shrink-0"
              style={{ color: COLORS.textMuted }}
            >
              {icon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            dir={isRtl ? 'rtl' : 'ltr'}
            className={cn(
              'w-full flex-1 bg-transparent text-sm outline-none placeholder:text-text-disabled',
              icon && 'py-3',
              !icon && 'py-0',
            )}
            style={{
              color: COLORS.textPrimary,
              fontFamily: FONTS.body,
              textAlign: isRtl ? 'right' : 'left',
              ...style,
            }}
            placeholder={props.placeholder}
            onFocus={(e) => {
              if (!hasError) {
                e.currentTarget.parentElement!.style.borderColor = COLORS.purple600;
                e.currentTarget.parentElement!.style.boxShadow =
                  '0 0 0 3px rgba(124, 58, 237, 0.15)';
              }
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              e.currentTarget.parentElement!.style.borderColor = hasError
                ? COLORS.danger
                : COLORS.borderDefault;
              e.currentTarget.parentElement!.style.boxShadow = 'none';
              props.onBlur?.(e);
            }}
            {...props}
          />

          {icon && resolvedIconPosition === 'right' && !endAdornment ? (
            <span
              className="ms-3 inline-flex shrink-0"
              style={{ color: COLORS.textMuted }}
            >
              {icon}
            </span>
          ) : null}

          {endAdornment ? (
            <span className="ms-2 inline-flex shrink-0">{endAdornment}</span>
          ) : null}
        </div>

        {error ? (
          <p className="mt-1.5 text-xs" style={{ color: COLORS.danger, fontSize: 12 }}>
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-xs" style={{ color: COLORS.textMuted, fontSize: 12 }}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
