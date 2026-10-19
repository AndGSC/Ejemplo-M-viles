import { loadConfig } from './infrastructure/config/env';
import { buildContainer } from './infrastructure/container';
import { createPool, waitForDatabase } from './infrastructure/database/postgres';
import { createApp } from './presentation/app';

// Punto de entrada: carga la configuración, conecta la BD, arma las dependencias y abre el puerto
async function main(): Promise<void> {
  const config = loadConfig();
  const pool = createPool(config.databaseUrl);
  await waitForDatabase(pool);
  console.log('[db] Conexión a PostgreSQL establecida');

  const { controllers, requireAuth } = buildContainer(config, pool);
  const app = createApp(controllers, requireAuth);

  const server = app.listen(config.port, () => {
    console.log(`[api] Servidor escuchando en http://localhost:${config.port}/api`);
  });

  // Cierre ordenado (docker compose stop envía SIGTERM)
  const shutdown = (signal: string) => {
    console.log(`[api] ${signal} recibido. Cerrando...`);
    server.close(() => {
      pool.end().finally(() => process.exit(0));
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error) => {
  console.error('[api] No se pudo iniciar el servidor:', error instanceof Error ? error.message : error);
  process.exit(1);
});
