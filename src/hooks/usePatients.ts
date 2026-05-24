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

export function usePatients(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const { data, error, isLoading, mutate } = useSWR(`/patients${query}`, async (url) => {
    const response = await api.get(url);
    return response.data as PatientSummary[];
  });

  return {
    patients: data || [],
    isLoading,
    isError: error,
    mutate
  };
}
