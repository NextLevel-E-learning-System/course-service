import { Request, Response, NextFunction } from 'express';
import { 
  getModulosCompletosByCurso, 
  getModuloCompleto,
  atualizarTipoConteudo 
} from '../repositories/moduloCompostoRepository.js';

/**
 * GET /cursos/:codigo/modulos/completos
 * Lista módulos completos do curso (com materiais e avaliações)
 */
export async function listModulosCompletosHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { codigo } = req.params;
    
    const modulos = await getModulosCompletosByCurso(codigo);
    
    res.json({
      success: true,
      items: modulos,
      total: modulos.length,
      mensagem: 'Módulos completos listados com sucesso'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /modulos/:id/completo
 * Busca um módulo completo específico
 */
export async function getModuloCompletoHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    
    const modulo = await getModuloCompleto(id);
    
    if (!modulo) {
      return res.status(404).json({
        success: false,
        erro: 'modulo_nao_encontrado',
        mensagem: 'Módulo não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: modulo,
      mensagem: 'Módulo obtido com sucesso'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /modulos/:id/atualizar-tipo
 * Atualiza automaticamente o tipo_conteudo baseado nos materiais/avaliações
 */
export async function atualizarTipoConteudoHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    
    await atualizarTipoConteudo(id);
    
    res.json({
      success: true,
      mensagem: 'Tipo de conteúdo atualizado automaticamente'
    });
  } catch (error) {
    next(error);
  }
}
