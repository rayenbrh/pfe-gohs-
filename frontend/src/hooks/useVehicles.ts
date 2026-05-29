'use client';

import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { Vehicle } from '@/types/vehicle';

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Vehicle[]>>('/vehicles');
      return data.data;
    },
    enabled: false,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
