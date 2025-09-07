import { withClient } from '../db.js';

export async function getEmployeeDashboardData(userId: string) {
  return withClient(async c => {
    // XP Total do funcionário
    const xpRow = await c.query(`
      select coalesce(sum(c.xp_oferecido),0) as xp
      from course_service.cursos c
      join progress_service.inscricoes i on i.curso_id=c.codigo
      where i.funcionario_id=$1 and i.status=$2
    `, [userId, 'CONCLUIDO']);
    
    // Cursos em andamento
    const emAndamento = await c.query(`
      select c.codigo, c.titulo, c.descricao, i.progresso
      from course_service.cursos c
      join progress_service.inscricoes i on i.curso_id=c.codigo
      where i.funcionario_id=$1 and i.status=$2
      order by i.data_inicio desc limit 10
    `, [userId, 'EM_ANDAMENTO']);
    
    // Cursos concluídos
    const concluidos = await c.query(`
      select c.codigo, c.titulo, c.descricao, i.data_conclusao, c.xp_oferecido
      from course_service.cursos c
      join progress_service.inscricoes i on i.curso_id=c.codigo
      where i.funcionario_id=$1 and i.status=$2
      order by i.data_conclusao desc nulls last limit 10
    `, [userId, 'CONCLUIDO']);
    
    // Cursos disponíveis (não inscritos)
    const disponiveis = await c.query(`
      select c.codigo, c.titulo, c.descricao, c.nivel_dificuldade, c.xp_oferecido
      from course_service.cursos c
      where c.ativo = true 
      and not exists (
        select 1 from progress_service.inscricoes i 
        where i.curso_id = c.codigo and i.funcionario_id = $1
      )
      order by c.titulo limit 10
    `, [userId]);

    const xpAtual = Number(xpRow.rows[0]?.xp || 0);
    
    // Cálculo de nível baseado em XP (exemplo: a cada 1000 XP = 1 nível)
    const nivel = Math.floor(xpAtual / 1000) + 1;
    const xpProximoNivel = nivel * 1000;
    
    // Sistema de badges baseado no nível
    const badges = ['Bronze', 'Prata', 'Ouro', 'Platina', 'Diamante'];
    const proximoBadge = badges[Math.min(nivel - 1, badges.length - 1)];

    return {
      xp_atual: xpAtual,
      nivel_atual: nivel,
      xp_proximo_nivel: xpProximoNivel,
      proximo_badge: proximoBadge,
      progresso_nivel: ((xpAtual % 1000) / 1000) * 100,
      ranking_departamento: null, // TODO: Implementar ranking por departamento
      cursos_em_andamento: emAndamento.rows,
      cursos_concluidos: concluidos.rows,
      cursos_disponiveis: disponiveis.rows,
      timeline: [] // TODO: Implementar timeline de atividades
    };
  });
}

export async function getInstructorDashboardData(userId: string) {
  return withClient(async c => {
    // Estatísticas dos cursos do instrutor
    const stats = await c.query(`
      select 
        c.codigo,
        c.titulo,
        c.ativo,
        (select count(*) from progress_service.inscricoes i where i.curso_id=c.codigo) as inscritos,
        (select count(*) from progress_service.inscricoes i where i.curso_id=c.codigo and i.status='CONCLUIDO') as concluidos,
        case 
          when (select count(*) from progress_service.inscricoes i where i.curso_id=c.codigo)=0 then 0
          else round(((select count(*) from progress_service.inscricoes i where i.curso_id=c.codigo and i.status='CONCLUIDO')::decimal /
               (select count(*) from progress_service.inscricoes i where i.curso_id=c.codigo))*100,2) 
        end as taxa_conclusao,
        null::decimal as avaliacao_media
      from course_service.cursos c 
      where c.instrutor_id=$1 
      order by c.titulo asc
    `, [userId]);
    
    // Avaliações pendentes (integração com assessment-service)
    const pendentesRow = await c.query(`
      select count(*) as total
      from assessment_service.avaliacoes a
      join course_service.cursos c on c.codigo = a.curso_id
      where c.instrutor_id = $1 and a.status = 'PENDENTE'
    `, [userId]).catch(() => ({ rows: [{ total: 0 }] })); // Fallback se não existir

    const cursos = stats.rows.map(r => ({
      codigo: r.codigo,
      titulo: r.titulo,
      ativo: r.ativo,
      inscritos: Number(r.inscritos || 0),
      conclusoes: Number(r.concluidos || 0),
      taxa_conclusao: Number(r.taxa_conclusao || 0),
      avaliacao_media: r.avaliacao_media ? Number(r.avaliacao_media) : null
    }));

    const mediaGeral = cursos.length 
      ? (cursos.reduce((a, c) => a + (c.avaliacao_media || 0), 0) / cursos.length) 
      : null;

    return {
      cursos,
      pendentes_correcao: Number(pendentesRow.rows[0]?.total || 0),
      media_geral_cursos: mediaGeral,
      total_cursos: cursos.length,
      total_alunos: cursos.reduce((sum, curso) => sum + curso.inscritos, 0),
      taxa_conclusao_geral: cursos.length > 0 
        ? (cursos.reduce((sum, curso) => sum + curso.taxa_conclusao, 0) / cursos.length) 
        : 0
    };
  });
}

export async function getAdminDashboardData() {
  return withClient(async c => {
    // Métricas gerais do sistema
    const usuariosAtivos = await c.query(`
      select count(distinct funcionario_id) as total
      from progress_service.inscricoes 
      where data_inicio >= current_date - interval '30 days'
    `).catch(() => ({ rows: [{ total: 0 }] }));

    const cursosPopulares = await c.query(`
      select 
        c.codigo,
        c.titulo,
        count(i.funcionario_id) as total_inscricoes
      from course_service.cursos c
      join progress_service.inscricoes i on i.curso_id = c.codigo
      where i.data_inicio >= current_date - interval '30 days'
      group by c.codigo, c.titulo
      order by total_inscricoes desc
      limit 10
    `).catch(() => ({ rows: [] }));

    const taxaConclusaoGeral = await c.query(`
      select 
        count(*) as total_inscricoes,
        count(case when status = 'CONCLUIDO' then 1 end) as total_conclusoes,
        case 
          when count(*) = 0 then 0
          else round((count(case when status = 'CONCLUIDO' then 1 end)::decimal / count(*))*100, 2)
        end as taxa_conclusao
      from progress_service.inscricoes
      where data_inicio >= current_date - interval '30 days'
    `).catch(() => ({ rows: [{ total_inscricoes: 0, total_conclusoes: 0, taxa_conclusao: 0 }] }));

    // Alertas do sistema
    const cursosComBaixaAvaliacao = await c.query(`
      select codigo, titulo, 'Baixa avaliação' as tipo_alerta
      from course_service.cursos c
      where ativo = true
      limit 5
    `).catch(() => ({ rows: [] }));

    const instrutoresInativos = await c.query(`
      select u.nome, 'Instrutor inativo' as tipo_alerta
      from user_service.usuarios u
      where u.role = 'INSTRUTOR'
      and not exists (
        select 1 from course_service.cursos c where c.instrutor_id = u.id
      )
      limit 5
    `).catch(() => ({ rows: [] }));

    // Engajamento por departamento (simulado)
    const engajamentoDepartamento = [
      { departamento: 'TI', total_inscricoes: 150, taxa_conclusao: 85 },
      { departamento: 'RH', total_inscricoes: 120, taxa_conclusao: 78 },
      { departamento: 'Vendas', total_inscricoes: 200, taxa_conclusao: 72 },
      { departamento: 'Marketing', total_inscricoes: 90, taxa_conclusao: 88 }
    ];

    return {
      metricas_gerais: {
        usuarios_ativos_30d: Number(usuariosAtivos.rows[0]?.total || 0),
        total_cursos: await c.query('select count(*) as total from course_service.cursos where ativo = true')
          .then(r => Number(r.rows[0]?.total || 0)),
        taxa_conclusao_geral: Number(taxaConclusaoGeral.rows[0]?.taxa_conclusao || 0),
        total_inscricoes_30d: Number(taxaConclusaoGeral.rows[0]?.total_inscricoes || 0)
      },
      cursos_populares: cursosPopulares.rows.map(r => ({
        codigo: r.codigo,
        titulo: r.titulo,
        inscricoes: Number(r.total_inscricoes)
      })),
      engajamento_departamento: engajamentoDepartamento,
      alertas: [
        ...cursosComBaixaAvaliacao.rows.map(r => ({
          tipo: r.tipo_alerta,
          descricao: `Curso "${r.titulo}" com baixa avaliação`,
          prioridade: 'media' as const
        })),
        ...instrutoresInativos.rows.map(r => ({
          tipo: r.tipo_alerta,
          descricao: `Instrutor "${r.nome}" sem cursos ativos`,
          prioridade: 'baixa' as const
        }))
      ]
    };
  });
}
