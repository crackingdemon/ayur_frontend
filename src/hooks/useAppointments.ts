import useSWR from 'swr';
import { api } from '../lib/api';
import { toast } from 'sonner';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useAppointmentsToday() {
  // Get true local date string (YYYY-MM-DD)
  const d = new Date();
  const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const { data, error, mutate, isLoading } = useSWR(`/appointments/today?date=${localDateStr}`, fetcher, {
    refreshInterval: 10000, // Short-polling every 10 seconds
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      // Optimistic UI update
      const previousData = data;
      mutate(
        data?.map((appointment: any) =>
          appointment.id === id ? { ...appointment, status } : appointment
        ),
        false // Don't revalidate immediately
      );

      await api.put(`/appointments/${id}/status`, { status });
      mutate(); // Revalidate with server truth
      toast.success(`Patient moved to ${status}`);
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update patient status');
      mutate(); // Rollback to server truth on error
    }
  };

  return {
    appointments: data || [],
    isLoading,
    error,
    updateStatus,
  };
}

export function useAppointmentsPaginated(page: number = 1, limit: number = 10) {
  const { data, error, mutate, isLoading } = useSWR(`/appointments?page=${page}&limit=${limit}`, fetcher);

  return {
    appointments: data?.data || [],
    meta: data?.meta || { total: 0, page, limit, totalPages: 1 },
    isLoading,
    error,
    mutate
  };
}
