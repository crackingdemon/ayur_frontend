import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useDoctors() {
  const { data: doctors, error, isLoading } = useSWR('/users/doctors', fetcher);

  return {
    doctors: doctors || [],
    isLoading,
    isError: error
  };
}
