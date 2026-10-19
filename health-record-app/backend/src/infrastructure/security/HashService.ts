import bcrypt from 'bcryptjs';
import { PasswordHasher } from '../../domain/services/PasswordHasher';

// Implementación con bcrypt: genera un salt aleatorio por contraseña y aplica un costo configurable.
// Costo 10 = 2^10 rondas; cada +1 duplica el tiempo y dificulta los ataques de fuerza bruta.
export class HashService implements PasswordHasher {
  constructor(private readonly saltRounds = 10) {}

  hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  }
}
