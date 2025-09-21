import { withClient } from '../db.js';

export interface Category {
  codigo: string;
  nome: string;
  descricao?: string | null;
  departamento_codigo?: string | null;
  cor_hex?: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface CategoryCreate {
  codigo: string;
  nome: string;
  descricao?: string;
  departamento_codigo?: string;
  cor_hex?: string;
}

export interface CategoryUpdate {
  nome?: string;
  descricao?: string;
  departamento_codigo?: string;
  cor_hex?: string;
}

export async function listCategories(): Promise<Category[]> {
  return withClient(async c => {
    const r = await c.query(`
      SELECT codigo, nome, descricao, departamento_codigo, cor_hex, criado_em, atualizado_em 
      FROM course_service.categorias 
      ORDER BY nome
    `);
    return r.rows;
  });
}

export async function getCategoryByCode(codigo: string): Promise<Category | null> {
  return withClient(async c => {
    const r = await c.query(`
      SELECT codigo, nome, descricao, departamento_codigo, cor_hex, criado_em, atualizado_em 
      FROM course_service.categorias 
      WHERE codigo = $1
    `, [codigo]);
    return r.rows[0] || null;
  });
}

export async function insertCategory(data: CategoryCreate): Promise<void> {
  await withClient(async c => {
    await c.query(`
      INSERT INTO course_service.categorias (codigo, nome, descricao, departamento_codigo, cor_hex) 
      VALUES ($1, $2, $3, $4, $5)
    `, [
      data.codigo,
      data.nome,
      data.descricao || null,
      data.departamento_codigo || null,
      data.cor_hex || null
    ]);
  });
}

export async function updateCategory(codigo: string, data: CategoryUpdate): Promise<void> {
  const fields: string[] = [];
  const values: (string | null)[] = [];
  let paramIndex = 1;

  if (data.nome !== undefined) {
    fields.push(`nome = $${paramIndex++}`);
    values.push(data.nome);
  }
  if (data.descricao !== undefined) {
    fields.push(`descricao = $${paramIndex++}`);
    values.push(data.descricao || null);
  }
  if (data.departamento_codigo !== undefined) {
    fields.push(`departamento_codigo = $${paramIndex++}`);
    values.push(data.departamento_codigo || null);
  }
  if (data.cor_hex !== undefined) {
    fields.push(`cor_hex = $${paramIndex++}`);
    values.push(data.cor_hex || null);
  }

  if (fields.length === 0) return;

  fields.push(`atualizado_em = now()`);
  values.push(codigo);

  await withClient(async c => {
    await c.query(`
      UPDATE course_service.categorias 
      SET ${fields.join(', ')} 
      WHERE codigo = $${paramIndex}
    `, values);
  });
}

export async function deleteCategory(codigo: string): Promise<void> {
  await withClient(async c => {
    await c.query('DELETE FROM course_service.categorias WHERE codigo = $1', [codigo]);
  });
}
