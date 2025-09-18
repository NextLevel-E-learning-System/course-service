import express from 'express';
import cors from 'cors';
import { loadOpenApi } from './config/openapi.js';
import { logger } from './config/logger.js';
import { courseRouter } from './routes/courseRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import staticFilesMiddleware from './middleware/staticFiles.js';

export function createServer() {
  const app = express();
  // Aumentar limite para uploads de arquivos (50MB)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cors({ origin: '*' }));
  app.use((req, _res, next) => { (req as any).log = logger; next(); });
  
  // Middleware para servir arquivos estáticos (apenas em modo local)
  app.use(staticFilesMiddleware);
  
  app.get('/openapi.json', async (_req, res) => {
    try {
      const openapiSpec = await loadOpenApi('Course Service API');
      res.json(openapiSpec);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load OpenAPI spec' });
    }
  });
  app.use('/courses/v1', courseRouter);
  app.use(errorHandler);
  return app;
}