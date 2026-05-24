import useSWR from 'swr';
import { api } from '../lib/api';

export function useInventoryList(page: number = 1, limit: number = 20, search: string = "", filterStatus: string = "") {
  const { data, error, isLoading, mutate } = useSWR(
    `/inventory?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(filterStatus)}`,
    (url) => api.get(url).then(res => res.data)
  );

  return {
    inventory: data?.data || [],
    meta: data?.meta || { total: 0, page: 1, limit: 20, totalPages: 0 },
    isLoading,
    isError: error,
    mutate
  };
}
