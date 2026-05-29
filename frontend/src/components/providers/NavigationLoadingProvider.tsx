'use client';

import NProgress from 'nprogress';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { AdminPageLoader } from '@/components/ui/AdminPageLoader';
import { AuthPageLoader } from '@/components/ui/AuthPageLoader';
import { PublicPageLoader } from '@/components/ui/PublicPageLoader';

NProgress.configure({
  minimum: 0.15,
  easing: 'ease',
  speed: 300,
  showSpinner: false,
  trickleSpeed: 200,
});

type LoaderType = 'public' | 'admin' | 'auth';

const MIN_VISIBLE_MS = 450;

function stripLocale(pathname: string) {
  return pathname.replace(/^\/(fr|en|ar)(?=\/|$)/, '') || '/';
}

function getLoaderType(path: string): LoaderType {
  const normalized = stripLocale(path.split('?')[0] || path);
  if (normalized.startsWith('/admin')) return 'admin';
  if (normalized.startsWith('/auth')) return 'auth';
  return 'public';
}

function isInternalPath(href: string) {
  if (!href.startsWith('/') || href.startsWith('//')) return false;
  if (href.startsWith('/api')) return false;
  return true;
}

interface NavigationLoadingContextValue {
  startNavigation: (href: string) => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextValue | null>(null);

export function useNavigationLoading() {
  return useContext(NavigationLoadingContext);
}

interface NavigationLoadingProviderProps {
  children: ReactNode;
}

export function NavigationLoadingProvider({ children }: NavigationLoadingProviderProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [loaderType, setLoaderType] = useState<LoaderType>('public');

  const pendingRef = useRef(false);
  const startedAtRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathnameRef = useRef(pathname);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const finishNavigation = useCallback(() => {
    if (!pendingRef.current) return;

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      pendingRef.current = false;
      setVisible(false);
      NProgress.done();
      hideTimerRef.current = null;
    }, remaining);
  }, [clearHideTimer]);

  const startNavigation = useCallback(
    (href: string) => {
      if (!isInternalPath(href)) return;

      const targetPath = href.split('?')[0] || href;
      const currentPath = pathnameRef.current.split('?')[0] || pathnameRef.current;

      if (stripLocale(targetPath) === stripLocale(currentPath)) return;

      clearHideTimer();
      pendingRef.current = true;
      startedAtRef.current = Date.now();
      setLoaderType(getLoaderType(targetPath));
      setVisible(true);
      NProgress.start();
    },
    [clearHideTimer],
  );

  useEffect(() => {
    pathnameRef.current = pathname;
    if (pendingRef.current) {
      finishNavigation();
    }
  }, [pathname, finishNavigation]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a');
      if (!anchor) return;

      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || !isInternalPath(href)) return;

      startNavigation(href);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [startNavigation]);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  return (
    <NavigationLoadingContext.Provider value={{ startNavigation }}>
      {visible ? (
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="fixed inset-0 z-[9998] overflow-auto bg-[#07060D]"
        >
          {loaderType === 'admin' ? (
            <AdminPageLoader />
          ) : loaderType === 'auth' ? (
            <AuthPageLoader />
          ) : (
            <PublicPageLoader overlay />
          )}
        </div>
      ) : null}
      {children}
    </NavigationLoadingContext.Provider>
  );
}
