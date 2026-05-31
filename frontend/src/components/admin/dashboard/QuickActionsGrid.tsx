'use client';

import { Calendar, Car, FileDown, UserPlus, Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

import { GlassCard } from '@/components/ui/GlassCard';
import { COLORS, FONTS, SHADOWS } from '@/lib/design-system';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

const adminActions = [
  { hrefSuffix: '/fleet/new', icon: Car, key: 'action_add_vehicle' },
  { hrefSuffix: '/reservations', icon: Calendar, key: 'action_new_reservation' },
  { hrefSuffix: '/clients', icon: UserPlus, key: 'action_add_client' },
  { hrefSuffix: '/maintenance', icon: Wrench, key: 'action_maintenance' },
] as const;

const employeeActions = [
  { hrefSuffix: '/reservations', icon: Calendar, key: 'action_new_reservation' },
  { hrefSuffix: '/clients', icon: UserPlus, key: 'action_add_client' },
  { hrefSuffix: '/invoices', icon: FileDown, key: 'action_generate_report' },
] as const;

export function QuickActionsGrid() {
  const t = useTranslations('admin');
  const { user } = useAuthStore();
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const isAdmin = user?.role === 'admin';
  const actions = isAdmin ? adminActions : employeeActions;

  // Base path: if we have a slug, use agency dashboard path, otherwise legacy /admin path
  const basePath = slug ? `/agency/${slug}/dashboard` : '/admin';

  return (
    <div
      className="h-full rounded-[14px] border p-5"
      style={{ backgroundColor: COLORS.bgSurface, borderColor: COLORS.borderDefault }}
    >
      <h3
        className="mb-5 text-base font-semibold text-text-primary"
        style={{ fontFamily: FONTS.body }}
      >
        {t('quick_actions')}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ hrefSuffix, icon: Icon, key }) => (
          <Link key={key} href={`${basePath}${hrefSuffix}`}>
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
                <span className="text-[13px] text-text-secondary" style={{ fontFamily: FONTS.body }}>
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
