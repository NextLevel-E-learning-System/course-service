import { z } from 'zod';

export const niveisDefinidos = ['Iniciante', 'Intermediário', 'Avançado'] as const;

export const createCourseSchema = z.object({
  codigo: z.string(),
  titulo: z.string(),
  descricao: z.string().optional(),
  categoria_id: z.string().optional(),
  instrutor_id: z.string().uuid().optional(),
  duracao_estimada: z.number().int().min(0).optional(),
  xp_oferecido: z.number().int().min(0).optional(),
  nivel_dificuldade: z.enum(niveisDefinidos).optional(),
  pre_requisitos: z.array(z.string()).optional()
});

export const updateCourseSchema = z.object({
  titulo: z.string().optional(),
  descricao: z.string().optional(),
  categoria_id: z.string().optional(),
  instrutor_id: z.string().uuid().optional(),
  duracao_estimada: z.number().int().min(0).optional(),
  xp_oferecido: z.number().int().min(0).optional(),
  nivel_dificuldade: z.enum(niveisDefinidos).optional(),
  pre_requisitos: z.array(z.string()).optional()
});

// Schemas de validação para categorias
export const createCategorySchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  departamento_codigo: z.string().min(1, 'Código do departamento é obrigatório'),
  cor_hex: z.string().regex(/^#?[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal').optional()
});

export const updateCategorySchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  descricao: z.string().optional(),
  departamento_codigo: z.string().min(1, 'Código do departamento é obrigatório').optional(),
  cor_hex: z.string().regex(/^#?[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal').optional()
});

export const categoryParamsSchema = z.object({
  codigo: z.string().min(1, 'Código da categoria é obrigatório')
});
