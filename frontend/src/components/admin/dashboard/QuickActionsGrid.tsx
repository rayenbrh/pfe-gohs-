'use client';

import { Calendar, Car, FileDown, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { GlassCard } from '@/components/ui/GlassCard';
import { Link } from '@/i18n/routing';
import { COLORS, FONTS, SHADOWS } from '@/lib/design-system';

const actions = [
  { href: '/admin/fleet/new', icon: Car, key: 'action_add_vehicle' },
  { href: '/admin/reservations', icon: Calendar, key: 'action_new_reservation' },
  { href: '/admin/clients', icon: UserPlus, key: 'action_add_client' },
  { href: '/admin/invoices', icon: FileDown, key: 'action_generate_report' },
] as const;

export function QuickActionsGrid() {
  const t = useTranslations('admin');

  return (
    <div
      className="h-full rounded-[14px] border p-5"
      style={{
        backgroundColor: COLORS.bgSurface,
        borderColor: COLORS.borderDefault,
      }}
    >
      <h3
        className="mb-5 text-base font-semibold text-text-primary"
        style={{ fontFamily: FONTS.body }}
      >
        {t('quick_actions')}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ href, icon: Icon, key }) => (
          <Link key={key} href={href}>
            <div
              className="transition-[transform,border-color,box-shadow] duration-200 ease-out"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.borderColor = COLORS.borderStrong;
                e.currentTarget.style.boxShadow = SHADOWS.glowPurpleSm;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <GlassCard className="flex flex-col items-center justify-center !p-4 text-center">
                <Icon className="mb-2 h-8 w-8" style={{ color: COLORS.purple400 }} />
                <span
                  className="text-[13px] text-text-secondary"
                  style={{ fontFamily: FONTS.body }}
                >
                  {t(key)}
                </span>
              </GlassCard>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
