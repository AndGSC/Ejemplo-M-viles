import { PatientAppointments } from '../../domain/models/Appointment';
import { AppointmentRepository } from '../../domain/repositories';
import { apiClient } from '../api/apiClient';

export class AppointmentService implements AppointmentRepository {
  async getAppointments(): Promise<PatientAppointments> {
    const { data } = await apiClient.get<PatientAppointments>('/appointments');
    return data;
  }
}
