'use client';

import { VehicleCard } from './VehicleCard';
import { VehicleSwipeCarousel } from './VehicleSwipeCarousel';
import type { Vehicle } from '@/types/vehicle';

interface VehicleGridProps {
  vehicles: Vehicle[];
  size?: 'default' | 'large';
}

export function VehicleGrid({ vehicles, size = 'default' }: VehicleGridProps) {
  return (
    <>
      <div className="hidden sm:block">
        <div
          className={
            size === 'large'
              ? 'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'
              : 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'
          }
        >
          {vehicles.map((vehicle, index) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} size={size} />
          ))}
        </div>
      </div>
      <VehicleSwipeCarousel vehicles={vehicles} />
    </>
  );
}
