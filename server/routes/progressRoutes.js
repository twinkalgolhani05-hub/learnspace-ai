import express from 'express';
import { getStudentProgress } from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getStudentProgress);

export default router;

