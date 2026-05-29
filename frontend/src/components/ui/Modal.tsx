'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, type ReactNode } from 'react';

import { COLORS, FONTS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

import { GlassCard } from './GlassCard';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  className?: string;
}

const sizeMap: Record<ModalSize, number> = {
  sm: 480,
  md: 600,
  lg: 760,
  xl: 960,
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}: ModalProps) {
  const t = useTranslations('common');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
            style={{
              backgroundColor: 'rgba(7, 6, 13, 0.85)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className={cn('relative z-10 w-full', className)}
            style={{ maxWidth: sizeMap[size] }}
            role="dialog"
            aria-modal
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            <GlassCard glowColor="purple" className="!p-0">
              <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: COLORS.borderSubtle }}>
                {title ? (
                  <h2
                    id="modal-title"
                    className="text-lg font-semibold"
                    style={{ fontFamily: FONTS.display, color: COLORS.textPrimary }}
                  >
                    {title}
                  </h2>
                ) : (
                  <span />
                )}
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg p-1"
                  style={{ color: COLORS.textMuted }}
                  aria-label={t('close')}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              <div className="px-6 py-5">{children}</div>
            </GlassCard>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
