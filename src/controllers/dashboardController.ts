import { Request, Response, NextFunction } from 'express';
import { getEmployeeDashboard } from '../services/dashboardService.js';
export async function employeeDashboardHandler(req:Request,res:Response,next:NextFunction){
  try { const user = (req as any).user; const r = await getEmployeeDashboard(user.id); res.json(r);} catch(e){ next(e);} }
