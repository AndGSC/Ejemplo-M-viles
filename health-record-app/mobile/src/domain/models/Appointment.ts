export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'MISSED';

export interface Appointment {
  id: string;
  scheduledAt: string; // Fecha y hora ISO 8601 (UTC)
  specialty: string;
  doctorName: string;
  healthCenter: string;
  location: string | null;
  reason: string | null;
  status: AppointmentStatus;
  notes: string | null;
}

// GET /appointments
export interface PatientAppointments {
  upcoming: Appointment[];
  history: Appointment[];
}
