import { Prescription } from '../entities/Prescription';

export interface PrescriptionRepository {
  // Todas las recetas del paciente, las más recientes primero
  findByPatientId(patientId: string): Promise<Prescription[]>;
}
