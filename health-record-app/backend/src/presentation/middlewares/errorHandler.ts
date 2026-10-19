import { ErrorRequestHandler, RequestHandler } from 'express';
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../domain/errors/DomainErrors';

// Traduce cada error de dominio a su código HTTP
function statusFor(error: DomainError): number {
  if (error instanceof ValidationError) return 400;
  if (error instanceof UnauthorizedError) return 401;
  if (error instanceof ForbiddenError) return 403;
  if (error instanceof NotFoundError) return 404;
  if (error instanceof ConflictError) return 409;
  return 400;
}

// Ruta inexistente
export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Ruta no encontrada: ${req.method} ${req.path}` } });
};

// Manejador central de errores: respuestas con formato uniforme { error: { code, message } }
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof DomainError) {
    res.status(statusFor(error)).json({ error: { code: error.code, message: error.message } });
    return;
  }

  // JSON mal formado en el cuerpo de la petición (lo genera express.json())
  if (error?.type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'INVALID_JSON', message: 'El cuerpo de la petición no es un JSON válido' } });
    return;
  }

  // Error inesperado: se registra en consola, pero al cliente no se le exponen detalles internos
  console.error('[api] Error no controlado', error);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error interno en el servidor' } });
};
