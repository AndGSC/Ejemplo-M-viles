import { PatientAppointments } from '../models/Appointment';
import { AuthenticatedUser, LoginCredentials, RegisterData, UserToken } from '../models/Auth';
import { MedicalHistory } from '../models/MedicalHistory';
import { HomeSummary, PatientProfile } from '../models/Patient';
import { Prescription } from '../models/Prescription';

// Interfaces (contratos) que la capa de datos implementa.
// La presentación depende de estos contratos, no de Axios ni de URLs.

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<UserToken>;
  register(data: RegisterData): Promise<UserToken>;
  getCurrentUser(): Promise<AuthenticatedUser>;
}

export interface PatientRepository {
  getProfile(): Promise<PatientProfile>;
  getHomeSummary(): Promise<HomeSummary>;
}

export interface AppointmentRepository {
  getAppointments(): Promise<PatientAppointments>;
}

export interface PrescriptionRepository {
  getActivePrescriptions(): Promise<Prescription[]>;
}

export interface MedicalHistoryRepository {
  getMedicalHistory(): Promise<MedicalHistory>;
}
