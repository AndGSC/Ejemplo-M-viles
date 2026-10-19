import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { UserRole } from '../../domain/entities/User';
import { UnauthorizedError } from '../../domain/errors/DomainErrors';
import { TokenPayload, TokenProvider } from '../../domain/services/TokenProvider';

const ALGORITHM = 'HS256';
const ISSUER = 'health-record-api';
const VALID_ROLES: UserRole[] = ['PATIENT', 'ADMIN'];

// Implementación de tokens con jsonwebtoken (firma HMAC SHA-256 con JWT_SECRET)
export class JwtService implements TokenProvider {
  constructor(
    private readonly secret: string,
    readonly expiresIn: string,
  ) {}

  sign(payload: TokenPayload): string {
    return jwt.sign({ patientId: payload.patientId, role: payload.role }, this.secret, {
      subject: payload.userId, // claim estándar "sub": identificador del usuario
      algorithm: ALGORITHM,
      issuer: ISSUER,
      expiresIn: this.expiresIn as SignOptions['expiresIn'],
    });
  }

  verify(token: string): TokenPayload {
    let decoded: string | JwtPayload;
    try {
      // Se fija el algoritmo esperado para impedir tokens firmados con "none" u otro algoritmo
      decoded = jwt.verify(token, this.secret, { algorithms: [ALGORITHM], issuer: ISSUER });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('La sesión expiró. Inicia sesión de nuevo.');
      }
      throw new UnauthorizedError('Token inválido');
    }

    if (typeof decoded === 'string' || !decoded.sub || !VALID_ROLES.includes(decoded.role)) {
      throw new UnauthorizedError('Token inválido');
    }
    return {
      userId: decoded.sub,
      patientId: typeof decoded.patientId === 'string' ? decoded.patientId : null,
      role: decoded.role,
    };
  }
}
