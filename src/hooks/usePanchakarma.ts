import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export interface PanchakarmaDay {
  id: string;
  treatmentId: string;
  dayNumber: number;
  date?: string;
  notes?: string;
  status: 'Pending' | 'Completed' | 'Missed';
}

export interface PanchakarmaTreatment {
  id: string;
  patientId: string;
  visitId?: string;
  name: string;
  startDate?: string;
  totalDays: number;
  status: 'Active' | 'Completed' | 'Cancelled';
  createdAt: string;
  patient: {
    name: string;
    phone: string;
  };
  facility?: {
    name: string;
  };
  days: PanchakarmaDay[];
}

export function usePanchakarma(filters?: { status?: string, patientId?: string, facilityId?: string }) {
  const query = new URLSearchParams();
  if (filters?.status) query.append('status', filters.status);
  if (filters?.patientId) query.append('patientId', filters.patientId);
  if (filters?.facilityId) query.append('facilityId', filters.facilityId);
  
  const queryString = query.toString();
  const url = queryString ? `/panchakarma?${queryString}` : '/panchakarma';

  const { data, error, isLoading, mutate } = useSWR<PanchakarmaTreatment[]>(url, fetcher);

  return {
    treatments: data || [],
    isLoading,
    isError: error,
    mutate
  };
}

export function usePanchakarmaById(id: string) {
  const { data, error, isLoading, mutate } = useSWR<PanchakarmaTreatment>(`/panchakarma/${id}`, fetcher);

  return {
    treatment: data,
    isLoading,
    isError: error,
    mutate
  };
}
