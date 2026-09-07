import useSWR from 'swr';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useStaff() {
  const { data: staff, error, isLoading, mutate } = useSWR('/users', fetcher);

  const addStaff = async (payload: any) => {
    try {
      await api.post('/users', payload);
      mutate();
      toast.success('Staff member added successfully');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add staff');
      return false;
    }
  };

  const toggleFacilityAccess = async (userId: string, facilityId: string, hasAccess: boolean) => {
    try {
      // Optimistic UI update
      const previousData = staff;
      mutate(
        staff.map((user: any) => {
          if (user.id === userId) {
            const currentAccess = user.facilityAccess || [];
            return {
              ...user,
              facilityAccess: hasAccess 
                ? [...currentAccess, { facilityId }]
                : currentAccess.filter((f: any) => f.facilityId !== facilityId)
            };
          }
          return user;
        }),
        false
      );

      if (hasAccess) {
        await api.post(`/users/${userId}/facilities/${facilityId}`);
      } else {
        await api.delete(`/users/${userId}/facilities/${facilityId}`);
      }
      
      mutate();
      toast.success('Branch access updated');
    } catch (err: any) {
      toast.error('Failed to update branch access');
      mutate(); // rollback
    }
  };

  return {
    staff: staff || [],
    isLoading,
    isError: error,
    addStaff,
    toggleFacilityAccess
  };
}
