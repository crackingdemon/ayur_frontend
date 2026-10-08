import useSWR from 'swr';
import { api } from '../lib/api';

export interface PatientSummary {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  visits: Array<{
    date: string;
    reason: string;
  }>;
}

export interface PaginatedPatients {
  data: PatientSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function usePatients(search?: string, page: number = 1, limit: number = 50) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const { data, error, isLoading, mutate } = useSWR(`/patients?${params.toString()}`, async (url) => {
    const response = await api.get(url);
    return response.data as PaginatedPatients;
  });

  return {
    patients: data?.data || [],
    meta: data?.meta || null,
    isLoading,
    isError: error,
    mutate
  };
}
