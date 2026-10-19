// Errores de dominio. La capa de presentación los traduce a códigos HTTP;
// el dominio no conoce HTTP, solo expresa QUÉ salió mal.

export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

// Datos de entrada inválidos (formato, campos faltantes)
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
}

// Credenciales incorrectas o token inválido / expirado
export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
}

// Usuario autenticado pero sin permiso para el recurso
export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';
}

// El recurso solicitado no existe
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
}

// Conflicto con el estado actual (ej. correo ya registrado)
export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
}
