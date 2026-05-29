'use client';

import type { ReactNode } from 'react';

import { Link, usePathname } from '@/i18n/routing';
import { COLORS, FONTS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname();
  const pathOnly = href.split('#')[0] || href;
  const isActive =
    pathname === pathOnly ||
    (pathOnly !== '/landing' && pathname.startsWith(`${pathOnly}/`));

  return (
    <Link
      href={href}
      className={cn('group relative px-1 py-2 transition-colors duration-150', className)}
      style={{
        fontFamily: FONTS.body,
        fontSize: 14,
        color: isActive ? COLORS.textPrimary : COLORS.textSecondary,
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.color = COLORS.textPrimary;
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.color = COLORS.textSecondary;
      }}
    >
      <span className="inline-block">{children}</span>
      {isActive ? (
        <span
          className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full"
          style={{ backgroundColor: COLORS.purple600 }}
        />
      ) : (
        <span
          className="absolute inset-x-0 -bottom-0.5 h-px scale-x-0 rounded-full transition-transform duration-200 group-hover:scale-x-100"
          style={{ backgroundColor: COLORS.purple400 }}
        />
      )}
    </Link>
  );
}
