'use client';

import { Facebook, Github, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';
import { COLORS, FONTS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

import { Logo } from './Logo';

function useSocialLinks() {
  const tLayout = useTranslations('layout');
  return [
    { icon: Github, href: 'https://github.com', label: tLayout('social_github') },
    { icon: Instagram, href: 'https://instagram.com', label: tLayout('social_instagram') },
    { icon: Facebook, href: 'https://facebook.com', label: tLayout('social_facebook') },
  ] as const;
}

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps = {}) {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const socialLinks = useSocialLinks();

  const pageLinks = [
    { href: '/fleet', label: nav('fleet') },
    { href: '/booking', label: nav('booking') },
    { href: '/landing', label: nav('about') },
    { href: '/landing#contact', label: nav('contact') },
  ];

  const legalLinks = [
    { href: '/landing', label: t('privacy') },
    { href: '/landing', label: t('terms') },
    { href: '/landing', label: t('cookies') },
  ];

  return (
    <footer
      id="contact"
      className={cn('border-t', className)}
      style={{
        backgroundColor: COLORS.bgSurface,
        borderColor: COLORS.borderSubtle,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-[60px]">
        <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-2 sm:text-start lg:grid-cols-4 lg:gap-8">
          {/* Col 1 — brand */}
          <div className="flex flex-col items-center sm:items-start">
            <Logo />
            <p
              className="mt-4 max-w-xs"
              style={{ color: COLORS.textMuted, fontSize: 14, fontFamily: FONTS.body }}
            >
              {t('tagline')}
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-lg p-2"
                  style={{ color: COLORS.purple400 }}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — pages */}
          <div>
            <h3
              className="mb-4 font-semibold"
              style={{ color: COLORS.textPrimary, fontFamily: FONTS.body, fontSize: 14 }}
            >
              {t('pages')}
            </h3>
            <ul className="space-y-2">
              {pageLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{ color: COLORS.textSecondary, fontSize: 14 }}
                    className="hover:opacity-90"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — legal */}
          <div>
            <h3
              className="mb-4 font-semibold"
              style={{ color: COLORS.textPrimary, fontFamily: FONTS.body, fontSize: 14 }}
            >
              {t('legal')}
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    style={{ color: COLORS.textSecondary, fontSize: 14 }}
                    className="hover:opacity-90"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — contact */}
          <div>
            <h3
              className="mb-4 font-semibold"
              style={{ color: COLORS.textPrimary, fontFamily: FONTS.body, fontSize: 14 }}
            >
              {t('contact_title')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start justify-center gap-2 sm:justify-start">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: COLORS.purple400 }} />
                <span style={{ color: COLORS.textSecondary, fontSize: 14 }}>{t('address')}</span>
              </li>
              <li className="flex items-center justify-center gap-2 sm:justify-start">
                <Phone className="h-4 w-4 shrink-0" style={{ color: COLORS.purple400 }} />
                <a href={`tel:${t('phone_value')}`} style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                  {t('phone')}
                </a>
              </li>
              <li className="flex items-center justify-center gap-2 sm:justify-start">
                <Mail className="h-4 w-4 shrink-0" style={{ color: COLORS.purple400 }} />
                <a
                  href={`mailto:${t('email_value')}`}
                  style={{ color: COLORS.textSecondary, fontSize: 14 }}
                >
                  {t('email')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row"
          style={{ borderColor: COLORS.borderSubtle }}
        >
          <p style={{ color: COLORS.textMuted, fontSize: 13 }}>{t('copyright')}</p>
          <p style={{ color: COLORS.textDisabled, fontSize: 12 }}>{t('built_with')}</p>
        </div>
      </div>
    </footer>
  );
}
