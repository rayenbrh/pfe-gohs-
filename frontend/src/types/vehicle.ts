export type VehicleCategory =
  | 'economy'
  | 'luxury'
  | 'suv'
  | 'utility'
  | 'van';

export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'unavailable';

export type FuelType = 'diesel' | 'petrol' | 'electric' | 'hybrid';

export type TransmissionType = 'manual' | 'automatic';

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  pricePerDay: number;
  status: VehicleStatus;
  imageUrl: string;
  images: string[];
  features: string[];
  fuelType: FuelType;
  transmission: TransmissionType;
  seats: number;
  mileage: number;
  engine: string;
  description: string;
  popularity: number;
  unavailableDates?: string[];
}

export type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'popular';

export interface FleetFilters {
  category: VehicleCategory | 'all';
  priceMin: number;
  priceMax: number;
  transmission: TransmissionType[];
  fuelTypes: FuelType[];
  seatsMin: number;
  seatsMax: number;
}

export const DEFAULT_FLEET_FILTERS: FleetFilters = {
  category: 'all',
  priceMin: 0,
  priceMax: 500,
  transmission: [],
  fuelTypes: [],
  seatsMin: 2,
  seatsMax: 9,
};
