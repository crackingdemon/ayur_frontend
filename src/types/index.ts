export interface Patient {
  id: string;
  organizationId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  visits?: Visit[];
}

export interface Visit {
  id: string;
  patientId: string;
  date: string;
  doctor: string;
  status: string;
  patient?: Patient;
}

export interface PrescriptionItem {
  id: string;
  inventoryId?: string | null;
  customMedicineName?: string;
  dosage: string;
  frequency?: string;
  kala?: string;
  anupana?: string;
  duration: string;
  quantity?: number;
  instructions?: string;
  inventory?: any; // To avoid deep inventory typing for now if not needed
}

export interface Prescription {
  id: string;
  visitId: string;
  pathya?: string;
  apathya?: string;
  vihara?: string;
  notes?: string;
  status: string;
  items: PrescriptionItem[];
  visit?: Visit;
}
