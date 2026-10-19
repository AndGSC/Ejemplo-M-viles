import { EmergencyContact, Patient } from '../entities/Patient';

export interface PatientRepository {
  findById(id: string): Promise<Patient | null>;
  findByNationalId(nationalId: string): Promise<Patient | null>;
  findEmergencyContacts(patientId: string): Promise<EmergencyContact[]>;
}
