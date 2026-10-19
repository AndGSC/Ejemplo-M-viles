import { Request, Response } from 'express';

// Endpoint público para verificar que la API y la base de datos responden
export class HealthController {
  constructor(private readonly checkDatabase: () => Promise<boolean>) {}

  // GET /api/health
  check = async (_req: Request, res: Response): Promise<void> => {
    const databaseUp = await this.checkDatabase();
    res.status(databaseUp ? 200 : 503).json({ status: databaseUp ? 'ok' : 'degraded', database: databaseUp ? 'up' : 'down' });
  };
}
