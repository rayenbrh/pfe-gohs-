'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { COLORS, FONTS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export const Select = forwardRef<HTMLInputElement, SelectProps>(function Select(
  {
    label,
    error,
    hint,
    options,
    value: controlledValue,
    defaultValue,
    onChange,
    placeholder = '—',
    disabled,
    className,
    id,
    name,
  },
  ref,
) {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const value = controlledValue ?? internalValue;
  const selected = options.find((o) => o.value === value);
  const hasError = Boolean(error);

  const handleSelect = useCallback(
    (next: string) => {
      if (controlledValue === undefined) setInternalValue(next);
      onChange?.(next);
      setOpen(false);
    },
    [controlledValue, onChange],
  );

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className={cn('relative flex w-full flex-col', className)} ref={containerRef}>
      {name ? (
        <input ref={ref} type="hidden" name={name} value={value} readOnly />
      ) : null}

      {label ? (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-[13px] tracking-[0.05em]"
          style={{ color: COLORS.textMuted, fontFamily: FONTS.body }}
        >
          {label}
        </label>
      ) : null}

      <button
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center justify-between rounded-[10px] border px-4 py-3 text-sm',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        style={{
          backgroundColor: COLORS.bgSurface,
          borderColor: hasError ? COLORS.danger : open ? COLORS.purple600 : COLORS.borderDefault,
          boxShadow: open && !hasError ? '0 0 0 3px rgba(124, 58, 237, 0.15)' : 'none',
          color: selected ? COLORS.textPrimary : COLORS.textDisabled,
          fontFamily: FONTS.body,
          textAlign: isRtl ? 'right' : 'left',
        }}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ms-2 shrink-0"
        >
          <ChevronDown className="h-4 w-4" style={{ color: COLORS.purple300 }} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-[10px] border py-1 shadow-card"
            style={{
              backgroundColor: COLORS.bgElevated,
              borderColor: COLORS.borderDefault,
            }}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm"
                    style={{
                      color: isSelected ? COLORS.purple300 : COLORS.textSecondary,
                      fontFamily: FONTS.body,
                      backgroundColor: isSelected ? COLORS.bgGlass : 'transparent',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = COLORS.bgGlass;
                        e.currentTarget.style.color = COLORS.textPrimary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = COLORS.textSecondary;
                      }
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected ? (
                      <Check className="h-4 w-4 shrink-0" style={{ color: COLORS.purple400 }} />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>

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
});
