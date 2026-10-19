import { User, UserRole } from '../../domain/entities/User';
import { TokenProvider } from '../../domain/services/TokenProvider';

// Datos públicos del usuario autenticado (sin hash de contraseña)
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  patientId: string | null;
  fullName: string;
}

// Respuesta de login y registro
export interface AuthSession {
  token: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthenticatedUser;
}

export function toAuthenticatedUser(user: User, fullName: string): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    patientId: user.patientId,
    fullName,
  };
}

// Firma el JWT con el identificador del usuario, su paciente y su rol
export function createAuthSession(user: User, fullName: string, tokens: TokenProvider): AuthSession {
  const token = tokens.sign({ userId: user.id, patientId: user.patientId, role: user.role });
  return {
    token,
    tokenType: 'Bearer',
    expiresIn: tokens.expiresIn,
    user: toAuthenticatedUser(user, fullName),
  };
}
