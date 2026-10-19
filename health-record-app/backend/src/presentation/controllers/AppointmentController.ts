import { Request, Response } from 'express';
import { GetAppointments } from '../../use-cases/appointments/GetAppointments';
import { getAuthenticatedPatientId } from '../http/requestHelpers';

export class AppointmentController {
  constructor(private readonly getAppointments: GetAppointments) {}

  // GET /api/appointments → { upcoming, history }
  list = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.getAppointments.execute(getAuthenticatedPatientId(req)));
  };
}
