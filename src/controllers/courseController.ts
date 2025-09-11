import { Request, Response, NextFunction } from 'express';
import { createCourseSchema, updateCourseSchema } from '../validation/courseSchemas.js';
import { createCourse, getCourse, updateCourse, setCourseActive, duplicateCourse, cursosInstrutorFiltrados, reativarCursosDoInstrutor } from '../services/courseService.js';
import { HttpError } from '../utils/httpError.js';
export async function createCourseHandler(req:Request,res:Response,next:NextFunction){
  const parsed = createCourseSchema.safeParse(req.body);
  if(!parsed.success) return next(new HttpError(400,'validation_error', parsed.error.issues));
  try { const r = await createCourse(parsed.data); res.status(201).json(r); } catch(e){ next(e);} }
export async function getCourseHandler(req:Request,res:Response,next:NextFunction){
  try { const r = await getCourse(req.params.codigo); res.json(r);} catch(e){ next(e);} }
export async function updateCourseHandler(req:Request,res:Response,next:NextFunction){
  const parsed = updateCourseSchema.safeParse(req.body);
  if(!parsed.success) return next(new HttpError(400,'validation_error', parsed.error.issues));
  try { const r = await updateCourse(req.params.codigo, parsed.data); res.json(r);} catch(e){ next(e);} }
interface FieldIssue { path:(string|number)[]; message:string }
export async function setCourseActiveHandler(req:Request,res:Response,next:NextFunction){
  try {
    const { active } = req.body as { active?:unknown };
    if(typeof active !== 'boolean') return next(new HttpError(400,'validation_error',[{ path:['active'], message:'must be boolean'} as FieldIssue]));
    const r = await setCourseActive(req.params.codigo, active);
    res.json(r);
  } catch(e){ next(e);} }
export async function duplicateCourseHandler(req:Request,res:Response,next:NextFunction){
  try { const r = await duplicateCourse(req.params.codigo); res.status(201).json(r);} catch(e){ next(e);} }
interface UserCtx { id:string|null; role:string }
export async function listMyCoursesUnifiedHandler(req:Request,res:Response,next:NextFunction){
  try {
  const user = (req as unknown as { user: UserCtx }).user;
    if(!user.id) throw new HttpError(401,'no_user');
    if(!['INSTRUTOR','ADMIN'].includes(user.role)) throw new HttpError(403,'forbidden');
    const status = (req.query.status as string|undefined)?.toUpperCase();
    let ativo: boolean | 'ALL' = 'ALL';
    if(status === 'ATIVOS') ativo = true; else if(status === 'INATIVOS') ativo = false;
    const data = await cursosInstrutorFiltrados(user.id, ativo);
    res.json({ items: data, total: data.length });
  } catch(e){ next(e);} }
export async function reactivateMyCoursesUnifiedHandler(req:Request,res:Response,next:NextFunction){
  try {
  const user = (req as unknown as { user: UserCtx }).user;
    if(!user.id) throw new HttpError(401,'no_user');
    if(!['INSTRUTOR','ADMIN'].includes(user.role)) throw new HttpError(403,'forbidden');
    const body = (req.body||{}) as { codigos?: string[] };
    const r = await reativarCursosDoInstrutor(user.id, body.codigos);
    res.json(r);
  } catch(e){ next(e);} }

