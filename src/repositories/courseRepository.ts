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
    try {
      const r = await c.query(`
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
        where ins.curso_id = $1
      `, [cursoId]);
      return r.rows[0] || { 
        total_inscricoes: 0, 
        total_conclusoes: 0, 
        taxa_conclusao: 0, 
        media_conclusao: null 
      };
    } catch (error) {
      console.error(`[getCourseStats] Error for course ${cursoId}:`, error);
      return { 
        total_inscricoes: 0, 
        total_conclusoes: 0, 
        taxa_conclusao: 0, 
        media_conclusao: null 
      };
    }
  });
}

export async function getCourseWithStats(codigo: string) {
  return withClient(async c => {
    try {
      console.log(`[getCourseWithStats] Fetching course ${codigo}...`);
      
      const courseResult = await c.query(`
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
        where c.codigo = $1
      `, [codigo]);

      if (!courseResult.rows[0]) {
        console.log(`[getCourseWithStats] Course ${codigo} not found`);
        return null;
      }

      const course = courseResult.rows[0];

      const stats = await getCourseStats(codigo);

      const modulesResult = await c.query(`
        select m.id, m.titulo, m.ordem, m.obrigatorio, m.xp_modulo as xp, 
               m.conteudo, m.tipo_conteudo
        from course_service.modulos m
        where m.curso_id = $1
        order by m.ordem asc
      `, [codigo]);

      console.log(`[getCourseWithStats] Successfully fetched course ${codigo} with ${modulesResult.rows.length} modules`);

        // Soma do xp dos módulos
        const xpTotal = modulesResult.rows.reduce((acc, mod) => acc + (mod.xp || 0), 0);
        return {
          ...course,
          ...stats,
          xp_oferecido: xpTotal,
          modulos: modulesResult.rows
        };
    } catch (error) {
      console.error(`[getCourseWithStats] Error fetching course ${codigo}:`, error);
      throw error;
    }
  });
}

export async function listAllCoursesWithStats(){
  return withClient(async c => {
    try {
      console.log('[listAllCoursesWithStats] Starting query...');
      
      // Primeiro, buscar cursos básicos - simplificar query para evitar problemas de join
      const coursesResult = await c.query(`
        select c.codigo, c.titulo, c.descricao, c.categoria_id, c.instrutor_id, 
               c.duracao_estimada, c.xp_oferecido, c.nivel_dificuldade, c.ativo, 
               c.pre_requisitos, c.criado_em, c.atualizado_em
        from course_service.cursos c
        order by c.ativo desc, c.atualizado_em desc
      `);
      
      console.log(`[listAllCoursesWithStats] Found ${coursesResult.rows.length} courses`);
      
      // Para cada curso, buscar dados relacionados, estatísticas e módulos
      const coursesWithStats = await Promise.all(
        coursesResult.rows.map(async (course) => {
          try {
            // Buscar dados da categoria
            let categoryData = { categoria_nome: null, departamento_codigo: null };
            if (course.categoria_id) {
              try {
                const catResult = await c.query(`
                  select nome as categoria_nome, departamento_codigo
                  from course_service.categorias 
                  where codigo = $1
                `, [course.categoria_id]);
                if (catResult.rows[0]) {
                  categoryData = catResult.rows[0];
                }
              } catch (catError) {
                console.warn(`[listAllCoursesWithStats] Error fetching category for course ${course.codigo}:`, catError);
              }
            }

            // Buscar dados do instrutor
            let instructorData = { instrutor_nome: null };
            if (course.instrutor_id) {
              try {
                const instResult = await c.query(`
                  select f.nome as instrutor_nome
                  from user_service.instrutores i
                  join user_service.funcionarios f on i.funcionario_id = f.id
                  where i.funcionario_id = $1
                `, [course.instrutor_id]);
                if (instResult.rows[0]) {
                  instructorData = instResult.rows[0];
                }
              } catch (instError) {
                console.warn(`[listAllCoursesWithStats] Error fetching instructor for course ${course.codigo}:`, instError);
              }
            }

            // Buscar estatísticas de progresso - com fallback se schema não existir
            let statsResult;
            try {
              statsResult = await c.query(`
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
                where ins.curso_id = $1
              `, [course.codigo]);
            } catch (progressError) {
              console.warn(`[listAllCoursesWithStats] Progress service unavailable for course ${course.codigo}:`, progressError);
              statsResult = {
                rows: [{
                  total_inscricoes: 0,
                  total_conclusoes: 0,
                  taxa_conclusao: 0,
                  media_conclusao: null
                }]
              };
            }
            
            // Buscar contagem de módulos
            let moduleCount = 0;
              // Buscar soma do xp dos módulos
              let xpTotal = 0;
            try {
              const modulesResult = await c.query(`
                select count(m.id) as total_modulos
                        , coalesce(sum(m.xp_modulo),0) as xp_total
                from course_service.modulos m
                where m.curso_id = $1
              `, [course.codigo]);
                moduleCount = modulesResult.rows[0]?.total_modulos || 0;
                xpTotal = modulesResult.rows[0]?.xp_total || 0;
            } catch (moduleError) {
              console.warn(`[listAllCoursesWithStats] Error counting modules for course ${course.codigo}:`, moduleError);
            }
            
            const stats = statsResult.rows[0] || {
              total_inscricoes: 0,
              total_conclusoes: 0,
              taxa_conclusao: 0,
              media_conclusao: null
            };
            
              return {
                ...course,
                ...categoryData,
                ...instructorData,
                total_inscricoes: Number(stats.total_inscricoes) || 0,
                total_conclusoes: Number(stats.total_conclusoes) || 0,
                taxa_conclusao: Number(stats.taxa_conclusao) || 0,
                media_conclusao: stats.media_conclusao ? Number(stats.media_conclusao) : null,
                total_modulos: Number(moduleCount) || 0,
                xp_oferecido: Number(xpTotal) || 0
              };
          } catch (error) {
            console.error(`[listAllCoursesWithStats] Error processing course ${course.codigo}:`, error);
            // Retornar curso sem estatísticas em caso de erro
            return {
              ...course,
              categoria_nome: null,
              departamento_codigo: null,
              instrutor_nome: null,
              total_inscricoes: 0,
              total_conclusoes: 0,
              taxa_conclusao: 0,
              media_conclusao: null,
              total_modulos: 0
            };
          }
        })
      );
      
      console.log('[listAllCoursesWithStats] Query completed successfully');
      return coursesWithStats;
    } catch (error) {
      console.error('[listAllCoursesWithStats] Database error:', error);
      throw error;
    }
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
