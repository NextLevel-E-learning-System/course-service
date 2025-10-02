import { insertCourse, findByCodigo, updateCourseDb, setCourseActiveDb, duplicateCourseDb, listCoursesByCategory, listCoursesByDepartment, getCourseWithStats, listAllCoursesWithStats, getCourseModules } from '../repositories/courseRepository.js';
import { NivelDificuldade } from '../types/domain.js';
interface CreateCourseInput { codigo:string; titulo:string; descricao?:string; categoria_id?:string; instrutor_id?:string; duracao_estimada?:number; xp_oferecido?:number; nivel_dificuldade?:NivelDificuldade; pre_requisitos?:string[] }
interface UpdateCourseInput { titulo?:string; descricao?:string; categoria_id?:string; instrutor_id?:string; duracao_estimada?:number; xp_oferecido?:number; nivel_dificuldade?:NivelDificuldade; pre_requisitos?:string[] }

export async function createCourse(data:CreateCourseInput){
  try {
    await insertCourse(data);
    return { codigo: data.codigo };
  } catch (err:unknown){
    if (typeof err === 'object' && err && (err as { code?:string }).code === '23505') {
      return null; // duplicação - controller decide como responder
    }
    throw err;
  }
}

export async function getCourse(codigo:string){ 
  const c = await getCourseWithStats(codigo); 
  return c; // pode retornar null, controller decide como tratar
}

export async function getAllCourses(){
  // logs podem permanecer simples sem alterar contrato
  const result = await listAllCoursesWithStats();
  return result;
}

export async function getCoursesByCategory(categoriaId: string){
  return listCoursesByCategory(categoriaId);
}

export async function getCoursesByDepartment(departmentCode: string){
  return listCoursesByDepartment(departmentCode);
}

export async function updateCourse(codigo:string, data:UpdateCourseInput){
  const existing = await findByCodigo(codigo);
  if(!existing) return null; // não encontrado

  await updateCourseDb(codigo,data);
  return await findByCodigo(codigo); // retorna curso atualizado
}

export async function toggleCourseStatus(codigo:string, active:boolean){
  const existing = await findByCodigo(codigo);
  if(!existing) return null; // não encontrado
  await setCourseActiveDb(codigo, active);
  return await findByCodigo(codigo);
}

export async function duplicateCourse(codigo:string){
  const existing = await findByCodigo(codigo);
  if(!existing) return null; // não encontrado
  const newCodigo = await duplicateCourseDb(codigo);
  if (!newCodigo) return { error: 'erro_duplicar_curso' }; // falha na duplicação
  return { codigo_original: codigo, codigo_copia: newCodigo };
}

export async function getCourseModulesService(codigo: string) {
  const existing = await findByCodigo(codigo);
  if (!existing) return null; // não encontrado
  return getCourseModules(codigo);
}

 
