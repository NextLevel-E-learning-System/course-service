import { addModuleDb, listModulesDb, updateModuleDb } from '../repositories/moduleRepository.js';
export async function addModule(codigo:string,data:any){ const r = await addModuleDb(codigo,data); return { id:r }; }
export async function listModules(codigo:string){ return listModulesDb(codigo); }
export async function updateModule(codigo:string,moduloId:string,data:any){ await updateModuleDb(codigo,moduloId,data); return { updated:true }; }
