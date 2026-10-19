import { Appointment, isUpcoming } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';

export interface PatientAppointments {
  upcoming: Appointment[]; // De la más cercana a la más lejana
  history: Appointment[]; // De la más reciente a la más antigua
}

// Caso de uso: citas programadas e historial de atenciones
export class GetAppointments {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(patientId: string): Promise<PatientAppointments> {
    const all = await this.appointments.findByPatientId(patientId);
    const now = this.now();

    const upcoming = all.filter((appointment) => isUpcoming(appointment, now));
    const history = all.filter((appointment) => !isUpcoming(appointment, now)).reverse();
    return { upcoming, history };
  }
}
