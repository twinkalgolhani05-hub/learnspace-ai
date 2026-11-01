import express from 'express';
import {
  getLessonById,
  completeLesson,
} from '../controllers/lessonController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/:id', getLessonById);
router.post('/:id/complete', completeLesson);

export default router;

