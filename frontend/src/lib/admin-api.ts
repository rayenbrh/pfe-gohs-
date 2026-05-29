import api, { unwrapApiResponse } from '@/lib/api';
import {
  mockAdminStats,
  mockFleetAvailability,
  mockMaintenanceAlerts,
  mockRecentReservations,
  mockReservationStatus,
  mockRevenueChart,
} from '@/lib/admin-mock-data';
import type {
  AdminStats,
  FleetAvailabilityCategory,
  MaintenanceAlert,
  RecentReservationRow,
  ReservationStatusCount,
  RevenueChartPoint,
} from '@/types/admin';
import type { ReservationStatus } from '@/types/reservation';

interface BackendStats {
  vehicles?: { total?: number; available?: number };
  reservations?: { active?: number; thisMonth?: number };
  clients?: { total?: number };
  revenue?: { thisMonth?: number };
  payments?: { pending?: number };
}

const RESERVATION_STATUSES: ReservationStatus[] = [
  'pending',
  'confirmed',
  'active',
  'completed',
  'cancelled',
];

export const EMPTY_ADMIN_STATS: AdminStats = {
  monthlyRevenue: 0,
  revenueTrend: 0,
  activeReservations: 0,
  reservationsTrend: 0,
  availableVehicles: 0,
  totalVehicles: 0,
  vehiclesTrend: 0,
  totalClients: 0,
  clientsTrend: 0,
};

export const EMPTY_RESERVATION_STATUS: ReservationStatusCount[] = RESERVATION_STATUSES.map(
  (status) => ({ status, count: 0 }),
);

export const EMPTY_RESERVATION_STATUS_MAP: Record<ReservationStatus, number> = {
  pending: 0,
  confirmed: 0,
  active: 0,
  completed: 0,
  cancelled: 0,
};

function devFallback<T>(label: string, fallback: T): T {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[admin] ${label} — using development fallback data`);
    return fallback;
  }
  return fallback;
}

async function withDevFallback<T>(
  label: string,
  fetcher: () => Promise<T>,
  empty: T,
  mock: T,
): Promise<T> {
  try {
    return await fetcher();
  } catch {
    if (process.env.NODE_ENV === 'development') {
      return devFallback(label, mock);
    }
    return empty;
  }
}

export function mapAdminStats(raw: BackendStats): AdminStats {
  return {
    monthlyRevenue: raw.revenue?.thisMonth ?? 0,
    revenueTrend: 0,
    activeReservations: raw.reservations?.active ?? 0,
    reservationsTrend: 0,
    availableVehicles: raw.vehicles?.available ?? 0,
    totalVehicles: raw.vehicles?.total ?? 0,
    vehiclesTrend: 0,
    totalClients: raw.clients?.total ?? 0,
    clientsTrend: 0,
  };
}

export function mapReservationStatus(
  raw: Record<string, number> | ReservationStatusCount[],
): ReservationStatusCount[] {
  if (Array.isArray(raw)) {
    return raw.length > 0 ? raw : EMPTY_RESERVATION_STATUS;
  }
  return RESERVATION_STATUSES.map((status) => ({
    status,
    count: raw[status] ?? 0,
  }));
}

export function mapRecentReservations(raw: unknown): RecentReservationRow[] {
  const list = Array.isArray(raw)
    ? raw
    : ((raw as { reservations?: unknown[] })?.reservations ?? []);

  return list.map((item) => {
    const r = item as Record<string, unknown>;
    const client = r.client as Record<string, unknown> | undefined;
    const vehicle = r.vehicle as Record<string, unknown> | undefined;
    const clientName = client
      ? `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim()
      : '—';
    const vehicleName = vehicle
      ? `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim()
      : '—';

    return {
      id: String(r.reservationNumber ?? r._id ?? ''),
      clientName,
      vehicleName,
      startDate: r.startDate
        ? new Date(String(r.startDate)).toISOString().slice(0, 10)
        : '',
      endDate: r.endDate ? new Date(String(r.endDate)).toISOString().slice(0, 10) : '',
      total: Number(r.totalPrice ?? 0),
      status: (r.status as ReservationStatus) ?? 'pending',
    };
  });
}

export function mapFleetAvailability(raw: {
  fleet?: Array<{ category: string; isAvailable: boolean }>;
}): FleetAvailabilityCategory[] {
  const counts = new Map<string, { available: number; total: number }>();

  for (const vehicle of raw.fleet ?? []) {
    const current = counts.get(vehicle.category) ?? { available: 0, total: 0 };
    current.total += 1;
    if (vehicle.isAvailable) current.available += 1;
    counts.set(vehicle.category, current);
  }

  return Array.from(counts.entries()).map(([category, value]) => ({
    category,
    ...value,
  }));
}

export function mapMaintenanceAlerts(raw: {
  vehicles?: Array<{
    _id: string;
    brand?: string;
    model?: string;
    nextMaintenanceDate?: string;
  }>;
}): MaintenanceAlert[] {
  return (raw.vehicles ?? []).map((vehicle) => ({
    id: String(vehicle._id),
    vehicleName: `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() || 'Vehicle',
    maintenanceType: 'Scheduled maintenance',
    dueDate: vehicle.nextMaintenanceDate
      ? new Date(vehicle.nextMaintenanceDate).toISOString().slice(0, 10)
      : '',
  }));
}

export async function fetchAdminStats(): Promise<AdminStats> {
  return withDevFallback(
    'stats',
    async () => {
      const { data } = await api.get('/admin/stats');
      return mapAdminStats(unwrapApiResponse<BackendStats>(data));
    },
    EMPTY_ADMIN_STATS,
    mockAdminStats,
  );
}

export async function fetchRecentReservations(): Promise<RecentReservationRow[]> {
  return withDevFallback(
    'recent reservations',
    async () => {
      const { data } = await api.get('/reservations', {
        params: { limit: 8, sort: '-createdAt' },
      });
      const payload = unwrapApiResponse<{ reservations?: unknown[] } | unknown[]>(data);
      return mapRecentReservations(payload);
    },
    [],
    mockRecentReservations,
  );
}

export async function fetchRevenueChart(): Promise<RevenueChartPoint[]> {
  return withDevFallback(
    'revenue chart',
    async () => {
      const { data } = await api.get('/admin/charts/revenue');
      const points = unwrapApiResponse<RevenueChartPoint[]>(data);
      return Array.isArray(points) ? points : [];
    },
    [],
    mockRevenueChart,
  );
}

export async function fetchReservationStatus(): Promise<ReservationStatusCount[]> {
  return withDevFallback(
    'reservation status',
    async () => {
      const { data } = await api.get('/admin/charts/reservations');
      const payload = unwrapApiResponse<Record<string, number>>(data);
      return mapReservationStatus(payload);
    },
    EMPTY_RESERVATION_STATUS,
    mockReservationStatus,
  );
}

export async function fetchFleetAvailability(): Promise<FleetAvailabilityCategory[]> {
  return withDevFallback(
    'fleet availability',
    async () => {
      const { data } = await api.get('/admin/fleet/availability');
      return mapFleetAvailability(
        unwrapApiResponse<{ fleet?: Array<{ category: string; isAvailable: boolean }> }>(data),
      );
    },
    [],
    mockFleetAvailability,
  );
}

export async function fetchMaintenanceAlerts(): Promise<MaintenanceAlert[]> {
  return withDevFallback(
    'maintenance alerts',
    async () => {
      const { data } = await api.get('/maintenance', { params: { upcoming: 'true' } });
      return mapMaintenanceAlerts(
        unwrapApiResponse<{
          vehicles?: Array<{
            _id: string;
            brand?: string;
            model?: string;
            nextMaintenanceDate?: string;
          }>;
        }>(data),
      );
    },
    [],
    mockMaintenanceAlerts,
  );
}
