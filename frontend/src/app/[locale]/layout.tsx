import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Noto_Sans_Arabic, Orbitron, Space_Grotesk } from 'next/font/google';
import { notFound } from 'next/navigation';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

import { routing, type Locale } from '@/i18n/routing';
import { GlobalLoadingShell } from '@/components/layout/GlobalLoadingShell';
import { LocaleSync } from '@/components/providers/LocaleSync';
import { AuthProvider } from '@/providers/AuthProvider';
import { MotionProvider } from '@/providers/MotionProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ToastProvider } from '@/providers/ToastProvider';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className="dark">
      <body
        className={`${orbitron.variable} ${spaceGrotesk.variable} ${notoArabic.variable} min-h-screen bg-bg-base font-body antialiased`}
      >
        <GlobalLoadingShell>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
          <NextIntlClientProvider messages={messages}>
            <LocaleSync />
            <MotionProvider>
              <QueryProvider>
                <AuthProvider>
                  <ToastProvider>{children}</ToastProvider>
                </AuthProvider>
              </QueryProvider>
            </MotionProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
        </GlobalLoadingShell>
      </body>
    </html>
  );
}
