import { Router } from 'express';
import { createCourseHandler, getCourseHandler } from '../controllers/courseController.js';
export const courseRouter = Router();
courseRouter.post('/', createCourseHandler);
courseRouter.get('/:codigo', getCourseHandler);
