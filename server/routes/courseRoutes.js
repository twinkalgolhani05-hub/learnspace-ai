import express from 'express';
import {
  getCourses,
  getCourseById,
  enrollInCourse,
} from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/:id/enroll', enrollInCourse);

export default router;

