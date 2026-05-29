'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { COLORS, FONTS, SHADOWS } from '@/lib/design-system';
import { cn } from '@/lib/utils';
import { countDaysBetween, formatDateISO } from '@/lib/fleet-utils';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  unavailableDates?: string[];
  className?: string;
}

import { toIntlLocale } from '@/lib/i18n/locale';

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(date: Date, start: Date, end: Date) {
  const t = date.getTime();
  return t > start.getTime() && t < end.getTime();
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = getDaysInMonth(year, month);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

function MonthCalendar({
  year,
  month,
  startDate,
  endDate,
  onSelect,
  unavailableSet,
  today,
}: {
  year: number;
  month: number;
  startDate: Date | null;
  endDate: Date | null;
  onSelect: (date: Date) => void;
  unavailableSet: Set<string>;
  today: Date;
}) {
  const locale = useLocale();
  const tCal = useTranslations('calendar');
  const weekdays = tCal.raw('weekdays_short') as string[];
  const cells = getMonthGrid(year, month);
  const monthLabel = new Intl.DateTimeFormat(toIntlLocale(locale), {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1));

  return (
    <div className="min-w-[280px] flex-1">
      <p
        className="mb-3 text-center text-[13px] font-medium capitalize text-text-primary"
        style={{ fontFamily: FONTS.display }}
      >
        {monthLabel}
      </p>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekdays.map((d) => (
          <span
            key={d}
            className="text-center text-[11px] text-text-muted"
            style={{ fontFamily: FONTS.body }}
          >
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <span key={`empty-${i}`} />;
          const iso = formatDateISO(date);
          const isPast = date < today;
          const isUnavailable = unavailableSet.has(iso);
          const isStart = startDate && isSameDay(date, startDate);
          const isEnd = endDate && isSameDay(date, endDate);
          const inRange =
            startDate && endDate && isBetween(date, startDate, endDate);
          const isToday = isSameDay(date, today);

          const disabled = isPast || isUnavailable;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={cn(
                'relative flex h-9 w-9 items-center justify-center rounded-lg text-sm',
                disabled && 'cursor-not-allowed',
              )}
              style={{
                fontFamily: FONTS.body,
                backgroundColor: isStart || isEnd
                  ? COLORS.purple600
                  : inRange
                    ? 'rgba(124, 58, 237, 0.15)'
                    : 'transparent',
                color: isPast
                  ? COLORS.textDisabled
                  : isUnavailable
                    ? COLORS.danger
                    : isStart || isEnd || inRange
                      ? COLORS.textPrimary
                      : COLORS.textSecondary,
                boxShadow: isStart || isEnd ? SHADOWS.glowPurpleSm : undefined,
                textDecoration: isUnavailable ? 'line-through' : undefined,
              }}
            >
              {date.getDate()}
              {isToday && !isStart && !isEnd ? (
                <span
                  className="absolute bottom-1 h-1 w-1 rounded-full"
                  style={{ backgroundColor: COLORS.purple400 }}
                />
              ) : null}
              {isUnavailable && !isPast ? (
                <span
                  className="absolute inset-0 rounded-lg"
                  style={{ backgroundColor: 'rgba(248, 113, 113, 0.08)' }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  unavailableDates = [],
  className,
}: DateRangePickerProps) {
  const t = useTranslations('booking');
  const tCal = useTranslations('calendar');
  const today = startOfDay(new Date());
  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));

  const unavailableSet = useMemo(
    () => new Set(unavailableDates),
    [unavailableDates],
  );

  const monthA = { year: viewDate.getFullYear(), month: viewDate.getMonth() };
  const monthB = useMemo(() => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [viewDate]);

  const handleSelect = (date: Date) => {
    const d = startOfDay(date);
    if (!startDate || (startDate && endDate)) {
      onChange(d, null);
      return;
    }
    if (d < startDate) {
      onChange(d, null);
      return;
    }
    onChange(startDate, d);
  };

  const nights =
    startDate && endDate ? countDaysBetween(startDate, endDate) : 0;

  const shiftMonth = (delta: number) => {
    setViewDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + delta);
      return next;
    });
  };

  return (
    <div
      className={cn('rounded-[14px] border p-4 md:p-5', className)}
      style={{
        backgroundColor: COLORS.bgElevated,
        borderColor: COLORS.borderDefault,
      }}
    >
      <div className="mb-4 flex items-center justify-between rtl:flex-row-reverse">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="touch-target rounded-lg p-2 text-text-muted hover:text-text-primary"
          aria-label={tCal('prev_month')}
        >
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="touch-target rounded-lg p-2 text-text-muted hover:text-text-primary"
          aria-label={tCal('next_month')}
        >
          <ChevronRight className="h-5 w-5 rtl:rotate-180" />
        </button>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:gap-4">
        <MonthCalendar
          year={monthA.year}
          month={monthA.month}
          startDate={startDate}
          endDate={endDate}
          onSelect={handleSelect}
          unavailableSet={unavailableSet}
          today={today}
        />
        <div className="hidden md:block">
          <MonthCalendar
            year={monthB.year}
            month={monthB.month}
            startDate={startDate}
            endDate={endDate}
            onSelect={handleSelect}
            unavailableSet={unavailableSet}
            today={today}
          />
        </div>
      </div>

      <AnimatePresence>
        {startDate && endDate ? (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center text-xs"
            style={{ fontFamily: FONTS.display, color: COLORS.purple300 }}
          >
            {t('nights_count', { count: nights })}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
