import { insertMaterial, listMaterials } from '../repositories/materialRepository.js';
import { HttpError } from '../utils/httpError.js';
const allowed = new Set(['pdf','video','presentation']);
export async function addMaterial(moduloId:string,data:any){
  if(!allowed.has((data.tipo_arquivo||'').toLowerCase())) throw new HttpError(400,'tipo_invalido');
  await insertMaterial({ modulo_id: moduloId, nome_arquivo: data.nome_arquivo, tipo_arquivo: data.tipo_arquivo, url_storage: data.url_storage, tamanho: data.tamanho });
  return { created:true };
}
export async function getMaterials(moduloId:string){ return listMaterials(moduloId); }
