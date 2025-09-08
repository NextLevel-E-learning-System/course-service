import { Request, Response, NextFunction } from 'express';
import { getEmployeeDashboard, getInstructorDashboard, getAdminDashboard } from '../services/dashboardService.js';

export async function employeeDashboardHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    
    // Determina qual dashboard mostrar baseado no role
    if (user.roles?.includes('ADMIN')) {
      const result = await getAdminDashboard();
      res.json(result);
    } else if (user.roles?.includes('INSTRUTOR')) {
      const result = await getInstructorDashboard(user.id);
      res.json(result);
    } else {
      // FUNCIONARIO ou default
      const result = await getEmployeeDashboard(user.id);
      res.json(result);
    }
  } catch (e) {
    next(e);
  }
}
