// Reglas de validación del dominio (funciones puras, sin dependencias externas)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export type LoginIdentifier =
  | { type: 'email'; value: string }
  | { type: 'nationalId'; value: string };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return email.length <= 160 && EMAIL_REGEX.test(email);
}

// La cédula se guarda solo con dígitos: "1-1234-0567" → "112340567"
export function normalizeNationalId(nationalId: string): string {
  return nationalId.replace(/\D/g, '');
}

// Cédula física (9 dígitos) o DIMEX (11 a 12 dígitos)
export function isValidNationalId(nationalId: string): boolean {
  return /^\d{9,12}$/.test(nationalId);
}

// El usuario puede iniciar sesión con correo o con cédula: si tiene "@" es un correo
export function parseLoginIdentifier(rawIdentifier: string): LoginIdentifier | null {
  const identifier = rawIdentifier.trim();
  if (identifier.includes('@')) {
    const email = normalizeEmail(identifier);
    return isValidEmail(email) ? { type: 'email', value: email } : null;
  }
  const nationalId = normalizeNationalId(identifier);
  return isValidNationalId(nationalId) ? { type: 'nationalId', value: nationalId } : null;
}

// Política de contraseñas: mínimo 8 caracteres, una mayúscula, una minúscula y un número.
// bcrypt solo usa los primeros 72 bytes, por eso se limita la longitud máxima.
export function getPasswordPolicyError(password: string): string | null {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (Buffer.byteLength(password, 'utf8') > 72) return 'La contraseña es demasiado larga';
  if (!/[A-Z]/.test(password)) return 'La contraseña debe incluir al menos una mayúscula';
  if (!/[a-z]/.test(password)) return 'La contraseña debe incluir al menos una minúscula';
  if (!/\d/.test(password)) return 'La contraseña debe incluir al menos un número';
  return null;
}

// Fecha real con formato YYYY-MM-DD (rechaza, por ejemplo, 2024-02-31)
export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_REGEX.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

// Fecha actual en formato YYYY-MM-DD
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
