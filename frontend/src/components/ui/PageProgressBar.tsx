'use client';

import NProgress from 'nprogress';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

NProgress.configure({
  minimum: 0.15,
  easing: 'ease',
  speed: 300,
  showSpinner: false,
  trickleSpeed: 200,
});

export function PageProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathname = useRef('');

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      NProgress.start();
      prevPathname.current = pathname;
      const timer = setTimeout(() => NProgress.done(), 400);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  return null;
}
