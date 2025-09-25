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

export async function listAllCourses(){
  return withClient(async c => {
    const r = await c.query(`
      select c.codigo, c.titulo, c.descricao, c.categoria_id, c.instrutor_id, 
             c.duracao_estimada, c.xp_oferecido, c.nivel_dificuldade, c.ativo, 
             c.pre_requisitos, c.criado_em, c.atualizado_em,
             cat.nome as categoria_nome,
             cat.departamento_codigo,
             f.nome as instrutor_nome
      from course_service.cursos c
      left join course_service.categorias cat on c.categoria_id = cat.codigo
      left join user_service.instrutores i on c.instrutor_id = i.funcionario_id
      left join user_service.funcionarios f on i.funcionario_id = f.id
      order by c.ativo desc, c.atualizado_em desc
    `);
    return r.rows;
  });
}

export async function listCoursesByCategory(categoriaId: string){
  return withClient(async c => {
    const r = await c.query(`
      select c.codigo, c.titulo, c.descricao, c.categoria_id, c.instrutor_id, 
             c.duracao_estimada, c.xp_oferecido, c.nivel_dificuldade, c.ativo, 
             c.pre_requisitos, c.criado_em, c.atualizado_em,
             cat.nome as categoria_nome,
             cat.departamento_codigo,
             f.nome as instrutor_nome
      from course_service.cursos c
      left join course_service.categorias cat on c.categoria_id = cat.codigo
      left join user_service.instrutores i on c.instrutor_id = i.funcionario_id
      left join user_service.funcionarios f on i.funcionario_id = f.id
      where c.categoria_id = $1
      order by c.ativo desc, c.atualizado_em desc
    `, [categoriaId]);
    return r.rows;
  });
}

export async function listCoursesByDepartment(departmentCode: string){
  return withClient(async c => {
    const r = await c.query(`
      select c.codigo, c.titulo, c.descricao, c.categoria_id, c.instrutor_id, 
             c.duracao_estimada, c.xp_oferecido, c.nivel_dificuldade, c.ativo, 
             c.pre_requisitos, c.criado_em, c.atualizado_em,
             cat.nome as categoria_nome,
             cat.departamento_codigo,
             f.nome as instrutor_nome
      from course_service.cursos c
      left join course_service.categorias cat on c.categoria_id = cat.codigo
      left join user_service.instrutores i on c.instrutor_id = i.funcionario_id
      left join user_service.funcionarios f on i.funcionario_id = f.id
      where cat.departamento_codigo = $1
      order by c.ativo desc, c.atualizado_em desc
    `, [departmentCode]);
    return r.rows;
  });
}

export async function getCourseStats(cursoId: string) {
  return withClient(async c => {
    const r = await c.query(`
      select 
        count(i.id) as total_inscricoes,
        count(case when i.status = 'CONCLUIDO' then 1 end) as total_conclusoes,
        case 
          when count(i.id) > 0 then 
            round((count(case when i.status = 'CONCLUIDO' then 1 end) * 100.0 / count(i.id))::numeric, 2)
          else 0 
        end as taxa_conclusao,
        avg(case when i.status = 'CONCLUIDO' then i.progresso_percentual end) as media_conclusao
      from progress_service.inscricoes i
      where i.curso_id = $1
    `, [cursoId]);
    return r.rows[0] || { 
      total_inscricoes: 0, 
      total_conclusoes: 0, 
      taxa_conclusao: 0, 
      media_conclusao: null 
    };
  });
}

export async function getCourseWithStats(codigo: string) {
  return withClient(async c => {
    const courseResult = await c.query(`
      select c.codigo, c.titulo, c.descricao, c.categoria_id, c.instrutor_id, 
             c.duracao_estimada, c.xp_oferecido, c.nivel_dificuldade, c.ativo, 
             c.pre_requisitos, c.criado_em, c.atualizado_em,
             cat.nome as categoria_nome,
             cat.departamento_codigo,
             f.nome as instrutor_nome,
             f.sobrenome as instrutor_sobrenome
      from course_service.cursos c
      left join course_service.categorias cat on c.categoria_id = cat.codigo
      left join user_service.instrutores i on c.instrutor_id = i.funcionario_id
      left join user_service.funcionarios f on i.funcionario_id = f.id
      where c.codigo = $1
    `, [codigo]);

    if (!courseResult.rows[0]) return null;

    const course = courseResult.rows[0];

    const stats = await getCourseStats(codigo);

    const modulesResult = await c.query(`
      select m.id, m.titulo, m.ordem, m.obrigatorio, m.xp_modulo as xp, 
             m.conteudo, m.tipo_conteudo
      from course_service.modulos m
      where m.curso_id = $1
      order by m.ordem asc
    `, [codigo]);

    return {
      ...course,
      ...stats,
      modulos: modulesResult.rows
    };
  });
}

export async function listAllCoursesWithStats(){
  return withClient(async c => {
    const r = await c.query(`
      select c.codigo, c.titulo, c.descricao, c.categoria_id, c.instrutor_id, 
             c.duracao_estimada, c.xp_oferecido, c.nivel_dificuldade, c.ativo, 
             c.pre_requisitos, c.criado_em, c.atualizado_em,
             cat.nome as categoria_nome,
             cat.departamento_codigo,
             f.nome as instrutor_nome,
             f.sobrenome as instrutor_sobrenome,
             coalesce(stats.total_inscricoes, 0) as total_inscricoes,
             coalesce(stats.total_conclusoes, 0) as total_conclusoes,
             coalesce(stats.taxa_conclusao, 0) as taxa_conclusao,
             stats.media_conclusao,
             coalesce(mod_count.total_modulos, 0) as total_modulos
      from course_service.cursos c
      left join course_service.categorias cat on c.categoria_id = cat.codigo
      left join user_service.instrutores i on c.instrutor_id = i.funcionario_id
      left join user_service.funcionarios f on i.funcionario_id = f.id
      left join lateral (
        select 
          count(ins.id) as total_inscricoes,
          count(case when ins.status = 'CONCLUIDO' then 1 end) as total_conclusoes,
          case 
            when count(ins.id) > 0 then 
              round((count(case when ins.status = 'CONCLUIDO' then 1 end) * 100.0 / count(ins.id))::numeric, 2)
            else 0 
          end as taxa_conclusao,
          avg(case when ins.status = 'CONCLUIDO' then ins.progresso_percentual end) as media_conclusao
        from progress_service.inscricoes ins
        where ins.curso_id = c.codigo
      ) stats on true
      left join lateral (
        select count(m.id) as total_modulos
        from course_service.modulos m
        where m.curso_id = c.codigo
      ) mod_count on true
      order by c.ativo desc, c.atualizado_em desc
    `);
    return r.rows;
  });
}

export async function getCourseModules(cursoId: string) {
  return withClient(async c => {
    const r = await c.query(`
      select m.id, m.titulo, m.ordem, m.obrigatorio, m.xp_modulo as xp, 
             m.conteudo, m.tipo_conteudo, m.criado_em, m.atualizado_em
      from course_service.modulos m
      where m.curso_id = $1
      order by m.ordem asc
    `, [cursoId]);
    return r.rows;
  });
}
