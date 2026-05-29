import type {
  AdminStats,
  FleetAvailabilityCategory,
  MaintenanceAlert,
  RecentReservationRow,
  ReservationStatusCount,
  RevenueChartPoint,
} from '@/types/admin';

export const mockAdminStats: AdminStats = {
  monthlyRevenue: 84250,
  revenueTrend: 12.4,
  activeReservations: 47,
  reservationsTrend: 8.2,
  availableVehicles: 18,
  totalVehicles: 24,
  vehiclesTrend: 5.1,
  totalClients: 2847,
  clientsTrend: 15.3,
};

export const mockRevenueChart: RevenueChartPoint[] = [
  { month: 'Jun', revenue: 42000 },
  { month: 'Jul', revenue: 51000 },
  { month: 'Aug', revenue: 48000 },
  { month: 'Sep', revenue: 62000 },
  { month: 'Oct', revenue: 58000 },
  { month: 'Nov', revenue: 71000 },
  { month: 'Dec', revenue: 89000 },
  { month: 'Jan', revenue: 76000 },
  { month: 'Feb', revenue: 68000 },
  { month: 'Mar', revenue: 82000 },
  { month: 'Apr', revenue: 79000 },
  { month: 'May', revenue: 84250 },
];

export const mockReservationStatus: ReservationStatusCount[] = [
  { status: 'confirmed', count: 24 },
  { status: 'active', count: 18 },
  { status: 'completed', count: 156 },
  { status: 'cancelled', count: 12 },
  { status: 'pending', count: 8 },
];

export const mockRecentReservations: RecentReservationRow[] = [
  {
    id: 'RES-2401',
    clientName: 'Sarah Ben Ammar',
    vehicleName: 'Tesla Model 3',
    startDate: '2026-06-01',
    endDate: '2026-06-05',
    total: 756,
    status: 'confirmed',
  },
  {
    id: 'RES-2402',
    clientName: 'Karim Trabelsi',
    vehicleName: 'BMW X5',
    startDate: '2026-06-03',
    endDate: '2026-06-10',
    total: 1155,
    status: 'active',
  },
  {
    id: 'RES-2403',
    clientName: 'Emma Gharbi',
    vehicleName: 'Mercedes Classe S',
    startDate: '2026-05-28',
    endDate: '2026-06-02',
    total: 1600,
    status: 'completed',
  },
  {
    id: 'RES-2404',
    clientName: 'Youssef Masmoudi',
    vehicleName: 'Peugeot 208',
    startDate: '2026-06-08',
    endDate: '2026-06-12',
    total: 225,
    status: 'pending',
  },
  {
    id: 'RES-2405',
    clientName: 'Leila Bouazizi',
    vehicleName: 'VW Caravelle',
    startDate: '2026-06-05',
    endDate: '2026-06-15',
    total: 950,
    status: 'confirmed',
  },
  {
    id: 'RES-2406',
    clientName: 'Ahmed Khelifi',
    vehicleName: 'Range Rover Sport',
    startDate: '2026-05-20',
    endDate: '2026-05-25',
    total: 1400,
    status: 'cancelled',
  },
  {
    id: 'RES-2407',
    clientName: 'Nour Haddad',
    vehicleName: 'Toyota RAV4',
    startDate: '2026-06-10',
    endDate: '2026-06-14',
    total: 520,
    status: 'active',
  },
  {
    id: 'RES-2408',
    clientName: 'Mariem Sassi',
    vehicleName: 'Audi A4',
    startDate: '2026-06-12',
    endDate: '2026-06-18',
    total: 840,
    status: 'pending',
  },
];

export const mockFleetAvailability: FleetAvailabilityCategory[] = [
  { category: 'economy', available: 8, total: 10 },
  { category: 'luxury', available: 3, total: 6 },
  { category: 'suv', available: 5, total: 8 },
  { category: 'van', available: 2, total: 4 },
];

export const mockMaintenanceAlerts: MaintenanceAlert[] = [
  {
    id: '1',
    vehicleName: 'Renault Kangoo',
    maintenanceType: 'Vidange + filtres',
    dueDate: '2026-06-02',
  },
  {
    id: '2',
    vehicleName: 'BMW X5',
    maintenanceType: 'Contrôle freins',
    dueDate: '2026-06-05',
  },
];
