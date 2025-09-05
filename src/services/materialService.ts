import { insertMaterial, listMaterials } from '../repositories/materialRepository.js';
import { uploadObject, getPresignedUrl } from '../utils/storageClient.js';
import { HttpError } from '../utils/httpError.js';
const allowed = new Set(['pdf','video','presentation']);
interface AddMaterialInput { nome_arquivo:string; tipo_arquivo:string; url_storage?:string; tamanho?:number; base64?:string }
export async function addMaterial(moduloId:string,data: AddMaterialInput){
  const tipo = (data.tipo_arquivo||'').toLowerCase();
  if(!allowed.has(tipo)) throw new HttpError(400,'tipo_invalido');
  let url_storage = data.url_storage || null;
  if(data.base64){
    const bucket = process.env.STORAGE_BUCKET_MATERIAIS || 'courses-materials';
    const buffer = Buffer.from(data.base64,'base64');
    const key = `materials/${moduloId}/${Date.now()}-${data.nome_arquivo}`;
    await uploadObject({ bucket, key, body: buffer, contentType: mapContentType(tipo) });
    url_storage = key; // armazenamos a key; download depois gera presigned
  }
  await insertMaterial({ modulo_id: moduloId, nome_arquivo: data.nome_arquivo, tipo_arquivo: data.tipo_arquivo, storage_key: url_storage || '', tamanho: data.tamanho });
  return { created:true };
}
export async function getMaterials(moduloId:string){
  const list = await listMaterials(moduloId);
  const bucket = process.env.STORAGE_BUCKET_MATERIAIS || 'courses-materials';
  return Promise.all(list.map(async m=>{
    if(m.storage_key){
      const signed = await getPresignedUrl(bucket, m.storage_key, 300);
      return { ...m, download_url: signed };
    }
    return m;
  }));
}

function mapContentType(tipo:string){
  switch(tipo){
    case 'pdf': return 'application/pdf';
    case 'video': return 'video/mp4';
    case 'presentation': return 'application/vnd.ms-powerpoint';
    default: return 'application/octet-stream';
  }
}
