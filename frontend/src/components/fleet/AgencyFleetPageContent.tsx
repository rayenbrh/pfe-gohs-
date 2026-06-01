'use client';

import { useParams } from 'next/navigation';

import { FleetCatalog } from '@/components/fleet/FleetCatalog';
import { useAgencyFleet } from '@/hooks/useAgencyFleet';
import { agencyFleetPath } from '@/lib/agency-fleet-api';

export function AgencyFleetPageContent() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { data: vehicles = [], isLoading } = useAgencyFleet(slug);

  return (
    <FleetCatalog
      vehicles={vehicles}
      loading={isLoading}
      fleetBasePath={agencyFleetPath(slug)}
      bookingBasePath={`/agency/${slug}/booking`}
    />
  );
}
