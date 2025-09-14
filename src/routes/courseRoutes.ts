import { Router } from 'express';
import { createCourseHandler, getCourseHandler, updateCourseHandler, setCourseActiveHandler, duplicateCourseHandler, listMyCoursesUnifiedHandler, reactivateMyCoursesUnifiedHandler } from '../controllers/courseController.js';
import { addModuleHandler, listModulesHandler, updateModuleHandler } from '../controllers/moduleController.js';
import { userContext } from '../middleware/userContext.js';
import { listCatalogHandler } from '../controllers/catalogController.js';
import { listCategoriesHandler, createCategoryHandler } from '../controllers/categoryController.js';
import { addMaterialHandler, listMaterialsHandler } from '../controllers/materialController.js';

export const courseRouter = Router();

courseRouter.use(userContext);

courseRouter.get('/catalogo', listCatalogHandler);
courseRouter.get('/categories', listCategoriesHandler);
courseRouter.post('/categories', createCategoryHandler);

courseRouter.post('/', createCourseHandler);
courseRouter.get('/:codigo', getCourseHandler);
courseRouter.patch('/:codigo', updateCourseHandler);
courseRouter.patch('/:codigo/active', setCourseActiveHandler);
courseRouter.post('/:codigo/duplicar', duplicateCourseHandler);

courseRouter.post('/:codigo/modulos', addModuleHandler);
courseRouter.get('/:codigo/modulos', listModulesHandler);
courseRouter.patch('/:codigo/modulos/:moduloId', updateModuleHandler);
courseRouter.post('/modulos/:moduloId/materiais', addMaterialHandler);
courseRouter.get('/modulos/:moduloId/materiais', listMaterialsHandler);

courseRouter.get('/me', listMyCoursesUnifiedHandler);
courseRouter.patch('/me/reativar', reactivateMyCoursesUnifiedHandler);

