import { withClient } from '../db.js';
export async function getEmployeeDashboardData(userId:string){
  return withClient(async c => {
    const xpRow = await c.query(`select coalesce(sum(c.xp_oferecido),0) as xp
      from course_service.cursos c
      join progress_service.inscricoes i on i.curso_id=c.codigo
      where i.funcionario_id=$1 and i.status=$2`,[userId,'CONCLUIDO']);
    const emAndamento = await c.query(`select c.codigo,c.titulo from course_service.cursos c
      join progress_service.inscricoes i on i.curso_id=c.codigo
      where i.funcionario_id=$1 and i.status=$2
      order by i.data_inicio desc limit 10`,[userId,'EM_ANDAMENTO']);
    const concluidos = await c.query(`select c.codigo,c.titulo from course_service.cursos c
      join progress_service.inscricoes i on i.curso_id=c.codigo
      where i.funcionario_id=$1 and i.status=$2
      order by i.data_conclusao desc nulls last limit 10`,[userId,'CONCLUIDO']);
    return {
      xp_atual: Number(xpRow.rows[0]?.xp||0),
      nivel_atual: 1,
      proximo_badge: 'Bronze',
      ranking_departamento: null,
      cursos_em_andamento: emAndamento.rows,
      cursos_concluidos: concluidos.rows,
      cursos_disponiveis: [],
      timeline: []
    };
  });
}
export async function getInstructorDashboardData(userId:string){
  return withClient(async c => {
    const stats = await c.query(`select c.codigo,c.titulo,c.ativo,
      (select count(*) from progress_service.inscricoes i where i.curso_id=c.codigo) as inscritos,
      (select count(*) from progress_service.inscricoes i where i.curso_id=c.codigo and i.status='CONCLUIDO') as concluidos,
      case when (select count(*) from progress_service.inscricoes i where i.curso_id=c.codigo)=0 then 0
           else round(((select count(*) from progress_service.inscricoes i where i.curso_id=c.codigo and i.status='CONCLUIDO')::decimal /
               (select count(*) from progress_service.inscricoes i where i.curso_id=c.codigo))*100,2) end as taxa_conclusao,
      null::decimal as avaliacao_media
      from course_service.cursos c where c.instrutor_id=$1 order by c.titulo asc`,[userId]);
    const cursos = stats.rows.map(r=>({
      codigo:r.codigo, titulo:r.titulo, ativo:r.ativo, inscritos:Number(r.inscritos||0), conclusoes:Number(r.concluidos||0), taxa_conclusao: Number(r.taxa_conclusao||0), avaliacao_media: r.avaliacao_media ? Number(r.avaliacao_media) : null
    }));
    const mediaGeral = cursos.length? (cursos.reduce((a,c)=> a + (c.avaliacao_media||0),0) / cursos.length): null;
    return { cursos, pendentes_correcao: 0, media_geral_cursos: mediaGeral };
  });
}
