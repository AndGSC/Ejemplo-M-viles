import { Pool } from 'pg';
import { AppConfig } from './config/env';
import { isDatabaseHealthy } from './database/postgres';
import { PostgresAppointmentRepository } from './repositories/PostgresAppointmentRepository';
import { PostgresMedicalHistoryRepository } from './repositories/PostgresMedicalHistoryRepository';
import { PostgresPatientRepository } from './repositories/PostgresPatientRepository';
import { PostgresPrescriptionRepository } from './repositories/PostgresPrescriptionRepository';
import { PostgresUserRepository } from './repositories/PostgresUserRepository';
import { HashService } from './security/HashService';
import { JwtService } from './security/JwtService';
import { GetAppointments } from '../use-cases/appointments/GetAppointments';
import { AuthenticateUser } from '../use-cases/auth/AuthenticateUser';
import { GetCurrentUser } from '../use-cases/auth/GetCurrentUser';
import { RegisterPatient } from '../use-cases/auth/RegisterPatient';
import { GetMedicalHistory } from '../use-cases/medical-history/GetMedicalHistory';
import { GetHomeSummary } from '../use-cases/patients/GetHomeSummary';
import { GetPatientProfile } from '../use-cases/patients/GetPatientProfile';
import { GetActivePrescriptions } from '../use-cases/prescriptions/GetActivePrescriptions';
import { AppointmentController } from '../presentation/controllers/AppointmentController';
import { AuthController } from '../presentation/controllers/AuthController';
import { HealthController } from '../presentation/controllers/HealthController';
import { MedicalHistoryController } from '../presentation/controllers/MedicalHistoryController';
import { PatientController } from '../presentation/controllers/PatientController';
import { PrescriptionController } from '../presentation/controllers/PrescriptionController';
import { createAuthMiddleware } from '../presentation/middlewares/authMiddleware';

/**
 * Raíz de composición (inyección de dependencias manual).
 * Es el ÚNICO lugar que conoce las implementaciones concretas: aquí se conectan
 * repositorios → casos de uso → controladores. El resto del código depende de interfaces.
 */
export function buildContainer(config: AppConfig, pool: Pool) {
  // Infraestructura
  const hasher = new HashService();
  const tokens = new JwtService(config.jwtSecret, config.jwtExpiresIn);
  const users = new PostgresUserRepository(pool);
  const patients = new PostgresPatientRepository(pool);
  const appointments = new PostgresAppointmentRepository(pool);
  const prescriptions = new PostgresPrescriptionRepository(pool);
  const medicalHistory = new PostgresMedicalHistoryRepository(pool);

  // Casos de uso
  const authenticateUser = new AuthenticateUser(users, patients, hasher, tokens);
  const registerPatient = new RegisterPatient(users, patients, hasher, tokens);
  const getCurrentUser = new GetCurrentUser(users, patients);
  const getPatientProfile = new GetPatientProfile(patients);
  const getHomeSummary = new GetHomeSummary(patients, appointments, prescriptions, medicalHistory);
  const getAppointments = new GetAppointments(appointments);
  const getActivePrescriptions = new GetActivePrescriptions(prescriptions);
  const getMedicalHistory = new GetMedicalHistory(medicalHistory);

  // Presentación
  return {
    requireAuth: createAuthMiddleware(tokens),
    controllers: {
      health: new HealthController(() => isDatabaseHealthy(pool)),
      auth: new AuthController(authenticateUser, registerPatient, getCurrentUser),
      patients: new PatientController(getPatientProfile, getHomeSummary),
      appointments: new AppointmentController(getAppointments),
      prescriptions: new PrescriptionController(getActivePrescriptions),
      medicalHistory: new MedicalHistoryController(getMedicalHistory),
    },
  };
}
