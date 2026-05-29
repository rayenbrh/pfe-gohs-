'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { COLORS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  /** Sticky footer (Apply / Reset buttons) */
  footer?: ReactNode;
}

export function BottomSheet({ open, onClose, children, className, footer }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: 'rgba(7, 6, 13, 0.85)' }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className={cn(
              'fixed inset-x-0 bottom-0 z-[101] flex max-h-[90svh] flex-col rounded-t-2xl border-t',
              className,
            )}
            style={{
              backgroundColor: COLORS.bgSurface,
              borderColor: COLORS.borderSubtle,
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
            }}
          >
            <div className="flex shrink-0 justify-center pt-3 pb-2">
              <span
                className="h-1 w-10 rounded-full"
                style={{ backgroundColor: COLORS.borderDefault }}
                aria-hidden
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>
            {footer ? (
              <div
                className="shrink-0 border-t px-5 py-4"
                style={{
                  borderColor: COLORS.borderSubtle,
                  paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
                }}
              >
                {footer}
              </div>
            ) : null}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
