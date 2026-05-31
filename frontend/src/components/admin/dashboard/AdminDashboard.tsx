'use client';

import { Calendar, Car, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { RevenueLineChart, ReservationDonutChart } from '@/components/admin/Charts';
import { QueryPanel } from '@/components/admin/QueryPanel';
import { StatCard } from '@/components/admin/StatCard';
import { FleetAvailabilityCard } from '@/components/admin/dashboard/FleetAvailabilityCard';
import { MaintenanceAlertsCard } from '@/components/admin/dashboard/MaintenanceAlertsCard';
import { QuickActionsGrid } from '@/components/admin/dashboard/QuickActionsGrid';
import { RecentReservationsTable } from '@/components/admin/dashboard/RecentReservationsTable';
import { SectionErrorBoundary } from '@/components/ui/SectionErrorBoundary';
import {
  useAdminStats,
  useFleetAvailability,
  useMaintenanceAlerts,
  useRecentReservations,
  useReservationStatusChart,
  useRevenueChart,
} from '@/hooks/useAdminDashboard';
import { EMPTY_ADMIN_STATS } from '@/lib/admin-api';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { useAuthStore } from '@/stores/authStore';
import type { ReservationStatus } from '@/types/reservation';

export function AdminDashboard() {
  const t = useTranslations('admin');
  const tStatus = useTranslations('admin.status');
  const { formatPrice } = useLocaleFormat();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const statsQuery = useAdminStats();
  const revenueQuery = useRevenueChart();
  const statusQuery = useReservationStatusChart();
  const reservationsQuery = useRecentReservations();
  const fleetQuery = useFleetAvailability();
  const maintenanceQuery = useMaintenanceAlerts();

  const stats = statsQuery.data ?? EMPTY_ADMIN_STATS;
  const revenueData = revenueQuery.data ?? [];
  const statusData = statusQuery.data ?? [];
  const recentReservations = reservationsQuery.data ?? [];
  const fleetCategories = fleetQuery.data ?? [];
  const maintenanceAlerts = maintenanceQuery.data ?? [];

  const statusLabels: Record<ReservationStatus, string> = {
    pending: tStatus('pending'),
    confirmed: tStatus('confirmed'),
    active: tStatus('active'),
    completed: tStatus('completed'),
    cancelled: tStatus('cancelled'),
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionErrorBoundary sectionName="KPI stats">
        <QueryPanel
          isLoading={statsQuery.isLoading && !statsQuery.data}
          isError={false}
          onRetry={() => statsQuery.refetch()}
          minHeight={120}
        >
          <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-4">
            <StatCard
              label={t('kpi_revenue')}
              value={stats.monthlyRevenue}
              icon={Car}
              trend={stats.revenueTrend}
              trendMonthLabel={t('trend_month')}
              valueColor="brand"
              formatValue={(n) => formatPrice(n)}
            />
            <StatCard
              label={t('kpi_reservations')}
              value={stats.activeReservations}
              icon={Calendar}
              trend={stats.reservationsTrend}
              trendMonthLabel={t('trend_month')}
              valueColor="cyan"
            />
            <StatCard
              label={t('kpi_vehicles')}
              value={stats.availableVehicles}
              icon={Car}
              trend={stats.vehiclesTrend}
              trendMonthLabel={t('trend_month')}
              valueColor="success"
              formatValue={(n) => `${n} / ${stats.totalVehicles}`}
            />
            <StatCard
              label={t('kpi_clients')}
              value={stats.totalClients}
              icon={Users}
              trend={stats.clientsTrend}
              trendMonthLabel={t('trend_month')}
              valueColor="brandLight"
            />
          </div>
        </QueryPanel>
      </SectionErrorBoundary>

      <div className="grid gap-5 lg:grid-cols-[65%_35%]">
        <SectionErrorBoundary sectionName="Revenue chart">
          <QueryPanel
            isLoading={revenueQuery.isLoading && revenueData.length === 0}
            isError={false}
            onRetry={() => revenueQuery.refetch()}
            minHeight={320}
          >
            <RevenueLineChart data={revenueData} />
          </QueryPanel>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="Reservation status">
          <QueryPanel
            isLoading={statusQuery.isLoading && statusData.length === 0}
            isError={false}
            onRetry={() => statusQuery.refetch()}
            minHeight={320}
          >
            <ReservationDonutChart data={statusData} statusLabels={statusLabels} />
          </QueryPanel>
        </SectionErrorBoundary>
      </div>

      <SectionErrorBoundary sectionName="Recent reservations">
        <QueryPanel
          isLoading={reservationsQuery.isLoading && recentReservations.length === 0}
          isError={false}
          onRetry={() => reservationsQuery.refetch()}
        >
          <RecentReservationsTable data={recentReservations} isLoading={false} />
        </QueryPanel>
      </SectionErrorBoundary>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionErrorBoundary sectionName="Fleet availability">
          <QueryPanel
            isLoading={fleetQuery.isLoading && fleetCategories.length === 0}
            isError={false}
            onRetry={() => fleetQuery.refetch()}
          >
            <FleetAvailabilityCard categories={fleetCategories} />
          </QueryPanel>
        </SectionErrorBoundary>
        <QuickActionsGrid />
      </div>

      {/* Maintenance alerts — admin only */}
      {isAdmin && maintenanceAlerts.length > 0 ? (
        <SectionErrorBoundary sectionName="Maintenance alerts">
          <QueryPanel
            isLoading={maintenanceQuery.isLoading && maintenanceAlerts.length === 0}
            isError={false}
            onRetry={() => maintenanceQuery.refetch()}
            minHeight={80}
          >
            <MaintenanceAlertsCard alerts={maintenanceAlerts} />
          </QueryPanel>
        </SectionErrorBoundary>
      ) : null}
    </div>
  );
}
