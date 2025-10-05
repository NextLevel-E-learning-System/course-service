import { withClient } from '../db.js';

export async function insertMaterial(d:{ modulo_id:string; nome_arquivo:string; tipo_arquivo:string; storage_key:string; tamanho?:number }){
  return withClient(async c => {
    const r = await c.query('insert into course_service.materiais (modulo_id,nome_arquivo,tipo_arquivo,storage_key,tamanho) values ($1,$2,$3,$4,$5) returning id',[d.modulo_id,d.nome_arquivo,d.tipo_arquivo,d.storage_key,d.tamanho||null]);
    return r.rows[0];
  });
}

export async function listMaterials(moduloId:string){
  return withClient(async c=>{ 
    const r = await c.query('select id, modulo_id, nome_arquivo, tipo_arquivo, storage_key, tamanho, criado_em from course_service.materiais where modulo_id=$1 order by criado_em desc',[moduloId]); 
    return r.rows; 
  });
}

export async function deleteMaterial(materialId: string) {
  return withClient(async c => {
    // Primeiro busca o material para pegar a storage_key
    const material = await c.query('select storage_key from course_service.materiais where id = $1', [materialId]);
    if (material.rows.length === 0) {
      throw new Error('Material não encontrado');
    }
    
    // Deleta do banco
    await c.query('delete from course_service.materiais where id = $1', [materialId]);
    
    return material.rows[0].storage_key;
  });
}
