import type { FuelType, TransmissionType, Vehicle, VehicleCategory, VehicleStatus } from '@/types/vehicle';

/** Raw vehicle document from GET /api/agency/:slug/vehicles */
export interface ApiVehicleDoc {
  _id: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  pricePerDay: number;
  images?: string[];
  features?: string[];
  fuelType: FuelType;
  transmission: TransmissionType;
  seats: number;
  mileage?: number;
  description?: string;
  isAvailable?: boolean;
  isActive?: boolean;
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1494977668657-f9d793c623d4?w=800&q=85&auto=format';

export function mapApiVehicleToVehicle(doc: ApiVehicleDoc): Vehicle {
  const images = doc.images?.length ? doc.images : [PLACEHOLDER_IMAGE];
  const status: VehicleStatus = doc.isAvailable === false ? 'unavailable' : 'available';

  return {
    id: String(doc._id),
    name: `${doc.brand} ${doc.model}`,
    brand: doc.brand,
    model: doc.model,
    year: doc.year,
    category: doc.category,
    pricePerDay: doc.pricePerDay,
    status,
    imageUrl: images[0]!,
    images,
    features: doc.features ?? [],
    fuelType: doc.fuelType,
    transmission: doc.transmission,
    seats: doc.seats,
    mileage: doc.mileage ?? 0,
    engine: `${doc.brand} ${doc.model}`,
    description: doc.description ?? '',
    popularity: 80,
  };
}
