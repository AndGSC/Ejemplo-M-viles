import { Pool, types } from 'pg';

// Conversión de tipos de PostgreSQL a JavaScript:
// - DATE (1082) se deja como texto "YYYY-MM-DD" para evitar desfases de zona horaria.
// - NUMERIC (1700) llega como texto por defecto; se convierte a número.
types.setTypeParser(1082, (value) => value);
types.setTypeParser(1700, (value) => Number(value));

// Pool de conexiones reutilizables a la base de datos
export function createPool(databaseUrl: string): Pool {
  const pool = new Pool({ connectionString: databaseUrl, max: 10 });
  pool.on('error', (error) => console.error('[db] Error inesperado en una conexión inactiva', error));
  return pool;
}

// Verifica la conexión al iniciar, con reintentos por si la base de datos todavía está arrancando
export async function waitForDatabase(pool: Pool, retries = 10, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      if (attempt === retries) throw error;
      console.warn(`[db] Base de datos no disponible (intento ${attempt}/${retries}). Reintentando...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function isDatabaseHealthy(pool: Pool): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
