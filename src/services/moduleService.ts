import { addModuleDb, listModulesDb, updateModuleDb } from '../repositories/moduleRepository.js';

interface ModuleInput { titulo: string; conteudo?: string; ordem?: number; obrigatorio?: boolean; xp?: number; tipo_conteudo?: string; }

export async function addModule(codigo:string,data:ModuleInput){
	const id = await addModuleDb(codigo,data);
	return { id, ...data };
}

export async function listModules(codigo:string){
	return listModulesDb(codigo);
}

export async function updateModule(codigo:string,moduloId:string,data:Partial<ModuleInput>){
	await updateModuleDb(codigo,moduloId,data);
	return { id: moduloId, ...data };
}
