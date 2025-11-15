import { Router } from 'express';
import { 
  createCourseHandler, 
  getCourseHandler, 
  getAllCoursesHandler,
  updateCourseHandler, 
  setCourseActiveHandler, 
  duplicateCourseHandler,
} from '../controllers/courseController.js';
import { addModuleHandler, listModulesHandler, updateModuleHandler, deleteModuleHandler } from '../controllers/moduleController.js';
import { listCategoriesHandler, createCategoryHandler, updateCategoryHandler, deleteCategoryHandler } from '../controllers/categoryController.js';
import { addMaterialHandler, listMaterialsHandler, deleteMaterialHandler } from '../controllers/materialController.js';
import { getModuloCompletoHandler } from '../controllers/moduloCompostoController.js';

export const courseRouter = Router();

// Rotas de categorias
courseRouter.get('/categorias', listCategoriesHandler);
courseRouter.post('/categorias', createCategoryHandler);
courseRouter.put('/categorias/:codigo', updateCategoryHandler);
courseRouter.delete('/categorias/:codigo', deleteCategoryHandler);

// Rotas de cursos - listagem
courseRouter.get('/', getAllCoursesHandler); // Lista todos os cursos com filtros baseados no role

// Rotas de cursos - CRUD individual
courseRouter.post('/', createCourseHandler);
courseRouter.get('/:codigo', getCourseHandler);
courseRouter.patch('/:codigo', updateCourseHandler);
courseRouter.patch('/:codigo/active', setCourseActiveHandler);
courseRouter.post('/:codigo/duplicar', duplicateCourseHandler);

// Rotas de módulos
courseRouter.post('/:codigo/modulos', addModuleHandler);
courseRouter.get('/:codigo/modulos', listModulesHandler);
courseRouter.patch('/:codigo/modulos/:moduloId', updateModuleHandler);
courseRouter.delete('/modulos/:moduloId', deleteModuleHandler);

// Rotas de módulos compostos (com materiais e avaliações)
courseRouter.get('/modulos/:id/completo', getModuloCompletoHandler);

// Rotas de materiais
courseRouter.post('/modulos/:moduloId/materiais', addMaterialHandler);
courseRouter.get('/modulos/:moduloId/materiais', listMaterialsHandler);
courseRouter.delete('/materiais/:materialId', deleteMaterialHandler);
