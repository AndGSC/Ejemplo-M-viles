import { Appointment } from '../entities/Appointment';

export interface AppointmentRepository {
  // Todas las citas del paciente ordenadas por fecha ascendente
  findByPatientId(patientId: string): Promise<Appointment[]>;
}
