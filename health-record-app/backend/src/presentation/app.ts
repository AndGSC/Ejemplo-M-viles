import cors from 'cors';
import express, { Express, RequestHandler } from 'express';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { Controllers, createRouter } from './routes';

// Construye la aplicación Express (sin abrir el puerto: eso lo hace server.ts)
export function createApp(controllers: Controllers, requireAuth: RequestHandler): Express {
  const app = express();

  app.disable('x-powered-by'); // No revelar la tecnología del servidor
  app.use(cors()); // Permite llamadas desde la app en modo web durante el desarrollo
  app.use(express.json({ limit: '10kb' })); // Cuerpos JSON pequeños

  app.use('/api', createRouter(controllers, requireAuth));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
