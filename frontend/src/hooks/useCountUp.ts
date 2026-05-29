'use client';

import { useEffect, useRef, useState } from 'react';

import { useInView } from '@/hooks/useInView';

interface UseCountUpOptions {
  duration?: number;
  decimals?: number;
  /** When set, overrides internal useInView trigger */
  start?: boolean;
}

export function useCountUp(
  target: number,
  { duration = 2000, decimals = 0, start }: UseCountUpOptions = {},
) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const shouldStart = start ?? isInView;
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let frameId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = target * eased;
      setValue(decimals > 0 ? parseFloat(next.toFixed(decimals)) : Math.floor(next));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration, decimals, shouldStart]);

  return { ref, value, isInView: shouldStart };
}
