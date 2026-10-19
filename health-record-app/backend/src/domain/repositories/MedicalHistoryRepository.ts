import { Allergy, Diagnosis, VitalSigns } from '../entities/MedicalHistory';

export interface MedicalHistoryRepository {
  findDiagnoses(patientId: string): Promise<Diagnosis[]>;
  findAllergies(patientId: string): Promise<Allergy[]>;
  // Constantes vitales, las más recientes primero
  findVitalSigns(patientId: string, limit: number): Promise<VitalSigns[]>;
}
