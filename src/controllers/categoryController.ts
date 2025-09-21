import { Request, Response, NextFunction } from 'express';
import { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategoryById, 
  deleteCategoryById 
} from '../services/categoryService.js';
import { 
  createCategorySchema, 
  updateCategorySchema, 
  categoryParamsSchema 
} from '../validation/courseSchemas.js';
import { HttpError } from '../utils/httpError.js';

interface AuthenticatedRequest extends Request {
  userRole?: string;
}

export async function listCategoriesHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

export async function getCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { codigo } = categoryParamsSchema.parse(req.params);
    const category = await getCategoryById(codigo);
    res.json(category);
  } catch (error) {
    next(error);
  }
}

export async function createCategoryHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'ADMIN') {
    return next(new HttpError(403, 'Acesso negado. Apenas administradores podem criar categorias.'));
  }

  try {
    const validatedData = createCategorySchema.parse(req.body);
    const result = await createCategory(validatedData);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateCategoryHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'ADMIN') {
    return next(new HttpError(403, 'Acesso negado. Apenas administradores podem atualizar categorias.'));
  }

  try {
    const { codigo } = categoryParamsSchema.parse(req.params);
    const validatedData = updateCategorySchema.parse(req.body);
    const category = await updateCategoryById(codigo, validatedData);
    res.json(category);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategoryHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'ADMIN') {
    return next(new HttpError(403, 'Acesso negado. Apenas administradores podem excluir categorias.'));
  }

  try {
    const { codigo } = categoryParamsSchema.parse(req.params);
    await deleteCategoryById(codigo);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
