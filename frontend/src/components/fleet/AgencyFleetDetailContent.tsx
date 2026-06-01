'use client';

import { useParams } from 'next/navigation';

import { VehicleDetailView } from '@/components/fleet/VehicleDetailView';
import { Spinner } from '@/components/ui/Spinner';
import { useAgencyVehicle } from '@/hooks/useAgencyFleet';
import { Link } from '@/i18n/routing';
import { agencyFleetPath } from '@/lib/agency-fleet-api';

export function AgencyFleetDetailContent() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const id = typeof params.id === 'string' ? params.id : '';
  const { data: vehicle, isLoading, isError } = useAgencyVehicle(slug, id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!vehicle || isError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-text-secondary">Véhicule introuvable.</p>
        <Link href={agencyFleetPath(slug)} className="mt-4 inline-block text-brand-500 underline">
          Retour à la flotte
        </Link>
      </div>
    );
  }

  return <VehicleDetailView vehicle={vehicle} bookingBasePath={`/agency/${slug}/booking`} />;
}
