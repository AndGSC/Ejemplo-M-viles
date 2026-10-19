import { Request } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../domain/errors/DomainErrors';

// Obtiene el paciente del token. Así cada paciente solo puede ver SU propio expediente:
// el id nunca se toma de la URL ni del cuerpo de la petición.
export function getAuthenticatedPatientId(req: Request): string {
  if (!req.auth) throw new UnauthorizedError('No autenticado');
  if (!req.auth.patientId) throw new ForbiddenError('Este usuario no tiene un expediente de paciente asociado');
  return req.auth.patientId;
}

export function getAuthenticatedUserId(req: Request): string {
  if (!req.auth) throw new UnauthorizedError('No autenticado');
  return req.auth.userId;
}

// Lee un campo de texto del cuerpo JSON (devuelve '' si no viene o no es texto)
export function readString(body: unknown, field: string): string {
  if (typeof body !== 'object' || body === null) return '';
  const value = (body as Record<string, unknown>)[field];
  return typeof value === 'string' ? value : '';
}
