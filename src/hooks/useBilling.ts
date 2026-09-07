import useSWR from 'swr';
import { api } from '../lib/api';

export function usePendingBills(patientId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    patientId ? `/billing/patients/${patientId}/pending` : null,
    async (url) => {
      const response = await api.get(url);
      return response.data;
    }
  );

  return {
    bills: data,
    isLoading,
    isError: error,
    mutate
  };
}
