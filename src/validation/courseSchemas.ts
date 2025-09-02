import { z } from 'zod';
export const createCourseSchema = z.object({
  codigo: z.string(),
  titulo: z.string(),
  descricao: z.string().optional(),
  categoria_id: z.string().optional(),
  instrutor_id: z.string().uuid().optional(),
  duracao_estimada: z.number().int().positive().optional(),
  xp_oferecido: z.number().int().positive().optional(),
  nivel_dificuldade: z.string().optional(),
  pre_requisitos: z.array(z.string()).optional()
});
