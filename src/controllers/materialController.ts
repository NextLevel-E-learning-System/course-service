import { Request, Response, NextFunction } from 'express';
import { addMaterial, getMaterials } from '../services/materialService.js';
export async function addMaterialHandler(req:Request,res:Response,next:NextFunction){ try { const r = await addMaterial(req.params.moduloId, req.body); res.status(201).json(r);} catch(e){ next(e);} }
export async function listMaterialsHandler(req:Request,res:Response,next:NextFunction){ try { const r = await getMaterials(req.params.moduloId); res.json(r);} catch(e){ next(e);} }
