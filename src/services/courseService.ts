import { insertCourse, findByCodigo } from '../repositories/courseRepository.js';
import { HttpError } from '../utils/httpError.js';
export async function createCourse(data:any){
  try { await insertCourse(data); return { codigo: data.codigo }; } catch (err:any){ if (err.code === '23505') throw new HttpError(409,'duplicado'); throw err; }
}
export async function getCourse(codigo:string){ const c = await findByCodigo(codigo); if(!c) throw new HttpError(404,'nao_encontrado'); return c; }
