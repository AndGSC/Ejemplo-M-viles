import { EmergencyContact, Patient, calculateAge, getFullName } from '../../domain/entities/Patient';
import { NotFoundError } from '../../domain/errors/DomainErrors';
import { PatientRepository } from '../../domain/repositories/PatientRepository';

export interface PatientProfile extends Patient {
  fullName: string;
  age: number;
  emergencyContacts: EmergencyContact[];
}

// Caso de uso: perfil del paciente con datos personales, tipo de sangre y contactos de emergencia
export class GetPatientProfile {
  constructor(
    private readonly patients: PatientRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(patientId: string): Promise<PatientProfile> {
    const [patient, emergencyContacts] = await Promise.all([
      this.patients.findById(patientId),
      this.patients.findEmergencyContacts(patientId),
    ]);
    if (!patient) throw new NotFoundError('No se encontró el expediente del paciente');

    return {
      ...patient,
      fullName: getFullName(patient),
      age: calculateAge(patient.birthDate, this.now()),
      emergencyContacts,
    };
  }
}
