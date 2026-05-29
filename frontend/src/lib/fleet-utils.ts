import type { FleetFilters, SortOption, Vehicle } from '@/types/vehicle';
import { DEFAULT_FLEET_FILTERS } from '@/types/vehicle';

export function filterVehicles(vehicles: Vehicle[], filters: FleetFilters): Vehicle[] {
  return vehicles.filter((v) => {
    if (filters.category !== 'all' && v.category !== filters.category) return false;
    if (v.pricePerDay < filters.priceMin || v.pricePerDay > filters.priceMax) return false;
    if (filters.transmission.length > 0 && !filters.transmission.includes(v.transmission)) {
      return false;
    }
    if (filters.fuelTypes.length > 0 && !filters.fuelTypes.includes(v.fuelType)) {
      return false;
    }
    if (v.seats < filters.seatsMin || v.seats > filters.seatsMax) return false;
    return true;
  });
}

export function sortVehicles(vehicles: Vehicle[], sort: SortOption): Vehicle[] {
  const copy = [...vehicles];
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => a.pricePerDay - b.pricePerDay);
    case 'price_desc':
      return copy.sort((a, b) => b.pricePerDay - a.pricePerDay);
    case 'newest':
      return copy.sort((a, b) => b.year - a.year);
    case 'popular':
      return copy.sort((a, b) => b.popularity - a.popularity);
    default:
      return copy;
  }
}

export function paginateVehicles<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    page: safePage,
    totalPages,
    total: items.length,
  };
}

export function resetFleetFilters(): FleetFilters {
  return { ...DEFAULT_FLEET_FILTERS };
}

export function countDaysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
