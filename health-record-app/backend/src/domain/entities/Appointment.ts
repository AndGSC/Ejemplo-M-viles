// Entidad de dominio: cita médica

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'MISSED';

export interface Appointment {
  id: string;
  scheduledAt: Date;
  specialty: string;
  doctorName: string;
  healthCenter: string;
  location: string | null;
  reason: string | null;
  status: AppointmentStatus;
  notes: string | null;
}

// Regla de negocio: una cita es "próxima" si sigue programada y todavía no ha pasado
export function isUpcoming(appointment: Appointment, now: Date): boolean {
  return appointment.status === 'SCHEDULED' && appointment.scheduledAt.getTime() >= now.getTime();
}
