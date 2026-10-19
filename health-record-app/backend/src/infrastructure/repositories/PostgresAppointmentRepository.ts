import { Pool } from 'pg';
import { Appointment, AppointmentStatus } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';

interface AppointmentRow {
  id: string;
  scheduled_at: Date;
  specialty: string;
  doctor_name: string;
  health_center: string;
  location: string | null;
  reason: string | null;
  status: AppointmentStatus;
  notes: string | null;
}

export class PostgresAppointmentRepository implements AppointmentRepository {
  constructor(private readonly pool: Pool) {}

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    const { rows } = await this.pool.query<AppointmentRow>(
      `SELECT id, scheduled_at, specialty, doctor_name, health_center, location, reason, status, notes
         FROM appointments
        WHERE patient_id = $1
        ORDER BY scheduled_at ASC`,
      [patientId],
    );
    return rows.map((row) => ({
      id: row.id,
      scheduledAt: row.scheduled_at,
      specialty: row.specialty,
      doctorName: row.doctor_name,
      healthCenter: row.health_center,
      location: row.location,
      reason: row.reason,
      status: row.status,
      notes: row.notes,
    }));
  }
}
