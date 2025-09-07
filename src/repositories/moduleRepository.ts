import { withClient } from '../db.js';
interface ModuleInput { titulo: string; conteudo?: string; ordem?: number; obrigatorio?: boolean; xp?: number; tipo_conteudo?: string; }
export async function addModuleDb(codigo:string,data:ModuleInput){
  return withClient(async c => {
    const ordem = data.ordem || (await c.query('select coalesce(max(ordem),0)+1 as next from course_service.modulos where curso_id=$1',[codigo])).rows[0].next;
    const r = await c.query('insert into course_service.modulos (curso_id, ordem, titulo, conteudo, tipo_conteudo, obrigatorio, xp_modulo) values ($1,$2,$3,$4,$5,$6,$7) returning id',[codigo,ordem,data.titulo,data.conteudo||null,data.tipo_conteudo||null, data.obrigatorio!==false, data.xp||0]);
    return r.rows[0].id;
  });
}
export async function listModulesDb(codigo:string){
  return withClient(c=>c.query('select id,titulo,ordem,obrigatorio,xp_modulo as xp from course_service.modulos where curso_id=$1 order by ordem asc',[codigo]).then(r=>r.rows));
}
export async function updateModuleDb(_codigo:string,moduloId:string,data:Partial<ModuleInput>){
  const fields:string[] = []; const values:unknown[] = []; let idx=1;
  const map: Record<string,string> = { xp: 'xp_modulo' };
  const record = data as Record<string, unknown>;
  for (const k of ['titulo','conteudo','ordem','obrigatorio','xp','tipo_conteudo']){
    if(k in record){ const col = map[k] || k; fields.push(`${col}=$${idx++}`); values.push(record[k]); }
  }
  if(!fields.length) return;
  values.push(moduloId);
  await withClient(c=>c.query(`update course_service.modulos set ${fields.join(', ')} where id=$${idx}` , values));
}
