import { insertMaterial, listMaterials } from '../repositories/materialRepository.js';
import { uploadObject, getPresignedUrl } from '../utils/storageClient.js';
import { HttpError } from '../utils/httpError.js';

const allowed = new Set(['pdf','video','presentation','mp4','ppt','pptx','doc','docx']);

interface AddMaterialInput { 
  nome_arquivo: string; 
  base64: string; // Sempre obrigatório - upload direto
}

export async function addMaterial(moduloId: string, data: AddMaterialInput) {
  if (!data.base64) {
    throw new HttpError(400, 'base64_obrigatorio', 'Campo base64 é obrigatório para upload');
  }

  // Detectar tipo automaticamente pela extensão
  const extensao = data.nome_arquivo.split('.').pop()?.toLowerCase() || '';
  const tipo_arquivo = detectarTipo(extensao);
  
  if (!allowed.has(extensao)) {
    throw new HttpError(400, 'tipo_invalido', `Tipo de arquivo não suportado: ${extensao}. Tipos aceitos: pdf, video (mp4), presentation (ppt, pptx), documentos (doc, docx)`);
  }

  // Converter base64 e calcular tamanho automaticamente
  const buffer = Buffer.from(data.base64, 'base64');
  const tamanho = buffer.length;

  // Gerar storage_key automaticamente
  const timestamp = Date.now();
  const storage_key = `materials/${moduloId}/${timestamp}-${data.nome_arquivo}`;

  // Upload para storage
  const bucket = process.env.STORAGE_BUCKET_MATERIAIS || 'courses-materials';
  await uploadObject({ 
    bucket, 
    key: storage_key, 
    body: buffer, 
    contentType: mapContentType(extensao) 
  });

  // Salvar no banco com dados automáticos
  await insertMaterial({ 
    modulo_id: moduloId, 
    nome_arquivo: data.nome_arquivo, 
    tipo_arquivo, 
    storage_key, 
    tamanho 
  });

  return { 
    created: true, 
    storage_key,
    tamanho,
    tipo_arquivo
  };
}

export async function getMaterials(moduloId: string) {
  const list = await listMaterials(moduloId);
  const bucket = process.env.STORAGE_BUCKET_MATERIAIS || 'courses-materials';
  
  return Promise.all(list.map(async m => {
    if (m.storage_key) {
      const signed = await getPresignedUrl(bucket, m.storage_key, 300);
      return { ...m, download_url: signed };
    }
    return m;
  }));
}

function detectarTipo(extensao: string): string {
  switch (extensao) {
    case 'pdf': return 'pdf';
    case 'mp4': 
    case 'avi': 
    case 'mov': return 'video';
    case 'ppt': 
    case 'pptx': return 'presentation';
    case 'doc':
    case 'docx': return 'document';
    default: return 'other';
  }
}

function mapContentType(extensao: string): string {
  switch (extensao) {
    case 'pdf': return 'application/pdf';
    case 'mp4': return 'video/mp4';
    case 'avi': return 'video/avi';
    case 'mov': return 'video/quicktime';
    case 'ppt': return 'application/vnd.ms-powerpoint';
    case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default: return 'application/octet-stream';
  }
}
