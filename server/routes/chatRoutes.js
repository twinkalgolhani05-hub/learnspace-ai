import express from 'express';
import {
  chatWithTutor,
  streamChatWithTutor,
  uploadStudyDocument,
  documentUploadMiddleware,
  saveNote,
  getSavedNotes,
  deleteNote,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, chatWithTutor);
router.post('/stream', protect, streamChatWithTutor);
router.post('/upload', protect, documentUploadMiddleware, uploadStudyDocument);
router.post('/notes', protect, saveNote);
router.get('/notes', protect, getSavedNotes);
router.delete('/notes/:id', protect, deleteNote);

export default router;
