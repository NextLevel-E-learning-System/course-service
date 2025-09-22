import { Router } from 'express';
import { 
  createCourseHandler, 
  getCourseHandler, 
  getAllCoursesHandler,
  getCoursesByCategoryHandler,
  getCoursesByDepartmentHandler,
  updateCourseHandler, 
  setCourseActiveHandler, 
  duplicateCourseHandler,
  deleteCourseHandler,
} from '../controllers/courseController.js';
import { addModuleHandler, listModulesHandler, updateModuleHandler } from '../controllers/moduleController.js';
import { listCategoriesHandler, getCategoryHandler, createCategoryHandler, updateCategoryHandler, deleteCategoryHandler } from '../controllers/categoryController.js';
import { addMaterialHandler, listMaterialsHandler } from '../controllers/materialController.js';

export const courseRouter = Router();

// Rotas de categorias
courseRouter.get('/categorias', listCategoriesHandler);
courseRouter.post('/categorias', createCategoryHandler);
courseRouter.get('/categorias/:codigo', getCategoryHandler);
courseRouter.put('/categorias/:codigo', updateCategoryHandler);
courseRouter.delete('/categorias/:codigo', deleteCategoryHandler);

// Rotas de cursos - listagem
courseRouter.get('/', getAllCoursesHandler); // Lista todos os cursos com filtros baseados no role
courseRouter.get('/categoria/:categoriaId', getCoursesByCategoryHandler); // Lista cursos por categoria
courseRouter.get('/departamento/:departmentCode', getCoursesByDepartmentHandler); // Lista cursos por departamento

// Rotas de cursos - CRUD individual
courseRouter.post('/', createCourseHandler);
courseRouter.get('/:codigo', getCourseHandler);
courseRouter.patch('/:codigo', updateCourseHandler);
courseRouter.patch('/:codigo/active', setCourseActiveHandler);
courseRouter.post('/:codigo/duplicar', duplicateCourseHandler);
courseRouter.delete('/:codigo', deleteCourseHandler);

// Rotas de módulos
courseRouter.post('/:codigo/modulos', addModuleHandler);
courseRouter.get('/:codigo/modulos', listModulesHandler);
courseRouter.patch('/:codigo/modulos/:moduloId', updateModuleHandler);

// Rotas de materiais
courseRouter.post('/modulos/:moduloId/materiais', addMaterialHandler);
courseRouter.get('/modulos/:moduloId/materiais', listMaterialsHandler);
