import { Request, Response, NextFunction } from 'express';
import { createCourseSchema } from '../validation/courseSchemas.js';
import { createCourse, getCourse, updateCourse, activateCourse, deactivateCourse, duplicateCourse } from '../services/courseService.js';
import { HttpError } from '../utils/httpError.js';
export async function createCourseHandler(req:Request,res:Response,next:NextFunction){
  const parsed = createCourseSchema.safeParse(req.body);
  if(!parsed.success) return next(new HttpError(400,'validation_error', parsed.error.issues));
  try { const r = await createCourse(parsed.data); res.status(201).json(r); } catch(e){ next(e);} }
export async function getCourseHandler(req:Request,res:Response,next:NextFunction){
  try { const r = await getCourse(req.params.codigo); res.json(r);} catch(e){ next(e);} }
export async function updateCourseHandler(req:Request,res:Response,next:NextFunction){
  try { const r = await updateCourse(req.params.codigo, req.body); res.json(r);} catch(e){ next(e);} }
export async function activateCourseHandler(req:Request,res:Response,next:NextFunction){
  try { const r = await activateCourse(req.params.codigo); res.json(r);} catch(e){ next(e);} }
export async function deactivateCourseHandler(req:Request,res:Response,next:NextFunction){
  try { const r = await deactivateCourse(req.params.codigo); res.json(r);} catch(e){ next(e);} }
export async function duplicateCourseHandler(req:Request,res:Response,next:NextFunction){
  try { const r = await duplicateCourse(req.params.codigo); res.status(201).json(r);} catch(e){ next(e);} }

