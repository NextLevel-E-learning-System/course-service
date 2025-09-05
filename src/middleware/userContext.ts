import { Request, Response, NextFunction } from 'express';

// Middleware simples: extrai cabeçalhos x-user-id e x-user-role (mock de autenticação via gateway)
export function userContext(req: Request, _res: Response, next: NextFunction) {
  const userId = req.header('x-user-id');
  const role = req.header('x-user-role');
  (req as any).user = { id: userId || null, role: role || 'EMPLOYEE' };
  next();
}
