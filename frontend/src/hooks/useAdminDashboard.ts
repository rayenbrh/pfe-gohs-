'use client';

import { useQuery } from '@tanstack/react-query';

import {
  EMPTY_ADMIN_STATS,
  EMPTY_RESERVATION_STATUS,
  fetchAdminStats,
  fetchFleetAvailability,
  fetchMaintenanceAlerts,
  fetchRecentReservations,
  fetchReservationStatus,
  fetchRevenueChart,
} from '@/lib/admin-api';
import {
  mockAdminStats,
  mockFleetAvailability,
  mockMaintenanceAlerts,
  mockRecentReservations,
  mockReservationStatus,
  mockRevenueChart,
} from '@/lib/admin-mock-data';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
    placeholderData: EMPTY_ADMIN_STATS,
    retry: 2,
    staleTime: 30_000,
  });
}

export function useRecentReservations() {
  return useQuery({
    queryKey: ['admin', 'reservations', 'recent'],
    queryFn: fetchRecentReservations,
    placeholderData: mockRecentReservations,
    retry: 2,
    staleTime: 30_000,
  });
}

export function useRevenueChart() {
  return useQuery({
    queryKey: ['admin', 'charts', 'revenue'],
    queryFn: fetchRevenueChart,
    placeholderData: [],
    retry: 2,
    staleTime: 60_000,
  });
}

export function useReservationStatusChart() {
  return useQuery({
    queryKey: ['admin', 'charts', 'reservations'],
    queryFn: fetchReservationStatus,
    placeholderData: EMPTY_RESERVATION_STATUS,
    retry: 2,
    staleTime: 60_000,
  });
}

export function useFleetAvailability() {
  return useQuery({
    queryKey: ['admin', 'fleet', 'availability'],
    queryFn: fetchFleetAvailability,
    placeholderData: mockFleetAvailability,
    retry: 2,
    staleTime: 60_000,
  });
}

export function useMaintenanceAlerts() {
  return useQuery({
    queryKey: ['admin', 'maintenance', 'alerts'],
    queryFn: fetchMaintenanceAlerts,
    placeholderData: [],
    retry: 2,
    staleTime: 60_000,
  });
}

/** @deprecated use EMPTY_ADMIN_STATS from admin-api */
export { mockAdminStats };
