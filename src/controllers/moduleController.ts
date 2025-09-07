import { Request, Response, NextFunction } from 'express';
import { addModule, listModules, updateModule } from '../services/moduleService.js';
export async function addModuleHandler(req:Request,res:Response,next:NextFunction){
  try { const r = await addModule(req.params.codigo, req.body); res.status(201).json(r);} catch(e){ next(e);} }
export async function listModulesHandler(req:Request,res:Response,next:NextFunction){
  try { const r = await listModules(req.params.codigo); res.json(r);} catch(e){ next(e);} }
export async function updateModuleHandler(req:Request,res:Response,next:NextFunction){
  try { const r = await updateModule(req.params.codigo, req.params.moduloId, req.body); res.json(r);} catch(e){ next(e);} }
