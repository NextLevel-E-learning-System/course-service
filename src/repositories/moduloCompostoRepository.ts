import { withClient } from '../db.js';
import { ModuloCompleto } from '../types/moduloComposto.js';

/**
 * Busca módulos completos de um curso (com materiais e avaliações)
 * Query direta sem usar views
 */
export async function getModulosCompletosByCurso(cursoId: string): Promise<ModuloCompleto[]> {
  return withClient(async (client) => {
    const result = await client.query<ModuloCompleto>(
      `
      SELECT 
        m.id as modulo_id,
        m.curso_id,
        m.ordem,
        m.titulo,
        m.conteudo,
        m.tipo_conteudo,
        m.obrigatorio,
        m.xp_modulo,
        m.criado_em,
        m.atualizado_em,
        -- Agregar materiais do módulo
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', mat.id,
              'nome_arquivo', mat.nome_arquivo,
              'tipo_arquivo', mat.tipo_arquivo,
              'tamanho', mat.tamanho,
              'storage_key', mat.storage_key,
              'criado_em', mat.criado_em
            )
          ) FILTER (WHERE mat.id IS NOT NULL),
          '[]'::json
        ) as materiais,
        -- Agregar avaliação do módulo (apenas uma por módulo)
        CASE 
          WHEN av.codigo IS NOT NULL THEN
            json_build_object(
              'codigo', av.codigo,
              'titulo', av.titulo,
              'tempo_limite', av.tempo_limite,
              'tentativas_permitidas', av.tentativas_permitidas,
              'nota_minima', av.nota_minima,
              'ativo', av.ativo
            )
          ELSE NULL
        END as avaliacao
      FROM course_service.modulos m
      LEFT JOIN course_service.materiais mat ON mat.modulo_id = m.id
      LEFT JOIN assessment_service.avaliacoes av ON av.modulo_id = m.id
      WHERE m.curso_id = $1
      GROUP BY 
        m.id,
        m.curso_id,
        m.ordem,
        m.titulo,
        m.conteudo,
        m.tipo_conteudo,
        m.obrigatorio,
        m.xp_modulo,
        m.criado_em,
        m.atualizado_em,
        av.codigo,
        av.titulo,
        av.tempo_limite,
        av.tentativas_permitidas,
        av.nota_minima,
        av.ativo
      ORDER BY m.ordem ASC
      `,
      [cursoId]
    );
    
    return result.rows;
  });
}

/**
 * Busca um módulo completo específico
 * Query direta sem usar views
 */
export async function getModuloCompleto(moduloId: string): Promise<ModuloCompleto | null> {
  return withClient(async (client) => {
    const result = await client.query<ModuloCompleto>(
      `
      SELECT 
        m.id as modulo_id,
        m.curso_id,
        m.ordem,
        m.titulo,
        m.conteudo,
        m.tipo_conteudo,
        m.obrigatorio,
        m.xp_modulo,
        m.criado_em,
        m.atualizado_em,
        -- Agregar materiais do módulo
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', mat.id,
              'nome_arquivo', mat.nome_arquivo,
              'tipo_arquivo', mat.tipo_arquivo,
              'tamanho', mat.tamanho,
              'storage_key', mat.storage_key,
              'criado_em', mat.criado_em
            )
          ) FILTER (WHERE mat.id IS NOT NULL),
          '[]'::json
        ) as materiais,
        -- Agregar avaliação do módulo (apenas uma por módulo)
        CASE 
          WHEN av.codigo IS NOT NULL THEN
            json_build_object(
              'codigo', av.codigo,
              'titulo', av.titulo,
              'tempo_limite', av.tempo_limite,
              'tentativas_permitidas', av.tentativas_permitidas,
              'nota_minima', av.nota_minima,
              'ativo', av.ativo
            )
          ELSE NULL
        END as avaliacao
      FROM course_service.modulos m
      LEFT JOIN course_service.materiais mat ON mat.modulo_id = m.id
      LEFT JOIN assessment_service.avaliacoes av ON av.modulo_id = m.id
      WHERE m.id = $1
      GROUP BY 
        m.id,
        m.curso_id,
        m.ordem,
        m.titulo,
        m.conteudo,
        m.tipo_conteudo,
        m.obrigatorio,
        m.xp_modulo,
        m.criado_em,
        m.atualizado_em,
        av.codigo,
        av.titulo,
        av.tempo_limite,
        av.tentativas_permitidas,
        av.nota_minima,
        av.ativo
      `,
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
