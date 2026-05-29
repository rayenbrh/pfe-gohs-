import { notFound } from 'next/navigation';

import { VehicleDetailView } from '@/components/fleet/VehicleDetailView';
import { getVehicleById } from '@/lib/fleet-data';

interface FleetDetailPageProps {
  params: { id: string };
}

export default function FleetDetailPage({ params }: FleetDetailPageProps) {
  const vehicle = getVehicleById(params.id);

  if (!vehicle) {
    notFound();
  }

  return <VehicleDetailView vehicle={vehicle} />;
}
