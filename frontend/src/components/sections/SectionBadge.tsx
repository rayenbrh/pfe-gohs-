'use client';

import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/lib/design-system';

interface SectionBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionBadge({ children, className }: SectionBadgeProps) {
  return (
    <div className={className}>
      <span
        className="inline-flex items-center rounded-full border px-4 py-1.5"
        style={{
          background: COLORS.bgGlass,
          borderColor: COLORS.borderDefault,
          backdropFilter: 'blur(16px)',
        }}
      >
        <Badge variant="purple" size="sm" text={String(children)} />
      </span>
    </div>
  );
}
