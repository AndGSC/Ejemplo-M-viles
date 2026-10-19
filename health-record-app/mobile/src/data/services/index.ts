import {
  AppointmentRepository,
  AuthRepository,
  MedicalHistoryRepository,
  PatientRepository,
  PrescriptionRepository,
} from '../../domain/repositories';
import { AppointmentService } from './AppointmentService';
import { AuthService } from './AuthService';
import { MedicalHistoryService } from './MedicalHistoryService';
import { PatientService } from './PatientService';
import { PrescriptionService } from './PrescriptionService';

// Instancias únicas expuestas con el tipo de su interfaz de dominio.
// Las pantallas usan estos objetos sin conocer los detalles HTTP.
export const authRepository: AuthRepository = new AuthService();
export const patientRepository: PatientRepository = new PatientService();
export const appointmentRepository: AppointmentRepository = new AppointmentService();
export const prescriptionRepository: PrescriptionRepository = new PrescriptionService();
export const medicalHistoryRepository: MedicalHistoryRepository = new MedicalHistoryService();
