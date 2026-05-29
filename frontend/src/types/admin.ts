import type { ReservationStatus } from './reservation';

export interface AdminStats {
  monthlyRevenue: number;
  revenueTrend: number;
  activeReservations: number;
  reservationsTrend: number;
  availableVehicles: number;
  totalVehicles: number;
  vehiclesTrend: number;
  totalClients: number;
  clientsTrend: number;
}

export interface RevenueChartPoint {
  month: string;
  revenue: number;
}

export interface ReservationStatusCount {
  status: ReservationStatus;
  count: number;
}

export interface RecentReservationRow {
  id: string;
  clientName: string;
  vehicleName: string;
  startDate: string;
  endDate: string;
  total: number;
  status: ReservationStatus;
}

export interface FleetAvailabilityCategory {
  category: string;
  available: number;
  total: number;
}

export interface MaintenanceAlert {
  id: string;
  vehicleName: string;
  maintenanceType: string;
  dueDate: string;
}
