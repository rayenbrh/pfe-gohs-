'use client';

import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';
import { COLORS, FONTS } from '@/lib/design-system';

export function CTASection() {
  const t = useTranslations('landing.cta');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        padding: '80px 24px',
        textAlign: 'center',
        overflow: 'visible',
        background: 'transparent',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(138,92,246,0.35) 50%, transparent 100%)',
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(138,92,246,0.25) 50%, transparent 100%)',
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '1000px',
          height: '600px',
          background:
            'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(124,58,237,0.13) 0%, rgba(124,58,237,0.04) 45%, transparent 68%)',
          pointerEvents: 'none',
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '-10%',
          transform: 'translateY(-50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          right: '-10%',
          transform: 'translateY(-50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: FONTS.display,
            fontSize: 'clamp(36px, 5vw, 60px)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            marginBottom: '16px',
            background: `linear-gradient(135deg, ${COLORS.purple400} 0%, ${COLORS.cyan400} 50%, ${COLORS.purple300} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {t('headline')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontFamily: FONTS.body,
            fontSize: '18px',
            color: COLORS.textSecondary,
            marginBottom: '40px',
          }}
        >
          {t('subheadline')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/booking">
            <Button variant="primary" size="lg">
              {t('book')}
            </Button>
          </Link>
          <Link href="/landing#contact">
            <Button variant="ghost" size="lg">
              {t('contact')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
