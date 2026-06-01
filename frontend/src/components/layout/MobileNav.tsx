'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Link } from '@/i18n/routing';
import { COLORS, FONTS } from '@/lib/design-system';

import { Logo } from './Logo';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  links: readonly { href: string; label: string }[];
  loginHref?: string;
  bookingHref?: string;
}

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function MobileNav({
  open,
  onClose,
  links,
  loginHref = '/auth/login',
  bookingHref = '/booking',
}: MobileNavProps) {
  const t = useTranslations('nav');

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] md:hidden"
            style={{ backgroundColor: 'rgba(7, 6, 13, 0.95)' }}
            onClick={onClose}
            aria-hidden
          />

          <motion.nav
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-[61] flex flex-col md:hidden"
            style={{ backgroundColor: COLORS.bgBase }}
            role="dialog"
            aria-modal
            aria-label={t('menu')}
          >
            {/* Top */}
            <div
              className="flex h-16 items-center justify-between border-b px-5 sm:h-[72px]"
              style={{ borderColor: COLORS.borderSubtle }}
            >
              <Link href="/" onClick={onClose}>
                <Logo />
              </Link>
              <motion.button
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg p-2"
                style={{ color: COLORS.textMuted }}
                aria-label={t('close')}
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Links */}
            <motion.ul
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="flex-1 overflow-y-auto px-5 pt-4"
            >
              {links.map((link) => (
                <motion.li key={link.href} variants={itemVariants}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="block border-b py-5"
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 24,
                      color: COLORS.textPrimary,
                      borderColor: COLORS.borderSubtle,
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li variants={itemVariants}>
                <Link
                  href={loginHref}
                  onClick={onClose}
                  className="block border-b py-5"
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 24,
                    color: COLORS.textPrimary,
                    borderColor: COLORS.borderSubtle,
                  }}
                >
                  {t('login')}
                </Link>
              </motion.li>
            </motion.ul>

            {/* Bottom */}
            <div
              className="flex flex-col gap-4 border-t p-5"
              style={{ borderColor: COLORS.borderSubtle }}
            >
              <LanguageSwitcher />
              <Link href={bookingHref} onClick={onClose}>
                <Button fullWidth>{t('book_now')}</Button>
              </Link>
            </div>
          </motion.nav>
        </>
      ) : null}
    </AnimatePresence>
  );
}
