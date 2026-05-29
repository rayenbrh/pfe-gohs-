import Client from '../models/Client';
import Invoice from '../models/Invoice';
import MaintenanceLog from '../models/MaintenanceLog';
import Reservation from '../models/Reservation';
import Vehicle from '../models/Vehicle';

function getMonthBounds(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

function parsePeriodMonths(period?: string): number {
  if (period === '3months') return 3;
  if (period === '6months') return 6;
  return 12;
}

function fillMonthlyRevenue(
  rows: Array<{ _id: { year: number; month: number }; revenue: number }>,
  months: number,
): Array<{ month: string; revenue: number }> {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = `${row._id.year}-${String(row._id.month).padStart(2, '0')}`;
    map.set(key, row.revenue);
  }

  const result: Array<{ month: string; revenue: number }> = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    result.push({ month: key, revenue: map.get(key) ?? 0 });
  }

  return result;
}

export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [
    totalVehicles,
    availableVehicles,
    activeReservations,
    totalClients,
    monthRevenue,
    monthReservations,
    pendingPayments,
  ] = await Promise.all([
    Vehicle.countDocuments({ isActive: { $ne: false } }),
    Vehicle.countDocuments({ isAvailable: true, isActive: { $ne: false } }),
    Reservation.countDocuments({ status: { $in: ['confirmed', 'active'] } }),
    Client.countDocuments({ isActive: { $ne: false } }),
    Invoice.aggregate([
      {
        $match: {
          status: 'paid',
          paidAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Reservation.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Invoice.countDocuments({ status: { $in: ['draft', 'sent'] } }),
  ]);

  const revenueTotal = monthRevenue[0]?.total ?? 0;

  return {
    vehicles: {
      total: totalVehicles,
      available: availableVehicles,
      unavailable: totalVehicles - availableVehicles,
    },
    reservations: {
      active: activeReservations,
      thisMonth: monthReservations,
    },
    clients: { total: totalClients },
    revenue: { thisMonth: revenueTotal },
    payments: { pending: pendingPayments },
  };
}

export async function getRevenueChart(period?: string) {
  const months = parsePeriodMonths(period);
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - (months - 1));
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const rows = await Invoice.aggregate([
    {
      $match: {
        status: 'paid',
        paidAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return fillMonthlyRevenue(rows, months);
}

export async function getReservationsChart() {
  const rows = await Reservation.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const counts = {
    pending: 0,
    confirmed: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const row of rows) {
    const status = row._id as keyof typeof counts;
    if (status in counts) counts[status] = row.count;
  }

  return counts;
}

export async function getVehiclesByCategoryChart() {
  const rows = await Vehicle.aggregate([
    { $match: { isActive: { $ne: false } } },
    {
      $group: {
        _id: '$category',
        total: { $sum: 1 },
        available: {
          $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((r) => ({
    category: r._id as string,
    total: r.total as number,
    available: r.available as number,
  }));
}

export async function getMonthlyReport(month: string) {
  const [year, monthNum] = month.split('-').map(Number);
  const { start, end } = getMonthBounds(year, monthNum);

  const [
    reservations,
    statusBreakdown,
    revenueAgg,
    topVehicles,
    newClients,
    maintenanceLogs,
    maintenanceCostAgg,
  ] = await Promise.all([
    Reservation.find({ createdAt: { $gte: start, $lte: end } })
      .populate('vehicle', 'brand model licensePlate')
      .populate('client', 'firstName lastName')
      .sort('-createdAt'),
    Reservation.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Invoice.aggregate([
      {
        $match: {
          status: 'paid',
          paidAt: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Reservation.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$vehicle', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_id',
          foreignField: '_id',
          as: 'vehicle',
        },
      },
      { $unwind: '$vehicle' },
      {
        $project: {
          vehicleId: '$_id',
          count: 1,
          brand: '$vehicle.brand',
          model: '$vehicle.model',
          licensePlate: '$vehicle.licensePlate',
        },
      },
    ]),
    Client.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    MaintenanceLog.find({ performedAt: { $gte: start, $lte: end } })
      .populate('vehicle', 'brand model licensePlate')
      .sort('-performedAt'),
    MaintenanceLog.aggregate([
      { $match: { performedAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$cost' } } },
    ]),
  ]);

  const breakdown: Record<string, number> = {};
  for (const row of statusBreakdown) {
    breakdown[row._id as string] = row.count;
  }

  return {
    month,
    period: { start, end },
    reservations: {
      total: reservations.length,
      statusBreakdown: breakdown,
      items: reservations,
    },
    revenue: { total: revenueAgg[0]?.total ?? 0 },
    topVehicles,
    newClients,
    maintenance: {
      totalEntries: maintenanceLogs.length,
      totalCost: maintenanceCostAgg[0]?.total ?? 0,
      items: maintenanceLogs,
    },
  };
}

export async function getFleetAvailability() {
  const vehicles = await Vehicle.find({ isActive: { $ne: false } })
    .select('brand model year category isAvailable licensePlate')
    .sort('category brand');

  const activeReservations = await Reservation.find({
    status: { $in: ['confirmed', 'active'] },
  })
    .populate('client', 'firstName lastName')
    .select('vehicle startDate endDate reservationNumber status');

  const reservationByVehicle = new Map(
    activeReservations.map((r) => [String(r.vehicle), r]),
  );

  const fleet = vehicles.map((v) => {
    const current = reservationByVehicle.get(String(v._id));
    return {
      vehicleId: v._id,
      displayName: `${v.brand} ${v.model} ${v.year}`,
      category: v.category,
      licensePlate: v.licensePlate,
      isAvailable: v.isAvailable,
      currentReservation: current
        ? {
            reservationNumber: current.reservationNumber,
            status: current.status,
            startDate: current.startDate,
            endDate: current.endDate,
            client: current.client,
          }
        : null,
    };
  });

  const byCategory = fleet.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof fleet>,
  );

  return { fleet, byCategory };
}

/** @deprecated Use getDashboardStats */
export class StatsService {
  static getDashboardStats = getDashboardStats;
}
