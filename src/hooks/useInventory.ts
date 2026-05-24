import useSWR from 'swr';
import { api } from '../lib/api';

export function useInventorySearch(query: string) {
  const { data, error, isLoading } = useSWR(
    query ? `/inventory/search?q=${encodeURIComponent(query)}` : null,
    (url) => api.get(url).then(res => res.data)
  );

  return {
    results: data || [],
    isLoading,
    isError: error
  };
}
