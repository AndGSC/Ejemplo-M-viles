// Entidad de dominio: usuario que inicia sesión en la app.
// El dominio no sabe nada de PostgreSQL ni de Express: solo define la forma de los datos.

export type UserRole = 'PATIENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  patientId: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
}

// Usuario con su hash de contraseña: solo se usa dentro del flujo de autenticación
// y nunca se devuelve al cliente.
export interface UserWithCredentials extends User {
  passwordHash: string;
}

// Datos necesarios para crear un usuario nuevo
export interface NewUser {
  email: string;
  passwordHash: string;
  role: UserRole;
  patientId: string;
}
