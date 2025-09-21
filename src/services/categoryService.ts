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
import { HttpError } from '../utils/httpError.js';

export async function getCategories(): Promise<Category[]> {
  return listCategories();
}

export async function getCategoryById(codigo: string): Promise<Category> {
  const category = await getCategoryByCode(codigo);
  if (!category) {
    throw new HttpError(404, 'Categoria não encontrada');
  }
  return category;
}

export async function createCategory(data: CategoryCreate): Promise<{ codigo: string }> {
  try {
    // Validar se o código já existe
    const existing = await getCategoryByCode(data.codigo);
    if (existing) {
      throw new HttpError(409, 'Código de categoria já existe');
    }

    await insertCategory(data);
    return { codigo: data.codigo };
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === '23505') {
      throw new HttpError(409, 'Categoria já existe');
    }
    throw err;
  }
}

export async function updateCategoryById(codigo: string, data: CategoryUpdate): Promise<Category> {
  const existing = await getCategoryByCode(codigo);
  if (!existing) {
    throw new HttpError(404, 'Categoria não encontrada');
  }

  await updateCategory(codigo, data);
  return getCategoryById(codigo);
}

export async function deleteCategoryById(codigo: string): Promise<void> {
  const existing = await getCategoryByCode(codigo);
  if (!existing) {
    throw new HttpError(404, 'Categoria não encontrada');
  }

  const cursosAssociados = await withClient(async c => {
    const r = await c.query(
      'SELECT COUNT(*) as count FROM course_service.cursos WHERE categoria_id = $1',
      [codigo]
    );
    return parseInt(r.rows[0].count);
  });

  if (cursosAssociados > 0) {
    throw new HttpError(409, `Não é possível excluir categoria que possui ${cursosAssociados} curso(s) associado(s)`);
  }

  try {
    await deleteCategory(codigo);
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === '23503') {
      throw new HttpError(409, 'Não é possível excluir categoria que possui cursos associados');
    }
    throw err;
  }
}
