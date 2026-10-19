import { Request, Response } from 'express';
import { GetHomeSummary } from '../../use-cases/patients/GetHomeSummary';
import { GetPatientProfile } from '../../use-cases/patients/GetPatientProfile';
import { getAuthenticatedPatientId } from '../http/requestHelpers';

export class PatientController {
  constructor(
    private readonly getPatientProfile: GetPatientProfile,
    private readonly getHomeSummary: GetHomeSummary,
  ) {}

  // GET /api/patients/me
  profile = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.getPatientProfile.execute(getAuthenticatedPatientId(req)));
  };

  // GET /api/patients/me/summary
  summary = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.getHomeSummary.execute(getAuthenticatedPatientId(req)));
  };
}
