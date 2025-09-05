import { HttpError } from '../utils/httpError.js';
import { findByCodigo } from '../repositories/courseRepository.js';
import { userEnrolled, insertEnrollment, getProgressData } from '../repositories/enrollmentRepository.js';
import { prerequisitesMet } from '../utils/prerequisites.js';
export async function enrollInCourse(userId:string, codigo:string){
  if(!userId) throw new HttpError(401,'unauthorized');
  const course = await findByCodigo(codigo); if(!course) throw new HttpError(404,'curso_nao_encontrado');
  if (!(await prerequisitesMet(userId, course.pre_requisitos||[]))) {
    return { inscrito:false, motivo:'pre_requisitos_nao_atendidos', sugestaoTrilha: course.pre_requisitos };
  }
  if (await userEnrolled(userId,codigo)) return { inscrito:true, status:'JA_INSCRITO' };
  await insertEnrollment(userId,codigo);
  return { inscrito:true, status:'EM_ANDAMENTO', inicio: new Date().toISOString() };
}
export async function getCourseProgress(userId:string,codigo:string){
  if(!userId) throw new HttpError(401,'unauthorized');
  return getProgressData(userId,codigo);
}
