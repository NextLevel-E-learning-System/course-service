import { withClient } from '../db.js';
import { CatalogFilters, CatalogItem } from '../types/domain.js';
export async function searchCatalog(filters:CatalogFilters): Promise<CatalogItem[]>{
  const clauses:string[] = ['c.ativo = true'];
  const values:unknown[] = []; let idx=1;
  if(filters.q){ clauses.push('(c.titulo ilike $'+idx+' or c.descricao ilike $'+idx+')'); values.push('%'+filters.q+'%'); idx++; }
  if(filters.categoria){ clauses.push('c.categoria_id = $'+idx); values.push(filters.categoria); idx++; }
  if(filters.instrutor){ clauses.push('c.instrutor_id = $'+idx); values.push(filters.instrutor); idx++; }
  if(filters.nivel){ clauses.push('c.nivel_dificuldade = $'+idx); values.push(filters.nivel); idx++; }
  if(filters.duracaoMax){ clauses.push('(c.duracao_estimada <= $'+idx+' or c.duracao_estimada is null)'); values.push(filters.duracaoMax); idx++; }
  const sql = `select c.codigo,c.titulo,c.descricao,c.duracao_estimada,c.xp_oferecido,c.nivel_dificuldade,c.pre_requisitos
    from course_service.cursos c
    where ${clauses.join(' and ')}
    order by c.titulo asc limit 100`;
  return withClient(c=>c.query(sql,values).then(r=>r.rows.map(row=>({ ...row, prerequisitos_pendentes: [] }))));
}
