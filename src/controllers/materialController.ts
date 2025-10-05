import { Request, Response, NextFunction } from 'express';
import { addMaterial, getMaterials, removeMaterial } from '../services/materialService.js';

export async function addMaterialHandler(req:Request,res:Response,next:NextFunction){
	try {
		const result = await addMaterial(req.params.moduloId, req.body);
		if ('error' in result) {
			if (result.error === 'base64_obrigatorio') {
				return res.status(400).json({ erro: result.error, mensagem: 'Campo base64 é obrigatório para upload' });
			}
			if (result.error === 'tipo_invalido') {
				return res.status(400).json({ erro: result.error, mensagem: 'Tipo de arquivo não suportado' });
			}
		}
		res.status(201).json({ material: result, mensagem: 'Material adicionado com sucesso' });
	} catch(e){ next(e); }
}

export async function listMaterialsHandler(req:Request,res:Response,next:NextFunction){
	try {
		const materiais = await getMaterials(req.params.moduloId);
		res.json({ items: materiais, mensagem: 'Materiais listados com sucesso' });
	} catch(e){ next(e); }
}

export async function deleteMaterialHandler(req:Request,res:Response,next:NextFunction){
	try {
		await removeMaterial(req.params.materialId);
		res.json({ mensagem: 'Material removido com sucesso' });
	} catch(e){ next(e); }
}
