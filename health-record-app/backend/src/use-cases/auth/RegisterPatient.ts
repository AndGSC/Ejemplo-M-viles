import { getFullName } from '../../domain/entities/Patient';
import { ConflictError, NotFoundError, ValidationError } from '../../domain/errors/DomainErrors';
import { PatientRepository } from '../../domain/repositories/PatientRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { PasswordHasher } from '../../domain/services/PasswordHasher';
import { TokenProvider } from '../../domain/services/TokenProvider';
import {
  getPasswordPolicyError,
  isValidEmail,
  isValidIsoDate,
  isValidNationalId,
  normalizeEmail,
  normalizeNationalId,
} from '../../domain/validation/validators';
import { AuthSession, createAuthSession } from './AuthSession';

export interface RegisterPatientInput {
  nationalId: string;
  birthDate: string; // YYYY-MM-DD
  email: string;
  password: string;
}

/**
 * Caso de uso: crear la cuenta de acceso de un paciente.
 * Como en el EDUS, el expediente ya existe (lo crea el centro de salud); el paciente
 * solo crea su usuario demostrando que conoce su cédula y su fecha de nacimiento.
 */
export class RegisterPatient {
  constructor(
    private readonly users: UserRepository,
    private readonly patients: PatientRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenProvider,
  ) {}

  async execute(input: RegisterPatientInput): Promise<AuthSession> {
    const nationalId = normalizeNationalId(input.nationalId ?? '');
    const birthDate = (input.birthDate ?? '').trim();
    const email = normalizeEmail(input.email ?? '');
    const password = input.password ?? '';

    if (!isValidNationalId(nationalId)) throw new ValidationError('La cédula debe tener entre 9 y 12 dígitos');
    if (!isValidIsoDate(birthDate)) throw new ValidationError('La fecha de nacimiento debe tener el formato AAAA-MM-DD');
    if (!isValidEmail(email)) throw new ValidationError('El correo electrónico no es válido');
    const passwordError = getPasswordPolicyError(password);
    if (passwordError) throw new ValidationError(passwordError);

    const patient = await this.patients.findByNationalId(nationalId);
    if (!patient || patient.birthDate !== birthDate) {
      throw new NotFoundError('No encontramos un expediente con esa cédula y fecha de nacimiento');
    }

    if (await this.users.findByPatientId(patient.id)) {
      throw new ConflictError('Este expediente ya tiene una cuenta. Inicia sesión.');
    }
    if (await this.users.findByEmail(email)) {
      throw new ConflictError('El correo electrónico ya está registrado');
    }

    // La contraseña nunca se guarda en texto plano: solo su hash bcrypt
    const passwordHash = await this.hasher.hash(password);
    const user = await this.users.create({ email, passwordHash, role: 'PATIENT', patientId: patient.id });

    return createAuthSession(user, getFullName(patient), this.tokens);
  }
}
