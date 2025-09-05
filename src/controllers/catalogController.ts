import { Request, Response, NextFunction } from 'express';
import { listCatalog } from '../services/catalogService.js';
export async function listCatalogHandler(req:Request,res:Response,next:NextFunction){
  try {
    const r = await listCatalog({
      q: req.query.q as string|undefined,
      categoria: req.query.categoria as string|undefined,
      instrutor: req.query.instrutor as string|undefined,
      nivel: req.query.nivel as string|undefined,
      duracaoMax: req.query.duracaoMax ? Number(req.query.duracaoMax) : undefined
    });
    res.json(r);
  } catch(e){ next(e);} }
