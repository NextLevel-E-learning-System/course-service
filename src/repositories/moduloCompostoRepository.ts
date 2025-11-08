import { withClient } from '../db.js';
import { ModuloCompleto } from '../types/moduloComposto.js';

/**
 * Busca módulos completos de um curso (com materiais e avaliações)
 * Usa a view v_modulos_completos
 */
export async function getModulosCompletosByCurso(cursoId: string): Promise<ModuloCompleto[]> {
  return withClient(async (client) => {
    const result = await client.query<ModuloCompleto>(
      `SELECT * FROM course_service.v_modulos_completos WHERE curso_id = $1 ORDER BY ordem ASC`,
      [cursoId]
    );
    
    return result.rows;
  });
}

/**
 * Busca um módulo completo específico
 */
export async function getModuloCompleto(moduloId: string): Promise<ModuloCompleto | null> {
  return withClient(async (client) => {
    const result = await client.query<ModuloCompleto>(
      `SELECT * FROM course_service.v_modulos_completos WHERE modulo_id = $1`,
      [moduloId]
    );
    
    return result.rows[0] || null;
  });
}

/**
 * Detecta automaticamente o tipo de conteúdo do módulo
 * baseado nos materiais e avaliação vinculados
 */
export async function detectarTipoConteudo(moduloId: string): Promise<string> {
  return withClient(async (client) => {
    const result = await client.query<{ tipo: string }>(
      `
      WITH modulo_info AS (
        SELECT 
          COUNT(DISTINCT mat.id) as total_materiais,
          CASE WHEN av.codigo IS NOT NULL THEN 1 ELSE 0 END as tem_avaliacao,
          ARRAY_AGG(DISTINCT mat.tipo_arquivo) FILTER (WHERE mat.tipo_arquivo IS NOT NULL) as tipos_materiais
        FROM course_service.modulos m
        LEFT JOIN course_service.materiais mat ON mat.modulo_id = m.id
        LEFT JOIN assessment_service.avaliacoes av ON av.modulo_id = m.id AND av.ativo = true
        WHERE m.id = $1
        GROUP BY m.id, av.codigo
      )
      SELECT 
        CASE
          -- Apenas quiz
          WHEN total_materiais = 0 AND tem_avaliacao = 1 THEN 'QUIZ'
          
          -- Apenas um vídeo
          WHEN total_materiais = 1 AND 'video/mp4' = ANY(tipos_materiais) AND tem_avaliacao = 0 THEN 'VIDEO'
          
          -- Apenas um PDF
          WHEN total_materiais = 1 AND 'application/pdf' = ANY(tipos_materiais) AND tem_avaliacao = 0 THEN 'PDF'
          
          -- Apenas texto (sem materiais, sem quiz, mas tem conteúdo)
          WHEN total_materiais = 0 AND tem_avaliacao = 0 THEN 'TEXTO'
          
          -- Misto (vários materiais, ou material + quiz)
          ELSE 'MISTO'
        END as tipo
      FROM modulo_info
      `,
      [moduloId]
    );
    
    return result.rows[0]?.tipo || 'TEXTO';
  });
}

/**
 * Atualiza o tipo_conteudo do módulo automaticamente
 */
export async function atualizarTipoConteudo(moduloId: string): Promise<void> {
  const tipo = await detectarTipoConteudo(moduloId);
  
  return withClient(async (client) => {
    await client.query(
      `UPDATE course_service.modulos SET tipo_conteudo = $1, atualizado_em = NOW() WHERE id = $2`,
      [tipo, moduloId]
    );
  });
}
