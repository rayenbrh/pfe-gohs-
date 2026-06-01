'use client';

import { animate, motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

import { COLORS } from '@/lib/design-system';
import type { Vehicle } from '@/types/vehicle';

import { VehicleCard } from './VehicleCard';

interface VehicleSwipeCarouselProps {
  vehicles: Vehicle[];
  fleetBasePath?: string;
  bookingBasePath?: string;
}

export function VehicleSwipeCarousel({
  vehicles,
  fleetBasePath = '/fleet',
  bookingBasePath = '/booking',
}: VehicleSwipeCarouselProps) {
  const t = useTranslations('common');
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(320);
  const [activeIndex, setActiveIndex] = useState(0);
  const x = useMotionValue(0);
  const gap = 16;

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setCardWidth(containerRef.current.offsetWidth * 0.88);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const snapTo = (index: number) => {
    const clamped = Math.max(0, Math.min(vehicles.length - 1, index));
    setActiveIndex(clamped);
    animate(x, -clamped * (cardWidth + gap), {
      type: 'spring',
      stiffness: 320,
      damping: 32,
    });
  };

  if (vehicles.length === 0) return null;

  return (
    <div ref={containerRef} className="sm:hidden">
      <motion.div
        className="flex cursor-grab active:cursor-grabbing"
        style={{ x, gap }}
        drag="x"
        dragConstraints={{
          left: -((vehicles.length - 1) * (cardWidth + gap)),
          right: 0,
        }}
        dragElastic={0.08}
        onDragEnd={(_, info) => {
          const offset = info.offset.x;
          const velocity = info.velocity.x;
          let next = activeIndex;
          if (offset < -40 || velocity < -200) next = activeIndex + 1;
          else if (offset > 40 || velocity > 200) next = activeIndex - 1;
          snapTo(next);
        }}
      >
        {vehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            className="shrink-0"
            style={{ width: cardWidth }}
          >
            <VehicleCard
              vehicle={vehicle}
              index={index}
              size="large"
              fleetBasePath={fleetBasePath}
              bookingBasePath={bookingBasePath}
            />
          </motion.div>
        ))}
      </motion.div>
      <div className="mt-4 flex justify-center gap-2">
        {vehicles.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => snapTo(i)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            aria-label={t('slide', { number: i + 1 })}
          >
            <span
              className="block h-2 rounded-full transition-all"
              style={{
                width: i === activeIndex ? 20 : 8,
                backgroundColor:
                  i === activeIndex ? COLORS.purple600 : COLORS.borderDefault,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
