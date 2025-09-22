import { Request, Response, NextFunction } from 'express';
import { createCourseSchema, updateCourseSchema } from '../validation/courseSchemas.js';
import { 
  createCourse, 
  getCourse, 
  updateCourse, 
  toggleCourseStatus, 
  duplicateCourse, 
  cursosInstrutorFiltrados, 
  reativarCursosDoInstrutor,
  getAllCourses,
  getCoursesByCategory,
  getCoursesByDepartment
} from '../services/courseService.js';
import { HttpError } from '../utils/httpError.js';

interface UserContext { 
  id: string; 
  role: 'ADMIN' | 'GERENTE' | 'INSTRUTOR' | 'ALUNO';
}

// Helper para extrair contexto do usuário dos headers (vindos do API Gateway)
function getUserContext(req: Request): UserContext {
  return {
    id: req.header('x-user-id') || '',
    role: (req.header('x-user-role') as UserContext['role']) || 'ALUNO',
  };
}
interface FieldIssue { path: (string | number)[]; message: string }
export async function createCourseHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success) return next(new HttpError(400, 'validation_error', parsed.error.issues));
  
  try {
    const result = await createCourse(parsed.data);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

export async function getCourseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getCourse(req.params.codigo);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function getAllCoursesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = getUserContext(req);
    
    // Extrair filtros de busca (compatibilidade com catálogo)
    const filters = {
      q: req.query.q as string | undefined,
      categoria: req.query.categoria as string | undefined,
      instrutor: req.query.instrutor as string | undefined,
      nivel: req.query.nivel as string | undefined,
      duracaoMax: req.query.duracaoMax ? Number(req.query.duracaoMax) : undefined,
      // Filtros adicionais
      departamento: req.query.departamento as string | undefined,
      categoria_id: req.query.categoria_id as string | undefined,
      ativo: req.query.ativo === 'true' ? true : req.query.ativo === 'false' ? false : undefined
    };
    
    // Verificar permissões baseadas no role
    let result;
    
    if (user.role === 'ADMIN') {
      // ADMIN vê todos os cursos com filtros opcionais
      result = await getAllCourses();
      
    } else if (user.role === 'GERENTE') {
      // GERENTE pode ver cursos de qualquer departamento
      // ✅ Frontend vai filtrar apenas o departamento do usuário
      if (filters.departamento) {
        result = await getCoursesByDepartment(filters.departamento);
      } else {
        result = await getAllCourses();
      }
      
    } else if (user.role === 'INSTRUTOR') {
      // INSTRUTOR vê apenas seus próprios cursos
      result = await cursosInstrutorFiltrados(user.id);
      
    } else {
      // ALUNO pode ver cursos ativos (catálogo público)
      if (filters.categoria_id) {
        result = await getCoursesByCategory(filters.categoria_id);
      } else {
        result = await getAllCourses();
      }
      
      // Filtrar apenas cursos ativos para alunos
      result = result.filter(course => course.ativo);
    }
    
    // Aplicar filtros de busca se fornecidos (para todos os roles)
    if (filters.q || filters.categoria || filters.instrutor || filters.nivel || filters.duracaoMax) {
      result = result.filter(course => {
        if (filters.q && !course.titulo.toLowerCase().includes(filters.q.toLowerCase()) && 
            !course.descricao?.toLowerCase().includes(filters.q.toLowerCase())) return false;
        if (filters.categoria && course.categoria_id !== filters.categoria) return false;
        if (filters.instrutor && course.instrutor_id !== filters.instrutor) return false;
        if (filters.nivel && course.nivel_dificuldade !== filters.nivel) return false;
        if (filters.duracaoMax && course.duracao_estimada && course.duracao_estimada > filters.duracaoMax) return false;
        return true;
      });
    }
    
    res.json({ items: result, total: result.length });
  } catch (e) {
    next(e);
  }
}

export async function getCoursesByCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const categoriaId = req.params.categoriaId;
    const result = await getCoursesByCategory(categoriaId);
    res.json({ items: result, total: result.length });
  } catch (e) {
    next(e);
  }
}

export async function getCoursesByDepartmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = getUserContext(req);
    const departmentCode = req.params.departmentCode;
    
    // Verificar se o usuário tem permissão básica para acessar dados departamentais
    if (!['ADMIN', 'GERENTE'].includes(user.role)) {
      throw new HttpError(403, 'Acesso negado');
    }
    
    // ✅ Frontend vai garantir que GERENTE só acesse próprio departamento
    const result = await getCoursesByDepartment(departmentCode);
    res.json({ items: result, total: result.length });
  } catch (e) {
    next(e);
  }
}

export async function updateCourseHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = updateCourseSchema.safeParse(req.body);
  if (!parsed.success) return next(new HttpError(400, 'validation_error', parsed.error.issues));
  
  try {
    const user = getUserContext(req);
    const result = await updateCourse(req.params.codigo, parsed.data, user);
    res.json(result);
  } catch (e) {
    next(e);
  }
}
export async function setCourseActiveHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { active } = req.body as { active?: unknown };
    if (typeof active !== 'boolean') return next(new HttpError(400, 'validation_error', [{ path: ['active'], message: 'must be boolean' } as FieldIssue]));
    
    const result = await toggleCourseStatus(req.params.codigo, active);
    res.json(result);
  } catch (e) {
    next(e);
  }
}
export async function duplicateCourseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = getUserContext(req);
    
    // Verificar permissões para duplicação
    if (!['ADMIN', 'GERENTE', 'INSTRUTOR'].includes(user.role)) {
      throw new HttpError(403, 'Sem permissão para duplicar cursos');
    }
    
    const result = await duplicateCourse(req.params.codigo);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

// Handler para deletar curso (apenas ADMIN pode deletar)
export async function deleteCourseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = getUserContext(req);
    
    // Apenas ADMIN pode deletar cursos
    if (user.role !== 'ADMIN') {
      throw new HttpError(403, 'Apenas administradores podem deletar cursos');
    }
    
    // Por enquanto vamos usar desativação em vez de deleção física
    await toggleCourseStatus(req.params.codigo, false);
    res.json({ inativated: true });
  } catch (e) {
    next(e);
  }
}

interface UserCtx { id: string | null; role: string }
export async function listMyCoursesUnifiedHandler(req:Request,res:Response,next:NextFunction){
  try {
  const user = (req as unknown as { user: UserCtx }).user;
    if(!user.id) throw new HttpError(401,'no_user');
    if(!['INSTRUTOR','ADMIN'].includes(user.role)) throw new HttpError(403,'forbidden');
    const data = await cursosInstrutorFiltrados(user.id);
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

