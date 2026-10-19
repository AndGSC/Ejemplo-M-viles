import { NextFunction, Request, RequestHandler, Response } from 'express';
import { UnauthorizedError } from '../../domain/errors/DomainErrors';
import { TokenProvider } from '../../domain/services/TokenProvider';

/**
 * Middleware de autenticación JWT.
 * 1. Lee la cabecera "Authorization: Bearer <token>".
 * 2. Verifica la firma y la expiración del token.
 * 3. Si es válido, guarda el payload en req.auth y deja pasar la petición.
 * Si falta o es inválido, responde 401 a través del manejador de errores.
 */
export function createAuthMiddleware(tokens: TokenProvider): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header) {
      return next(new UnauthorizedError('Falta el token de autenticación'));
    }

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return next(new UnauthorizedError('Formato de autorización inválido. Use: Bearer <token>'));
    }

    try {
      req.auth = tokens.verify(token);
      next();
    } catch (error) {
      next(error);
    }
  };
}
