import express from 'express';
import cors from 'cors';
import pino from 'pino';
import { z } from 'zod';
import { withClient } from './db';
 
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export function createServer() {
  const app = express();
  app.use(express.json());
  app.use(cors({ origin: '*'}));
  app.use((req, _res, next) => { (req as any).log = logger; next(); });

  app.get('/health/live', (_req, res) => res.json({ status: 'ok' }));
  app.get('/health/ready', (_req, res) => res.json({ status: 'ok' }));

  app.post('/courses/v1', async (req, res) => {
    const schema = z.object({ codigo: z.string(), titulo: z.string(), descricao: z.string().optional(), categoria_id: z.string().optional(), instrutor_id: z.string().uuid().optional(), duracao_estimada: z.number().int().positive().optional(), xp_oferecido: z.number().int().positive().optional(), nivel_dificuldade: z.string().optional(), pre_requisitos: z.array(z.string()).optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'validation_error', details: parsed.error.issues });
    try {
      await withClient(c => c.query(
        'insert into cursos (codigo, titulo, descricao, categoria_id, instrutor_id, duracao_estimada, xp_oferecido, nivel_dificuldade, ativo, pre_requisitos) values ($1,$2,$3,$4,$5,$6,$7,$8,true,$9)',
        [parsed.data.codigo, parsed.data.titulo, parsed.data.descricao || null, parsed.data.categoria_id || null, parsed.data.instrutor_id || null, parsed.data.duracao_estimada || null, parsed.data.xp_oferecido || null, parsed.data.nivel_dificuldade || null, parsed.data.pre_requisitos || []]
      ));
      res.status(201).json({ codigo: parsed.data.codigo });
    } catch (err:any) {
      if (err.code === '23505') return res.status(409).json({ error: 'duplicado' });
      logger.error({ err }, 'create_course_failed');
      res.status(500).json({ error: 'internal_error' });
    }
  });

  app.get('/courses/v1/:codigo', async (req, res) => {
    try {
      const row = await withClient(async c => {
        const r = await c.query('select codigo, titulo, descricao, categoria_id, instrutor_id, duracao_estimada, xp_oferecido, nivel_dificuldade, ativo, pre_requisitos from cursos where codigo=$1', [req.params.codigo]);
        return r.rows[0];
      });
      if (!row) return res.status(404).json({ error: 'nao_encontrado' });
      res.json(row);
    } catch (err:any) {
      logger.error({ err }, 'get_course_failed');
      res.status(500).json({ error: 'internal_error' });
    }
  });

  return app;
}