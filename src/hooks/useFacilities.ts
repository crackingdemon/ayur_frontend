import useSWR from 'swr';
import { api } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';

export const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useFacilities() {
  const { data: facilities, error, isLoading, mutate } = useSWR('/facilities', fetcher);
  
  const [isCreating, setIsCreating] = useState(false);

  const createFacility = async (data: { name: string; type?: string; address?: string }) => {
    setIsCreating(true);
    try {
      await api.post('/facilities', data);
      toast.success('Facility created successfully');
      mutate();
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create facility');
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const switchFacility = async (facilityId: string) => {
    try {
      if (facilityId === 'all') {
        localStorage.removeItem('vaidyaos_facility');
        window.location.reload();
        return;
      }
      
      await api.post('/facilities/switch', { facilityId });
      localStorage.setItem('vaidyaos_facility', facilityId);
      // Force a full reload to clear all cached SWR data and re-fetch for new facility
      window.location.reload();
    } catch (err: any) {
      toast.error('Failed to switch facility');
    }
  };

  return {
    facilities: facilities || [],
    isLoading,
    isError: error,
    createFacility,
    isCreating,
    switchFacility
  };
}
