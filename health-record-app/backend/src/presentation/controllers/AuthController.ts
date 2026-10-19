import { Request, Response } from 'express';
import { AuthenticateUser } from '../../use-cases/auth/AuthenticateUser';
import { GetCurrentUser } from '../../use-cases/auth/GetCurrentUser';
import { RegisterPatient } from '../../use-cases/auth/RegisterPatient';
import { getAuthenticatedUserId, readString } from '../http/requestHelpers';

// Controlador: traduce HTTP ↔ casos de uso. No contiene lógica de negocio.
// En Express 5 los errores de funciones async llegan solos al errorHandler.
export class AuthController {
  constructor(
    private readonly authenticateUser: AuthenticateUser,
    private readonly registerPatient: RegisterPatient,
    private readonly getCurrentUser: GetCurrentUser,
  ) {}

  // POST /api/auth/login  { identifier, password }
  login = async (req: Request, res: Response): Promise<void> => {
    const session = await this.authenticateUser.execute({
      identifier: readString(req.body, 'identifier'),
      password: readString(req.body, 'password'),
    });
    res.json(session);
  };

  // POST /api/auth/register  { nationalId, birthDate, email, password }
  register = async (req: Request, res: Response): Promise<void> => {
    const session = await this.registerPatient.execute({
      nationalId: readString(req.body, 'nationalId'),
      birthDate: readString(req.body, 'birthDate'),
      email: readString(req.body, 'email'),
      password: readString(req.body, 'password'),
    });
    res.status(201).json(session);
  };

  // GET /api/auth/me  (protegida)
  me = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.getCurrentUser.execute(getAuthenticatedUserId(req)));
  };
}
