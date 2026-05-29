'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/design-system';

interface VehicleGalleryProps {
  images: string[];
  name: string;
}

export function VehicleGallery({ images, name }: VehicleGalleryProps) {
  const [active, setActive] = useState(0);
  const has360 = images.length > 1;

  return (
    <div>
      <div className="relative h-[400px] overflow-hidden rounded-xl bg-bg-elevated">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative h-full w-full"
          >
            <Image
              src={images[active] ?? images[0]}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          </motion.div>
        </AnimatePresence>
        {has360 ? (
          <div className="absolute start-4 top-4">
            <Badge variant="cyan" size="sm" text="360°" />
          </div>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className="relative h-20 overflow-hidden rounded-lg border-2"
              style={{
                borderColor: i === active ? COLORS.purple600 : COLORS.borderSubtle,
              }}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
