import { Request, Response, NextFunction } from 'express';
import { createCourseSchema } from '../validation/courseSchemas.js';
import { createCourse, getCourse } from '../services/courseService.js';
import { HttpError } from '../utils/httpError.js';
export async function createCourseHandler(req:Request,res:Response,next:NextFunction){
  const parsed = createCourseSchema.safeParse(req.body);
  if(!parsed.success) return next(new HttpError(400,'validation_error', parsed.error.issues));
  try { const r = await createCourse(parsed.data); res.status(201).json(r); } catch(e){ next(e);} }
export async function getCourseHandler(req:Request,res:Response,next:NextFunction){
  try { const r = await getCourse(req.params.codigo); res.json(r);} catch(e){ next(e);} }
