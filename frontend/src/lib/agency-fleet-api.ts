import api, { unwrapApiResponse } from '@/lib/api';
import { mapApiVehicleToVehicle, type ApiVehicleDoc } from '@/lib/map-vehicle';
import type { Vehicle } from '@/types/vehicle';

interface VehiclesListEnvelope {
  vehicles: ApiVehicleDoc[];
}

interface VehicleEnvelope {
  vehicle: ApiVehicleDoc;
}

export async function fetchAgencyVehicles(
  agencySlug: string,
  params?: { limit?: number; category?: string; all?: boolean },
): Promise<Vehicle[]> {
  const { data } = await api.get(`/api/agency/${agencySlug}/vehicles`, {
    params: {
      limit: params?.limit ?? 50,
      all: params?.all !== false ? 'true' : undefined,
      category: params?.category,
    },
  });

  const body = data as {
    data?: VehiclesListEnvelope;
    vehicles?: ApiVehicleDoc[];
  };

  const raw =
    body.data?.vehicles ??
    (unwrapApiResponse<VehiclesListEnvelope>(data)?.vehicles ?? body.vehicles ?? []);

  return raw.map(mapApiVehicleToVehicle);
}

export async function fetchAgencyVehicle(
  agencySlug: string,
  vehicleId: string,
): Promise<Vehicle | null> {
  try {
    const { data } = await api.get(`/api/agency/${agencySlug}/vehicles/${vehicleId}`);
    const payload = unwrapApiResponse<VehicleEnvelope>(data);
    const doc = payload?.vehicle ?? (data as { data?: { vehicle?: ApiVehicleDoc } }).data?.vehicle;
    if (!doc) return null;
    return mapApiVehicleToVehicle(doc);
  } catch {
    return null;
  }
}

export function agencyFleetPath(slug: string, vehicleId?: string): string {
  return vehicleId ? `/agency/${slug}/fleet/${vehicleId}` : `/agency/${slug}/fleet`;
}

export function agencyBookingPath(slug: string, vehicleId: string): string {
  return `/agency/${slug}/booking?vehicleId=${vehicleId}`;
}
