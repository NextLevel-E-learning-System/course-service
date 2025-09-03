import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { loadOpenApi } from './config/openapi.js';
import { logger } from './config/logger.js';
import { courseRouter } from './routes/courseRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createServer() {
  const app = express();
  app.use(express.json());
  app.use(cors({ origin: '*' }));
  app.use((req, _res, next) => { (req as any).log = logger; next(); });
  const openapiSpec = loadOpenApi('Course Service API');
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
  app.use('/courses/v1', courseRouter);
  app.use(errorHandler);
  return app;
}