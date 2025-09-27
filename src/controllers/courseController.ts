import { Request, Response, NextFunction } from 'express';
import { createCourseSchema, updateCourseSchema } from '../validation/courseSchemas.js';
import {
  createCourse,
  getCourse,
  updateCourse,
  toggleCourseStatus,
  duplicateCourse,
  getAllCourses,
  getCoursesByCategory,
  getCoursesByDepartment,
  getCourseModulesService
} from '../services/courseService.js';


export async function createCourseHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      erro: 'dados_invalidos',
      mensagem: 'Dados do curso inválidos',
      detalhes: parsed.error.issues
    });
  }

  try {
    const curso = await createCourse(parsed.data);
    if (!curso) {
      return res.status(409).json({ erro: 'codigo_duplicado', mensagem: 'Já existe um curso com este código' });
    }
    res.status(201).json({ curso, mensagem: 'Curso criado com sucesso' });
  } catch (e) {
    next(e);
  }
}

export async function getCourseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const curso = await getCourse(req.params.codigo);
    if (!curso) return res.status(404).json({ erro: 'curso_nao_encontrado', mensagem: 'Curso não encontrado' });
    res.json({ curso, mensagem: 'Curso obtido com sucesso' });
  } catch (e) {
    next(e);
  }
}

export async function getAllCoursesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // Extrair filtros de busca
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
    
    // Buscar cursos baseado nos filtros fornecidos
    let result;
    
    if (filters.departamento) {
      // Filtrar por departamento se especificado
      result = await getCoursesByDepartment(filters.departamento);
    } else if (filters.categoria_id) {
      // Filtrar por categoria se especificado
      result = await getCoursesByCategory(filters.categoria_id);
    } else {
      // Retornar todos os cursos
      result = await getAllCourses();
    }
    
    // Aplicar filtros de busca se fornecidos
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

    // Aplicar filtro por status ativo se especificado
    if (filters.ativo !== undefined) {
      result = result.filter(course => course.ativo === filters.ativo);
    }
    
    res.json({ items: result, total: result.length, mensagem: 'Cursos listados com sucesso' });
  } catch (e) {
    next(e);
  }
}

export async function getCoursesByCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const categoriaId = req.params.categoriaId;
    const result = await getCoursesByCategory(categoriaId);
    res.json({ items: result, total: result.length, mensagem: 'Cursos da categoria listados com sucesso' });
  } catch (e) {
    next(e);
  }
}

export async function getCoursesByDepartmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const departmentCode = req.params.departmentCode;
    const result = await getCoursesByDepartment(departmentCode);
    res.json({ items: result, total: result.length, mensagem: 'Cursos do departamento listados com sucesso' });
  } catch (e) {
    next(e);
  }
}

export async function updateCourseHandler(req: Request, res: Response, next: NextFunction) {
  const parsed = updateCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ erro: 'dados_invalidos', mensagem: 'Dados para atualização inválidos', detalhes: parsed.error.issues });
  }

  try {
    const result = await updateCourse(req.params.codigo, parsed.data);
    if (!result) {
      return res.status(404).json({ erro: 'curso_nao_encontrado', mensagem: 'Curso não encontrado' });
    }
    if ('error' in result) {
      return res.status(403).json({ erro: result.error, mensagem: 'Não é possível editar curso com inscrições ativas' });
    }
    res.json({ curso: result, mensagem: 'Curso atualizado com sucesso' });
  } catch (e) {
    next(e);
  }
}
export async function setCourseActiveHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { active } = req.body as { active?: unknown };
    if (typeof active !== 'boolean') {
      return res.status(400).json({ erro: 'dados_invalidos', mensagem: 'Campo active deve ser boolean', detalhes: [{ path: ['active'], message: 'must be boolean' }] });
    }

    const curso = await toggleCourseStatus(req.params.codigo, active);
    if (!curso) {
      return res.status(404).json({ erro: 'curso_nao_encontrado', mensagem: 'Curso não encontrado' });
    }
    res.json({ curso, mensagem: `Status do curso atualizado para ${active ? 'ativo' : 'inativo'}` });
  } catch (e) {
    next(e);
  }
}
export async function duplicateCourseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await duplicateCourse(req.params.codigo);
    if (!result) {
      return res.status(404).json({ erro: 'curso_nao_encontrado', mensagem: 'Curso não encontrado' });
    }
    if ('error' in result) {
      return res.status(500).json({ erro: result.error, mensagem: 'Erro interno ao duplicar curso' });
    }
    res.status(201).json({ duplicacao: result, mensagem: 'Curso duplicado com sucesso' });
  } catch (e) {
    next(e);
  }
}

export async function deleteCourseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await toggleCourseStatus(req.params.codigo, false);
    res.json({ inactivated: true, mensagem: 'Curso desativado com sucesso' });
  } catch (e) {
    next(e);
  }
}

export async function getCourseModulesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const modulos = await getCourseModulesService(req.params.codigo);
    if (!modulos) {
      return res.status(404).json({ erro: 'curso_nao_encontrado', mensagem: 'Curso não encontrado' });
    }
    res.json({ items: modulos, mensagem: 'Módulos do curso listados com sucesso' });
  } catch (e) {
    next(e);
  }
}

