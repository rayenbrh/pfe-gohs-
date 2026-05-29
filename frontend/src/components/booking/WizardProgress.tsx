'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { COLORS, FONTS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

const STEP_KEYS = ['step_vehicle', 'step_details', 'step_payment', 'step_confirm'] as const;
const TOTAL = STEP_KEYS.length;

interface WizardProgressProps {
  currentStep: number;
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  const t = useTranslations('booking');
  const progressPercent = ((currentStep + 1) / TOTAL) * 100;

  return (
    <>
      <div className="mb-8 sm:hidden">
        <p
          className="mb-3 text-center text-xs text-text-muted"
          style={{ fontFamily: FONTS.display }}
        >
          {t('step_of', { current: currentStep + 1, total: TOTAL })}
        </p>
        <div
          className="h-[3px] w-full overflow-hidden rounded-full"
          style={{ backgroundColor: COLORS.borderSubtle }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${progressPercent}%`, backgroundColor: COLORS.purple600 }}
          />
        </div>
      </div>

      <div className="mb-10 hidden items-center justify-between sm:flex rtl:flex-row-reverse">
        {STEP_KEYS.map((key, i) => {
          const completed = i < currentStep;
          const current = i === currentStep;
          const future = i > currentStep;

          return (
            <div key={key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  {current ? (
                    <span
                      className="absolute inset-0 animate-ping rounded-full opacity-75"
                      style={{ border: `2px solid ${COLORS.purple600}` }}
                    />
                  ) : null}
                  <div
                    className={cn(
                      'relative flex h-10 w-10 items-center justify-center rounded-full border-2',
                    )}
                    style={{
                      backgroundColor: completed || current ? COLORS.purple600 : 'transparent',
                      borderColor: future ? COLORS.borderSubtle : COLORS.purple600,
                    }}
                  >
                    {completed ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: current ? COLORS.textPrimary : COLORS.textMuted,
                          fontFamily: FONTS.display,
                        }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className="hidden max-w-[90px] text-center text-sm md:block"
                  style={{
                    color: current ? COLORS.textPrimary : COLORS.textMuted,
                    fontFamily: FONTS.body,
                  }}
                >
                  {t(key)}
                </span>
              </div>
              {i < STEP_KEYS.length - 1 ? (
                <div
                  className="mx-2 h-0.5 flex-1"
                  style={{
                    backgroundColor: completed ? COLORS.purple600 : COLORS.borderSubtle,
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
