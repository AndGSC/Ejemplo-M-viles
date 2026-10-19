export type DiagnosisStatus = 'ACTIVE' | 'CONTROLLED' | 'RESOLVED';
export type AllergySeverity = 'MILD' | 'MODERATE' | 'SEVERE';

export interface Diagnosis {
  id: string;
  code: string; // CIE-10
  name: string;
  diagnosedAt: string; // AAAA-MM-DD
  doctorName: string;
  healthCenter: string;
  status: DiagnosisStatus;
  notes: string | null;
}

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: AllergySeverity;
  recordedAt: string;
}

export interface VitalSigns {
  id: string;
  recordedAt: string; // ISO 8601
  systolicPressure: number;
  diastolicPressure: number;
  heartRate: number;
  temperatureC: number;
  weightKg: number;
  heightCm: number;
  oxygenSaturation: number;
  glucoseMgDl: number | null;
  bmi: number;
}

// GET /medical-history
export interface MedicalHistory {
  diagnoses: Diagnosis[];
  allergies: Allergy[];
  vitalSigns: VitalSigns[];
}
