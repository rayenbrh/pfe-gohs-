import type { ReactNode } from 'react';

import { NavigationLoadingProvider } from '@/components/providers/NavigationLoadingProvider';

export function GlobalLoadingShell({ children }: { children: ReactNode }) {
  return <NavigationLoadingProvider>{children}</NavigationLoadingProvider>;
}
