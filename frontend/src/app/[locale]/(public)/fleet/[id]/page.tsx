import { redirect } from '@/i18n/routing';

interface FleetDetailRedirectProps {
  params: { locale: string; id: string };
}

export default function FleetDetailRedirectPage({ params }: FleetDetailRedirectProps) {
  redirect({
    href: `/agency/inova-ride/fleet/${params.id}`,
    locale: params.locale,
  });
}
