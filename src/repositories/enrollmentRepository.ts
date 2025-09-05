import { withClient } from '../db.js';

// Verifica se já existe inscrição (progress_service.inscricoes)
export async function userEnrolled(userId:string,codigo:string){
  return withClient(c=>c.query('select 1 from progress_service.inscricoes where funcionario_id=$1 and curso_id=$2',[userId,codigo]).then(r=>!!r.rows[0]));
}

export async function insertEnrollment(userId:string,codigo:string){
  return withClient(c=>c.query('insert into progress_service.inscricoes (funcionario_id, curso_id, status, data_inicio) values ($1,$2,$3,now())',[userId,codigo,'EM_ANDAMENTO']));
}

export async function getProgressData(userId:string,codigo:string){
  return withClient(async c => {
    const course = await c.query('select codigo, titulo, duracao_estimada, xp_oferecido from cursos where codigo=$1',[codigo]);
  const mods = await c.query('select id, titulo, ordem, obrigatorio, xp_modulo as xp from course_service.modulos where curso_id=$1 order by ordem asc',[codigo]);
    const completed = await c.query(`select pm.modulo_id from progress_service.progresso_modulos pm
      join progress_service.inscricoes i on i.id = pm.inscricao_id
      where i.funcionario_id=$1 and i.curso_id=$2 and pm.data_conclusao is not null`,[userId,codigo]);
    const completedSet = new Set(completed.rows.map(r=>r.modulo_id));
  interface Row { id:string; titulo:string; ordem:number; obrigatorio:boolean; xp:number; }
  const modules = mods.rows.map((m:Row)=>({ ...m, concluido: completedSet.has(m.id) }));
  const total = modules.length; const done = modules.filter(m=>m.concluido).length; const progresso = total? Math.round((done/total)*100):0;
    return { curso: course.rows[0], progresso, modulos: modules };
  });
}
