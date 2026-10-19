import { Allergy, Diagnosis, VitalSignsWithBmi, withBmi } from '../../domain/entities/MedicalHistory';
import { MedicalHistoryRepository } from '../../domain/repositories/MedicalHistoryRepository';

export interface MedicalHistory {
  diagnoses: Diagnosis[];
  allergies: Allergy[];
  vitalSigns: VitalSignsWithBmi[]; // La primera es la medición más reciente
}

// Cantidad de registros de constantes vitales que se muestran en la app
const VITAL_SIGNS_LIMIT = 10;

// Caso de uso: diagnósticos previos, alergias y constantes vitales básicas
export class GetMedicalHistory {
  constructor(private readonly medicalHistory: MedicalHistoryRepository) {}

  async execute(patientId: string): Promise<MedicalHistory> {
    const [diagnoses, allergies, vitalSigns] = await Promise.all([
      this.medicalHistory.findDiagnoses(patientId),
      this.medicalHistory.findAllergies(patientId),
      this.medicalHistory.findVitalSigns(patientId, VITAL_SIGNS_LIMIT),
    ]);
    return { diagnoses, allergies, vitalSigns: vitalSigns.map(withBmi) };
  }
}
