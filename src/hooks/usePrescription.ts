import useSWR from 'swr';
import { api } from '../lib/api';
import { Prescription } from '../types';

export function usePrescription(visitId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    visitId ? `/prescriptions/visit/${visitId}` : null,
    (url) => api.get(url).then(res => res.data)
  );

  const savePrescription = async (prescriptionData: Partial<Prescription>) => {
    try {
      const res = await api.post(`/prescriptions/visit/${visitId}`, prescriptionData);
      mutate(res.data);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    prescription: data,
    isLoading,
    isError: error,
    savePrescription
  };
}
