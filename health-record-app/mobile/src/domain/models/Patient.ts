import { Appointment } from './Appointment';
import { AllergySeverity, VitalSigns } from './MedicalHistory';

export type Sex = 'FEMALE' | 'MALE';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface EmergencyContact {
  id: string;
  fullName: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

// Perfil del paciente (GET /patients/me)
export interface PatientProfile {
  id: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: string; // AAAA-MM-DD
  age: number;
  sex: Sex;
  bloodType: BloodType;
  phone: string | null;
  address: string | null;
  healthArea: string | null;
  emergencyContacts: EmergencyContact[];
}

// Resumen para la pantalla de inicio (GET /patients/me/summary)
export interface HomeSummary {
  patient: {
    firstName: string;
    fullName: string;
    nationalId: string;
    age: number;
    bloodType: BloodType;
  };
  nextAppointment: Appointment | null;
  upcomingAppointmentsCount: number;
  activePrescriptionsCount: number;
  readyForPickupCount: number;
  allergies: { allergen: string; severity: AllergySeverity }[];
  latestVitalSigns: VitalSigns | null;
}
