// Entidades de dominio del historial clínico: diagnósticos, alergias y constantes vitales

export type DiagnosisStatus = 'ACTIVE' | 'CONTROLLED' | 'RESOLVED';
export type AllergySeverity = 'MILD' | 'MODERATE' | 'SEVERE';

export interface Diagnosis {
  id: string;
  code: string; // Código CIE-10
  name: string;
  diagnosedAt: string; // YYYY-MM-DD
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
  recordedAt: string; // YYYY-MM-DD
}

export interface VitalSigns {
  id: string;
  recordedAt: Date;
  systolicPressure: number;
  diastolicPressure: number;
  heartRate: number;
  temperatureC: number;
  weightKg: number;
  heightCm: number;
  oxygenSaturation: number;
  glucoseMgDl: number | null;
}

// Constantes vitales con el índice de masa corporal ya calculado
export interface VitalSignsWithBmi extends VitalSigns {
  bmi: number;
}

// Regla de negocio: IMC = peso (kg) / estatura (m)², redondeado a un decimal
export function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function withBmi(vitalSigns: VitalSigns): VitalSignsWithBmi {
  return { ...vitalSigns, bmi: calculateBmi(vitalSigns.weightKg, vitalSigns.heightCm) };
}
