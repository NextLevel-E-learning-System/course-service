import { withClient } from '../db.js';

export async function insertMaterial(d:{ modulo_id:string; nome_arquivo:string; tipo_arquivo:string; url_storage:string; tamanho?:number }){
  await withClient(c=>c.query('insert into course_service.materiais (modulo_id,nome_arquivo,tipo_arquivo,url_storage,tamanho) values ($1,$2,$3,$4,$5)', [d.modulo_id,d.nome_arquivo,d.tipo_arquivo,d.url_storage,d.tamanho||null]));
}

export async function listMaterials(moduloId:string){
  return withClient(async c=>{ const r = await c.query('select id, modulo_id, nome_arquivo, tipo_arquivo, url_storage, tamanho, criado_em from course_service.materiais where modulo_id=$1 order by criado_em desc',[moduloId]); return r.rows; });
}
