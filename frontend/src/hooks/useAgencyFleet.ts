'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAgencyVehicle, fetchAgencyVehicles } from '@/lib/agency-fleet-api';

export function useAgencyFleet(agencySlug: string | undefined, options?: { limit?: number }) {
  return useQuery({
    queryKey: ['agency-fleet', agencySlug, options?.limit],
    queryFn: () => fetchAgencyVehicles(agencySlug!, { limit: options?.limit ?? 50 }),
    enabled: Boolean(agencySlug),
    staleTime: 60_000,
  });
}

export function useAgencyVehicle(agencySlug: string | undefined, vehicleId: string) {
  return useQuery({
    queryKey: ['agency-fleet', agencySlug, vehicleId],
    queryFn: () => fetchAgencyVehicle(agencySlug!, vehicleId),
    enabled: Boolean(agencySlug && vehicleId),
    staleTime: 60_000,
  });
}
