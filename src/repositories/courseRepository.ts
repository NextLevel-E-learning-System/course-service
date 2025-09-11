import { withClient } from '../db.js';
import { Course } from '../types/domain.js';

export async function insertCourse(d:Partial<Course> & { codigo:string; titulo:string }){
  await withClient(c => c.query('insert into course_service.cursos (codigo, titulo, descricao, categoria_id, instrutor_id, duracao_estimada, xp_oferecido, nivel_dificuldade, ativo, pre_requisitos) values ($1,$2,$3,$4,$5,$6,$7,$8,true,$9)', [d.codigo,d.titulo,d.descricao||null,d.categoria_id||null,d.instrutor_id||null,d.duracao_estimada||null,d.xp_oferecido||null,d.nivel_dificuldade||null,d.pre_requisitos||[]]));
}
export async function findByCodigo(codigo:string){
  return withClient(async c => {
    const r = await c.query('select codigo, titulo, descricao, categoria_id, instrutor_id, duracao_estimada, xp_oferecido, nivel_dificuldade, ativo, pre_requisitos from course_service.cursos where codigo=$1', [codigo]);
    return r.rows[0];
  });
}
export async function updateCourseDb(codigo:string,data:Partial<Course>){
  const fields:string[] = []; const values:unknown[] = []; let idx=1;
  const record = data as Record<string, unknown>;
  for (const k of ['titulo','descricao','categoria_id','instrutor_id','duracao_estimada','xp_oferecido','nivel_dificuldade','pre_requisitos']){
    if (k in record){ fields.push(`${k}=$${idx++}`); values.push(record[k]); }
  }
  if(!fields.length) return;
  values.push(codigo);
  await withClient(c=>c.query(`update course_service.cursos set ${fields.join(', ')} where codigo=$${idx}` , values));
}
export async function setCourseActiveDb(codigo:string, active:boolean){
  await withClient(c=>c.query('update course_service.cursos set ativo=$1 where codigo=$2',[active,codigo]));
}
export async function duplicateCourseDb(codigo:string){
  return withClient(async c => {
    const r = await c.query('select * from course_service.cursos where codigo=$1',[codigo]);
    if(!r.rows[0]) return null;
    const original = r.rows[0];
    const newCodigo = `${original.codigo}_copy_${Date.now()}`;
    await c.query('insert into course_service.cursos (codigo, titulo, descricao, categoria_id, instrutor_id, duracao_estimada, xp_oferecido, nivel_dificuldade, ativo, pre_requisitos) values ($1,$2,$3,$4,$5,$6,$7,$8,false,$9)', [newCodigo, original.titulo, original.descricao, original.categoria_id, original.instrutor_id, original.duracao_estimada, original.xp_oferecido, original.nivel_dificuldade, original.pre_requisitos]);
    return newCodigo;
  });
}
export async function hasActiveEnrollments(codigo:string){
  return withClient(c=>c.query('select 1 from progress_service.inscricoes where curso_id=$1 and status=$2 limit 1',[codigo,'EM_ANDAMENTO']).then(r=>!!r.rows[0]));
}

// Função unificada com filtro opcional por status
export async function listCursosInstrutor(instrutorId: string, opts?: { ativo?: boolean | 'ALL' }){
  const ativo = opts?.ativo;
  return withClient(async c => {
    const base = `select codigo, titulo, descricao, ativo, categoria_id, updated_at, created_at, instrutor_id
                    from course_service.cursos
                   where instrutor_id = $1`;
    let sql = base;
  const params: unknown[] = [instrutorId];
    if (ativo === true) sql += ' and ativo = true';
    else if (ativo === false) sql += ' and ativo = false';
    sql += ' order by ativo desc, updated_at desc, created_at desc';
    const r = await c.query(sql, params);
    return r.rows;
  });
}

// Removidos helpers redundantes: usar listCursosInstrutor diretamente

export async function reativarCursosInstrutor(instrutorId: string, cursos?: string[]){
  return withClient(async c => {
    // Usa função SQL se existir, caso contrário fallback simples
    try {
      const r = await c.query('select course_service.reativar_meus_cursos($1,$2) as payload',[instrutorId, cursos || null]);
      return r.rows[0].payload;
    } catch {
      // Fallback: update direto
      if(cursos && cursos.length){
        await c.query('update course_service.cursos set ativo=true where instrutor_id=$1 and codigo = any($2::text[])',[instrutorId, cursos]);
      } else {
        await c.query('update course_service.cursos set ativo=true where instrutor_id=$1',[instrutorId]);
      }
      const resumo = await c.query('select count(*) filter (where ativo) as ativos, count(*) filter (where not ativo) as inativos from course_service.cursos where instrutor_id=$1',[instrutorId]);
      return { instrutor_id: instrutorId, cursos_ativos: Number(resumo.rows[0].ativos), cursos_inativos: Number(resumo.rows[0].inativos) };
    }
  });
}

