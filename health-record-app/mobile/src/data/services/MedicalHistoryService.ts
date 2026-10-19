import { MedicalHistory } from '../../domain/models/MedicalHistory';
import { MedicalHistoryRepository } from '../../domain/repositories';
import { apiClient } from '../api/apiClient';

export class MedicalHistoryService implements MedicalHistoryRepository {
  async getMedicalHistory(): Promise<MedicalHistory> {
    const { data } = await apiClient.get<MedicalHistory>('/medical-history');
    return data;
  }
}
