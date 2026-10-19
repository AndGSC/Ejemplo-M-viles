import { RequestHandler, Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { AuthController } from '../controllers/AuthController';
import { HealthController } from '../controllers/HealthController';
import { MedicalHistoryController } from '../controllers/MedicalHistoryController';
import { PatientController } from '../controllers/PatientController';
import { PrescriptionController } from '../controllers/PrescriptionController';

export interface Controllers {
  health: HealthController;
  auth: AuthController;
  patients: PatientController;
  appointments: AppointmentController;
  prescriptions: PrescriptionController;
  medicalHistory: MedicalHistoryController;
}

// Rutas REST de la API (todas bajo el prefijo /api)
export function createRouter(controllers: Controllers, requireAuth: RequestHandler): Router {
  const router = Router();

  // --- Rutas públicas ---
  router.get('/health', controllers.health.check);
  router.post('/auth/login', controllers.auth.login);
  router.post('/auth/register', controllers.auth.register);

  // --- Rutas protegidas: requieren "Authorization: Bearer <token>" ---
  router.get('/auth/me', requireAuth, controllers.auth.me);
  router.get('/patients/me', requireAuth, controllers.patients.profile);
  router.get('/patients/me/summary', requireAuth, controllers.patients.summary);
  router.get('/appointments', requireAuth, controllers.appointments.list);
  router.get('/prescriptions/active', requireAuth, controllers.prescriptions.active);
  router.get('/medical-history', requireAuth, controllers.medicalHistory.get);

  return router;
}
