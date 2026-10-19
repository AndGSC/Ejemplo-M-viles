import { Request, Response } from 'express';
import { GetActivePrescriptions } from '../../use-cases/prescriptions/GetActivePrescriptions';
import { getAuthenticatedPatientId } from '../http/requestHelpers';

export class PrescriptionController {
  constructor(private readonly getActivePrescriptions: GetActivePrescriptions) {}

  // GET /api/prescriptions/active
  active = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.getActivePrescriptions.execute(getAuthenticatedPatientId(req)));
  };
}
