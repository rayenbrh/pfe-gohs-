import { redirect } from '@/i18n/routing';

interface FleetRedirectPageProps {
  params: { locale: string };
}

/** Global /fleet redirects to the default seeded agency catalogue. */
export default function FleetPage({ params }: FleetRedirectPageProps) {
  redirect({ href: '/agency/inova-ride/fleet', locale: params.locale });
}
