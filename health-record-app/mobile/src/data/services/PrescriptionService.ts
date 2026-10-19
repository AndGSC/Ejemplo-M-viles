import { Prescription } from '../../domain/models/Prescription';
import { PrescriptionRepository } from '../../domain/repositories';
import { apiClient } from '../api/apiClient';

export class PrescriptionService implements PrescriptionRepository {
  async getActivePrescriptions(): Promise<Prescription[]> {
    const { data } = await apiClient.get<Prescription[]>('/prescriptions/active');
    return data;
  }
}
