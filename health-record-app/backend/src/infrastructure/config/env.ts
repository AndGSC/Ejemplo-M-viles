import 'dotenv/config'; // Carga un archivo .env local si existe (en Docker las variables llegan desde docker-compose)

export interface AppConfig {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta la variable de entorno obligatoria ${name}`);
  return value;
}

// Lee y valida la configuración al arrancar: si falta algo, la API no inicia
export function loadConfig(): AppConfig {
  const jwtSecret = requireEnv('JWT_SECRET');
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  }

  const jwtExpiresIn = process.env.JWT_EXPIRES_IN?.trim() || '2h';
  if (!/^\d+[smhd]$/.test(jwtExpiresIn)) {
    throw new Error('JWT_EXPIRES_IN debe tener un formato como 15m, 2h o 7d');
  }

  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port <= 0) throw new Error('PORT debe ser un número entero positivo');

  return { port, databaseUrl: requireEnv('DATABASE_URL'), jwtSecret, jwtExpiresIn };
}
