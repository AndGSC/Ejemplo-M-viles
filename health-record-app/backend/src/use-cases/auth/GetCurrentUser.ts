import { getFullName } from '../../domain/entities/Patient';
import { UnauthorizedError } from '../../domain/errors/DomainErrors';
import { PatientRepository } from '../../domain/repositories/PatientRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { AuthenticatedUser, toAuthenticatedUser } from './AuthSession';

// Caso de uso: obtener el usuario dueño del token (la app lo usa para validar la sesión guardada)
export class GetCurrentUser {
  constructor(
    private readonly users: UserRepository,
    private readonly patients: PatientRepository,
  ) {}

  async execute(userId: string): Promise<AuthenticatedUser> {
    const user = await this.users.findById(userId);
    // Token válido pero el usuario ya no existe: se trata como sesión inválida
    if (!user) throw new UnauthorizedError('La sesión ya no es válida');

    const patient = user.patientId ? await this.patients.findById(user.patientId) : null;
    return toAuthenticatedUser(user, patient ? getFullName(patient) : user.email);
  }
}
