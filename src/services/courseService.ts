import { insertCourse, findByCodigo, updateCourseDb, setCourseActiveDb, duplicateCourseDb, hasActiveEnrollments, listAllCourses, listCoursesByCategory, listCoursesByDepartment } from '../repositories/courseRepository.js';
import { NivelDificuldade } from '../types/domain.js';
interface CreateCourseInput { codigo:string; titulo:string; descricao?:string; categoria_id?:string; instrutor_id?:string; duracao_estimada?:number; xp_oferecido?:number; nivel_dificuldade?:NivelDificuldade; pre_requisitos?:string[] }
interface UpdateCourseInput { titulo?:string; descricao?:string; categoria_id?:string; instrutor_id?:string; duracao_estimada?:number; xp_oferecido?:number; nivel_dificuldade?:NivelDificuldade; pre_requisitos?:string[] }
import { HttpError } from '../utils/httpError.js';

export async function createCourse(data:CreateCourseInput){
  try { await insertCourse(data); return { codigo: data.codigo }; } catch (err:unknown){ if (typeof err === 'object' && err && (err as { code?:string }).code === '23505') throw new HttpError(409,'duplicado'); throw err; }
}

export async function getCourse(codigo:string){ 
  const c = await findByCodigo(codigo); 
  if(!c) throw new HttpError(404,'nao_encontrado'); 
  return c; 
}

export async function getAllCourses(){
  return listAllCourses();
}

export async function getCoursesByCategory(categoriaId: string){
  return listCoursesByCategory(categoriaId);
}

export async function getCoursesByDepartment(departmentCode: string){
  return listCoursesByDepartment(departmentCode);
}

export async function updateCourse(codigo:string, data:UpdateCourseInput){ 
  const existing = await findByCodigo(codigo); 
  if(!existing) throw new HttpError(404,'nao_encontrado'); 
  
  // Verificar permissões para edição
  const canEdit = await canEditCourse(codigo);
  if (!canEdit) {
    throw new HttpError(403, 'Não é possível editar curso com inscrições ativas.');
  }
  
  await updateCourseDb(codigo,data); 
  return { updated:true }; 
}

export async function toggleCourseStatus(codigo:string, active:boolean){ 
  const existing = await findByCodigo(codigo); 
  if(!existing) throw new HttpError(404,'nao_encontrado'); 
  
  await setCourseActiveDb(codigo, active); 
  return { codigo, ativo: active }; 
}

export async function duplicateCourse(codigo:string){ 
  const existing = await findByCodigo(codigo); 
  if(!existing) throw new HttpError(404,'nao_encontrado'); 
  
  const newCodigo = await duplicateCourseDb(codigo); 
  if (!newCodigo) throw new HttpError(500, 'Erro ao duplicar curso');
  
  return { codigo_original: codigo, codigo_copia: newCodigo }; 
}

async function canEditCourse(codigo: string): Promise<boolean> {
  // Verificar se há inscrições ativas
  const activeEnrollments = await hasActiveEnrollments(codigo);
  return !activeEnrollments;
}

