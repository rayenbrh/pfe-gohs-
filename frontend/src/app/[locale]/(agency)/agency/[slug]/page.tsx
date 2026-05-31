import dynamic from 'next/dynamic';
import { Suspense } from 'react';

import { HeroSection } from '@/components/sections/HeroSection';
import { COLORS } from '@/lib/design-system';

const StatsSection = dynamic(
  () => import('@/components/sections/StatsSection').then((m) => m.StatsSection),
  { ssr: false },
);
const FleetPreviewSection = dynamic(
  () => import('@/components/sections/FleetPreviewSection').then((m) => m.FleetPreviewSection),
  { ssr: false },
);
const HowItWorksSection = dynamic(
  () => import('@/components/sections/HowItWorksSection').then((m) => m.HowItWorksSection),
  { ssr: false },
);
const TestimonialsSection = dynamic(
  () => import('@/components/sections/TestimonialsSection').then((m) => m.TestimonialsSection),
  { ssr: false },
);
const CTASection = dynamic(
  () => import('@/components/sections/CTASection').then((m) => m.CTASection),
  { ssr: false },
);

export default function AgencyLandingPage() {
  return (
    <div
      style={{
        background: COLORS.bgBase,
        overflowX: 'hidden',
        overflowY: 'visible',
        position: 'relative',
      }}
    >
      <div className="page-ambient" aria-hidden="true" />
      <HeroSection />
      <div className="section-transition-glow" aria-hidden="true" />
      <Suspense fallback={null}><StatsSection /></Suspense>
      <div className="section-transition-glow" aria-hidden="true" />
      <Suspense fallback={null}><FleetPreviewSection /></Suspense>
      <div className="section-transition-glow" aria-hidden="true" />
      <Suspense fallback={null}><HowItWorksSection /></Suspense>
      <div className="section-transition-glow" aria-hidden="true" />
      <Suspense fallback={null}><TestimonialsSection /></Suspense>
      <Suspense fallback={null}><CTASection /></Suspense>
    </div>
  );
}
