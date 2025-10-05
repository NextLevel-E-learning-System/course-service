import { Request, Response, NextFunction } from 'express';
import { addModule, listModules, updateModule, deleteModule } from '../services/moduleService.js';

export async function addModuleHandler(req:Request,res:Response,next:NextFunction){
  try {
    const modulo = await addModule(req.params.codigo, req.body);
    res.status(201).json({ modulo, mensagem: 'Módulo criado com sucesso' });
  } catch(e){ next(e); }
}

export async function listModulesHandler(req:Request,res:Response,next:NextFunction){
  try {
    const modulos = await listModules(req.params.codigo);
    res.json({ items: modulos, mensagem: 'Módulos listados com sucesso' });
  } catch(e){ next(e); }
}

export async function updateModuleHandler(req:Request,res:Response,next:NextFunction){
  try {
    const modulo = await updateModule(req.params.codigo, req.params.moduloId, req.body);
    if (!modulo) return res.status(404).json({ erro: 'modulo_nao_encontrado', mensagem: 'Módulo não encontrado' });
    res.json({ modulo, mensagem: 'Módulo atualizado com sucesso' });
  } catch(e){ next(e); }
}

export async function deleteModuleHandler(req:Request,res:Response,next:NextFunction){
  try {
    await deleteModule(req.params.moduloId);
    res.json({ mensagem: 'Módulo deletado com sucesso' });
  } catch(e){ next(e); }
}
