import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface PatientProfileData {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  bloodGroup: string | null;
  allergies: string | null;
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

  const updateModernEMR = async (data: any) => {
    if (!patientId) return;
    try {
      await api.put(`/patients/${patientId}/modern-emr`, data);
      await fetchPatient(); // Refresh data
    } catch (err) {
      console.error('Failed to update Modern EMR', err);
      throw err;
    }
  };

  const updateAyurvedicEMR = async (data: any) => {
    if (!patientId) return;
    try {
      await api.put(`/patients/${patientId}/ayurvedic-emr`, data);
      await fetchPatient(); // Refresh data
    } catch (err) {
      console.error('Failed to update Ayurvedic EMR', err);
      throw err;
    }
  };

  const updateDiagnosis = async (data: any) => {
    if (!patientId) return;
    try {
      await api.put(`/patients/${patientId}/diagnosis`, data);
      await fetchPatient(); // Refresh data
    } catch (err) {
      console.error('Failed to update Diagnosis', err);
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
    updateDiagnosis
  };
}
