import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface PatientSummary {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  visits: Array<{
    date: string;
    reason: string;
  }>;
}

export function usePatients() {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    isLoading,
    error,
    refetch: fetchPatients
  };
}
