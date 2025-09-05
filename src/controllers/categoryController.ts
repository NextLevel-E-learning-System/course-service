import { Request, Response, NextFunction } from 'express';
import { getCategories, createCategory } from '../services/categoryService.js';
import { HttpError } from '../utils/httpError.js';
export async function listCategoriesHandler(_req:Request,res:Response,next:NextFunction){ try { res.json(await getCategories()); } catch(e){ next(e);} }
export async function createCategoryHandler(req:Request,res:Response,next:NextFunction){
  if((req as any).userRole !== 'ADMIN') return next(new HttpError(403,'forbidden'));
  try { const r = await createCategory(req.body); res.status(201).json(r); } catch(e){ next(e);} }
