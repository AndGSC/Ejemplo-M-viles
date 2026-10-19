// Modelos de autenticación del cliente (reflejan las respuestas de la API)

export type UserRole = 'PATIENT' | 'ADMIN';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  patientId: string | null;
  fullName: string;
}

// Respuesta de login/registro: el JWT y los datos del usuario
export interface UserToken {
  token: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthenticatedUser;
}

export interface LoginCredentials {
  identifier: string; // Correo electrónico o cédula
  password: string;
}

export interface RegisterData {
  nationalId: string;
  birthDate: string; // AAAA-MM-DD
  email: string;
  password: string;
}
