import { insertCourse, findByCodigo, updateCourseDb, setCourseActiveDb, duplicateCourseDb, hasActiveEnrollments, listCursosInstrutor, reativarCursosInstrutor } from '../repositories/courseRepository.js';
import { NivelDificuldade } from '../types/domain.js';
interface CreateCourseInput { codigo:string; titulo:string; descricao?:string; categoria_id?:string; instrutor_id?:string; duracao_estimada?:number; xp_oferecido?:number; nivel_dificuldade?:NivelDificuldade; pre_requisitos?:string[] }
interface UpdateCourseInput { titulo?:string; descricao?:string; categoria_id?:string; instrutor_id?:string; duracao_estimada?:number; xp_oferecido?:number; nivel_dificuldade?:NivelDificuldade; pre_requisitos?:string[] }
import { HttpError } from '../utils/httpError.js';
export async function createCourse(data:CreateCourseInput){
  try { await insertCourse(data); return { codigo: data.codigo }; } catch (err:unknown){ if (typeof err === 'object' && err && (err as { code?:string }).code === '23505') throw new HttpError(409,'duplicado'); throw err; }
}
export async function getCourse(codigo:string){ const c = await findByCodigo(codigo); if(!c) throw new HttpError(404,'nao_encontrado'); return c; }
export async function updateCourse(codigo:string, data:UpdateCourseInput){ const existing = await findByCodigo(codigo); if(!existing) throw new HttpError(404,'nao_encontrado'); const activeEnr = await hasActiveEnrollments(codigo); if(activeEnr) throw new HttpError(409,'curso_com_inscricoes_ativas'); await updateCourseDb(codigo,data); return { updated:true }; }
export async function setCourseActive(codigo:string, active:boolean){ await setCourseActiveDb(codigo, active); return { active }; }
export async function duplicateCourse(codigo:string){ const r = await duplicateCourseDb(codigo); return { codigo: r }; }

// ===== Instrutor self endpoints =====
export async function reativarCursosDoInstrutor(instrutorId: string, cursos?: string[]){
  return reativarCursosInstrutor(instrutorId, cursos);
}
export async function cursosInstrutorFiltrados(instrutorId: string, ativo: boolean | 'ALL'){
  return listCursosInstrutor(instrutorId, { ativo });
}

