import { HomeSummary, PatientProfile } from '../../domain/models/Patient';
import { PatientRepository } from '../../domain/repositories';
import { apiClient } from '../api/apiClient';

export class PatientService implements PatientRepository {
  async getProfile(): Promise<PatientProfile> {
    const { data } = await apiClient.get<PatientProfile>('/patients/me');
    return data;
  }

  async getHomeSummary(): Promise<HomeSummary> {
    const { data } = await apiClient.get<HomeSummary>('/patients/me/summary');
    return data;
  }
}
