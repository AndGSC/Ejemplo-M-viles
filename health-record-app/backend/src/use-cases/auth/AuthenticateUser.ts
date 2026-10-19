import { getFullName } from '../../domain/entities/Patient';
import { UserWithCredentials } from '../../domain/entities/User';
import { UnauthorizedError, ValidationError } from '../../domain/errors/DomainErrors';
import { PatientRepository } from '../../domain/repositories/PatientRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { PasswordHasher } from '../../domain/services/PasswordHasher';
import { TokenProvider } from '../../domain/services/TokenProvider';
import { parseLoginIdentifier } from '../../domain/validation/validators';
import { AuthSession, createAuthSession } from './AuthSession';

export interface AuthenticateUserInput {
  identifier: string; // Correo electrónico o cédula
  password: string;
}

// Mensaje genérico: no revela si falló el usuario o la contraseña (evita enumerar cuentas)
const INVALID_CREDENTIALS = 'Credenciales inválidas';

// Caso de uso: iniciar sesión con correo o cédula y contraseña
export class AuthenticateUser {
  private timingProtectionHash: string | null = null;

  constructor(
    private readonly users: UserRepository,
    private readonly patients: PatientRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenProvider,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(input: AuthenticateUserInput): Promise<AuthSession> {
    if (!input.identifier?.trim() || !input.password) {
      throw new ValidationError('Ingresa tu correo o cédula y tu contraseña');
    }

    const identifier = parseLoginIdentifier(input.identifier);
    if (!identifier) {
      throw new ValidationError('Ingresa un correo válido o una cédula de 9 a 12 dígitos');
    }

    const user =
      identifier.type === 'email'
        ? await this.users.findByEmail(identifier.value)
        : await this.users.findByNationalId(identifier.value);

    const passwordMatches = await this.verifyPassword(input.password, user);
    if (!user || !passwordMatches) {
      throw new UnauthorizedError(INVALID_CREDENTIALS);
    }

    await this.users.updateLastLogin(user.id, this.now());

    const patient = user.patientId ? await this.patients.findById(user.patientId) : null;
    const fullName = patient ? getFullName(patient) : user.email;
    return createAuthSession(user, fullName, this.tokens);
  }

  // Si el usuario no existe igual se ejecuta bcrypt, para que la respuesta tarde lo mismo
  // y un atacante no pueda deducir qué cuentas existen midiendo el tiempo.
  private async verifyPassword(password: string, user: UserWithCredentials | null): Promise<boolean> {
    if (user) return this.hasher.compare(password, user.passwordHash);
    this.timingProtectionHash ??= await this.hasher.hash('timing-attack-protection');
    await this.hasher.compare(password, this.timingProtectionHash);
    return false;
  }
}
