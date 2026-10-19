import { UserRole } from '../entities/User';

// Información que viaja dentro del JWT. Nunca se incluyen datos sensibles (contraseñas, diagnósticos).
export interface TokenPayload {
  userId: string;
  patientId: string | null;
  role: UserRole;
}

// Contrato para emitir y verificar tokens (implementado con jsonwebtoken en infrastructure/)
export interface TokenProvider {
  readonly expiresIn: string;
  sign(payload: TokenPayload): string;
  // Lanza UnauthorizedError si el token es inválido o expiró
  verify(token: string): TokenPayload;
}
