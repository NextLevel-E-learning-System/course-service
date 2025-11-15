import { Request, Response, NextFunction } from 'express';
import { 
  getCategories, 
  createCategory, 
  updateCategoryById, 
  deleteCategoryById 
} from '../services/categoryService.js';
import { 
  createCategorySchema, 
  updateCategorySchema, 
  categoryParamsSchema 
} from '../validation/courseSchemas.js';

export async function listCategoriesHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await getCategories();
    res.json({ items: categories, mensagem: 'Categorias listadas com sucesso' });
  } catch (error) {
    next(error);
  }
}

export async function createCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = createCategorySchema.parse(req.body);
    const categoria = await createCategory(validatedData);
    if (!categoria) {
      return res.status(409).json({ erro: 'categoria_ja_existe', mensagem: 'Já existe uma categoria com este código' });
    }
    res.status(201).json({ categoria, mensagem: 'Categoria criada com sucesso' });
  } catch (error) {
    next(error);
  }
}

export async function updateCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { codigo } = categoryParamsSchema.parse(req.params);
    const validatedData = updateCategorySchema.parse(req.body);
    const categoria = await updateCategoryById(codigo, validatedData);
    if (!categoria) {
      return res.status(404).json({ erro: 'categoria_nao_encontrada', mensagem: 'Categoria não encontrada' });
    }
    res.json({ categoria, mensagem: 'Categoria atualizada com sucesso' });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { codigo } = categoryParamsSchema.parse(req.params);
    const result = await deleteCategoryById(codigo);
    if (!result.success) {
      if (result.error === 'categoria_nao_encontrada') {
        return res.status(404).json({ erro: result.error, mensagem: 'Categoria não encontrada' });
      }
      if (result.error === 'categoria_possui_cursos') {
        return res.status(409).json({ erro: result.error, mensagem: 'Não é possível excluir categoria que possui cursos associados' });
      }
    }
    res.json({ mensagem: 'Categoria excluída com sucesso' });
  } catch (error) {
    next(error);
  }
}
