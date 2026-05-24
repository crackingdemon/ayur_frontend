import useSWR from 'swr';
import { api } from '../lib/api';

export function useAllPrescriptions(page: number = 1, limit: number = 10, search: string = "") {
  const { data, error, isLoading, mutate } = useSWR(
    `/prescriptions?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
    (url) => api.get(url).then(res => res.data)
  );

  return {
    prescriptions: data?.data || [],
    meta: data?.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
    isLoading,
    isError: error,
    mutate
  };
}
