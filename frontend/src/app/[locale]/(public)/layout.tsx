import type { ReactNode } from 'react';

import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-72px)] overflow-x-hidden pb-mobile-nav sm:pb-0">
        {children}
      </main>
      <Footer className="pb-mobile-nav sm:pb-0" />
      <BottomTabBar />
    </>
  );
}
