import { insertCourse, findByCodigo, updateCourseDb, setCourseActiveDb, duplicateCourseDb } from '../repositories/courseRepository.js';
import { HttpError } from '../utils/httpError.js';
export async function createCourse(data:any){
  try { await insertCourse(data); return { codigo: data.codigo }; } catch (err:any){ if (err.code === '23505') throw new HttpError(409,'duplicado'); throw err; }
}
export async function getCourse(codigo:string){ const c = await findByCodigo(codigo); if(!c) throw new HttpError(404,'nao_encontrado'); return c; }
export async function updateCourse(codigo:string, data:any){ const existing = await findByCodigo(codigo); if(!existing) throw new HttpError(404,'nao_encontrado'); await updateCourseDb(codigo,data); return { updated:true }; }
export async function activateCourse(codigo:string){ await setCourseActiveDb(codigo,true); return { active:true }; }
export async function deactivateCourse(codigo:string){ await setCourseActiveDb(codigo,false); return { active:false }; }
export async function duplicateCourse(codigo:string){ const r = await duplicateCourseDb(codigo); return { codigo: r }; }

