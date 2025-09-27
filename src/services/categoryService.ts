import {
  listCategories,
  getCategoryByCode,
  insertCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CategoryCreate,
  type CategoryUpdate
} from '../repositories/categoryRepository.js';
import { withClient } from '../db.js';

export async function getCategories(): Promise<Category[]> {
  return listCategories();
}

export async function getCategoryById(codigo: string): Promise<Category | null> {
  const category = await getCategoryByCode(codigo);
  return category ?? null;
}

export async function createCategory(data: CategoryCreate): Promise<Category | null> {
  const existing = await getCategoryByCode(data.codigo);
  if (existing) {
    return null; // categoria já existe
  }
  try {
    await insertCategory(data);
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === '23505') {
      return null; // duplicação
    }
    throw err;
  }
  const created = await getCategoryByCode(data.codigo);
  return created;
}

export async function updateCategoryById(codigo: string, data: CategoryUpdate): Promise<Category | null> {
  const existing = await getCategoryByCode(codigo);
  if (!existing) {
    return null; // não encontrada
  }
  await updateCategory(codigo, data);
  const updated = await getCategoryByCode(codigo);
  return updated;
}

export async function deleteCategoryById(codigo: string): Promise<{ success: boolean; error?: string }> {
  const existing = await getCategoryByCode(codigo);
  if (!existing) {
    return { success: false, error: 'categoria_nao_encontrada' };
  }

  const cursosAssociados = await withClient(async c => {
    const r = await c.query(
      'SELECT COUNT(*) as count FROM course_service.cursos WHERE categoria_id = $1',
      [codigo]
    );
    return parseInt(r.rows[0].count);
  });

  if (cursosAssociados > 0) {
    return { success: false, error: 'categoria_possui_cursos' };
  }

  try {
    await deleteCategory(codigo);
    return { success: true };
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === '23503') {
      return { success: false, error: 'categoria_possui_cursos' };
    }
    throw err;
  }
}
