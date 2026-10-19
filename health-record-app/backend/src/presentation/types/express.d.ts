import { TokenPayload } from '../../domain/services/TokenProvider';

// Extiende el Request de Express para que el authMiddleware pueda adjuntar
// los datos del usuario autenticado en req.auth
declare global {
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

export {};
