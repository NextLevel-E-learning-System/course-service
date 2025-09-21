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

export async function createCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = createCategorySchema.parse(req.body);
    const result = await createCategory(validatedData);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { codigo } = categoryParamsSchema.parse(req.params);
    const validatedData = updateCategorySchema.parse(req.body);
    const category = await updateCategoryById(codigo, validatedData);
    res.json(category);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { codigo } = categoryParamsSchema.parse(req.params);
    await deleteCategoryById(codigo);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
