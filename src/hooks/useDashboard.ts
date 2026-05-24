import useSWR from 'swr';
import { api } from '../lib/api';

export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR('/dashboard/stats', async (url) => {
    const response = await api.get(url);
    return response.data;
  }, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate
  };
}
