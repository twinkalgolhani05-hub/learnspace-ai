import express from 'express';
import {
  getQuizzes,
  getQuizById,
  submitQuiz,
  generateCustomQuiz,
} from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getQuizzes);
router.post('/generate', generateCustomQuiz);
router.get('/:id', getQuizById);
router.post('/:id/submit', submitQuiz);

export default router;
