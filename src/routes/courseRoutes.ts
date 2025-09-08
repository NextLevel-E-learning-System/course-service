import { Router } from 'express';
import { createCourseHandler, getCourseHandler, updateCourseHandler, setCourseActiveHandler, duplicateCourseHandler } from '../controllers/courseController.js';
import { addModuleHandler, listModulesHandler, updateModuleHandler } from '../controllers/moduleController.js';
import { userContext } from '../middleware/userContext.js';
import { listCatalogHandler } from '../controllers/catalogController.js';
import { listCategoriesHandler, createCategoryHandler } from '../controllers/categoryController.js';
import { addMaterialHandler, listMaterialsHandler } from '../controllers/materialController.js';

export const courseRouter = Router();

// Middleware simples para extrair contexto de usuário (x-user-id / x-user-role)
courseRouter.use(userContext);

// Catálogo (R04)
courseRouter.get('/catalogo', listCatalogHandler);
// Categorias
courseRouter.get('/categories', listCategoriesHandler);
courseRouter.post('/categories', createCategoryHandler);

// CRUD / gerenciamento de curso (R12)
courseRouter.post('/', createCourseHandler);
courseRouter.get('/:codigo', getCourseHandler);
courseRouter.patch('/:codigo', updateCourseHandler);
courseRouter.patch('/:codigo/active', setCourseActiveHandler);
courseRouter.post('/:codigo/duplicate', duplicateCourseHandler);

// Módulos (R13)
courseRouter.post('/:codigo/modulos', addModuleHandler);
courseRouter.get('/:codigo/modulos', listModulesHandler);
courseRouter.patch('/:codigo/modulos/:moduloId', updateModuleHandler);
// Materiais do módulo
courseRouter.post('/modulos/:moduloId/materiais', addMaterialHandler);
courseRouter.get('/modulos/:moduloId/materiais', listMaterialsHandler);
