import type { Vehicle } from '@/types/vehicle';

/**
 * Public global fleet catalogue — vehicles live in each agency DB (see agency-fleet-api).
 * Use /agency/:slug/fleet for real inventory.
 */
export const fleetVehicles: Vehicle[] = [];

export function getVehicleById(_id: string): Vehicle | undefined {
  return undefined;
}

export const FLEET_PRICE_MIN = 0;
export const FLEET_PRICE_MAX = 500;
