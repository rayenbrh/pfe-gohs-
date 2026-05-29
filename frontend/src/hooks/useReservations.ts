'use client';

import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Reservation } from '@/types/reservation';

export function useReservations() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Reservation>>('/reservations');
      return data;
    },
    enabled: false,
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: ['reservations', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Reservation>>(`/reservations/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
