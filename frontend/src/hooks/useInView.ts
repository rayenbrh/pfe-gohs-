'use client';

import { useEffect, useState, type RefObject } from 'react';

interface UseInViewOptions {
  once?: boolean;
  margin?: string;
}

export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { once = true, margin = '0px' }: UseInViewOptions = {},
) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || (once && isInView)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsInView(false);
        }
      },
      { rootMargin: margin, threshold: 0 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, once, margin, isInView]);

  return isInView;
}
