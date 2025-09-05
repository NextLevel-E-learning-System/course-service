import { Request, Response, NextFunction } from 'express';
import { enrollInCourse, getCourseProgress } from '../services/enrollmentService.js';
export async function enrollCourseHandler(req:Request,res:Response,next:NextFunction){
  try { const user = (req as any).user; const r = await enrollInCourse(user.id, req.params.codigo); res.status(201).json(r);} catch(e){ next(e);} }
export async function courseProgressHandler(req:Request,res:Response,next:NextFunction){
  try { const user = (req as any).user; const r = await getCourseProgress(user.id, req.params.codigo); res.json(r);} catch(e){ next(e);} }
