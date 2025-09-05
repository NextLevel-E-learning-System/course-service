import { insertCategory, listCategories } from '../repositories/categoryRepository.js';
import { HttpError } from '../utils/httpError.js';
export async function getCategories(){ return listCategories(); }
export async function createCategory(d:any){ try { await insertCategory(d); return { codigo:d.codigo }; } catch(err:any){ if(err.code==='23505') throw new HttpError(409,'duplicado'); throw err; } }
