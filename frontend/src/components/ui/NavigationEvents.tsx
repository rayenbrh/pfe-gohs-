'use client';

import NProgress from 'nprogress';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function NavigationEvents() {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.done();
  }, [pathname]);

  return null;
}
