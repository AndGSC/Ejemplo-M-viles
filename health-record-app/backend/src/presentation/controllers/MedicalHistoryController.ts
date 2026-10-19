import { Request, Response } from 'express';
import { GetMedicalHistory } from '../../use-cases/medical-history/GetMedicalHistory';
import { getAuthenticatedPatientId } from '../http/requestHelpers';

export class MedicalHistoryController {
  constructor(private readonly getMedicalHistory: GetMedicalHistory) {}

  // GET /api/medical-history → { diagnoses, allergies, vitalSigns }
  get = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.getMedicalHistory.execute(getAuthenticatedPatientId(req)));
  };
}
