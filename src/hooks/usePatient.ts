import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { api } from '../lib/api';

export interface PatientProfileData {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  bloodGroup: string | null;
  allergies: string | null;
  pastHistory: string | null;
  drugHistory: string | null;
  personalHistory: string | null;
  familyHistory: string | null;
  visits: Array<{
    id: string;
    date: string;
    doctor: string;
    reason: string;
    status: string;
    modernEMR: any;
    ayurvedicEMR: any;
    diagnosis: any;
  }>;
}

export function usePatient(patientId: string) {
  const [patient, setPatient] = useState<PatientProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/patients/${patientId}`);
      setPatient(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patient profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  const updateModernEMR = async (visitId: string, data: any) => {
    if (!patientId || !visitId) return;
    try {
      await api.put(`/patients/${patientId}/visits/${visitId}/modern-emr`, data);
      await fetchPatient(); // Refresh data
    } catch (err) {
      console.error('Failed to update Modern EMR', err);
      throw err;
    }
  };

  const updateAyurvedicEMR = async (visitId: string, data: any) => {
    if (!patientId || !visitId) return;
    try {
      await api.put(`/patients/${patientId}/visits/${visitId}/ayurvedic-emr`, data);
      await fetchPatient(); // Refresh data
    } catch (err) {
      console.error('Failed to update Ayurvedic EMR', err);
      throw err;
    }
  };

  const updateDiagnosis = async (visitId: string, data: any) => {
    if (!patientId || !visitId) return;
    try {
      await api.put(`/patients/${patientId}/visits/${visitId}/diagnosis`, data);
      await fetchPatient(); // Refresh data
    } catch (err) {
      console.error('Failed to update Diagnosis', err);
      throw err;
    }
  };

  const updatePatientInfo = async (data: any) => {
    if (!patientId) return;
    try {
      await api.put(`/patients/${patientId}`, data);
      await fetchPatient(); // Refresh data
    } catch (err) {
      console.error('Failed to update Patient Info', err);
      throw err;
    }
  };

  return {
    patient,
    isLoading,
    error,
    refetch: fetchPatient,
    updateModernEMR,
    updateAyurvedicEMR,
    updateDiagnosis,
    updatePatientInfo
  };
}

export function usePatientHistory(patientId: string, page: number = 1, limit: number = 5) {
  const { data, error, isLoading } = useSWR(
    patientId ? `/patients/${patientId}/history?page=${page}&limit=${limit}` : null,
    (url) => api.get(url).then(res => res.data)
  );

  return {
    history: data?.data || [],
    meta: data?.meta || { total: 0, page: 1, limit: 5, totalPages: 0 },
    isLoading,
    isError: error
  };
}
