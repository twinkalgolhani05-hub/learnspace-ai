import multer from 'multer';
import path from 'node:path';
import { generateTutorResponse, streamTutorResponse } from '../services/geminiService.js';
import {
  extractDocumentContent,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} from '../services/documentService.js';
import Progress from '../models/Progress.js';
import SavedNote from '../models/SavedNote.js';
import UploadedDocument from '../models/UploadedDocument.js';

// Configure multer memory storage with strict validation
const uploadStorage = multer.memoryStorage();
export const documentUploadMiddleware = multer({
  storage: uploadStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();

    const extAllowed = ALLOWED_EXTENSIONS.includes(ext);
    const mimeAllowed =
      ALLOWED_MIME_TYPES.includes(mime) ||
      mime.startsWith('image/') ||
      mime.includes('presentation') ||
      mime.includes('pdf');

    if (extAllowed || mimeAllowed) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type "${ext || mime}". Supported formats: PDF, PPT, PPTX, TXT, JPG, PNG.`
        ),
        false
      );
    }
  },
}).single('file');

const validateChatInput = (message, documentText, imageData) => {
  if ((!message || typeof message !== 'string' || !message.trim()) && !documentText && !imageData) {
    return 'Please enter a valid question, prompt, or upload a document for the AI Tutor.';
  }
  if (message && message.trim().length > 10000) {
    return 'Message is too long. Please keep questions under 10,000 characters.';
  }
  return null;
};

/**
 * Handle multipart file upload for AI Tutor & Quiz Generator
 */
export const uploadStudyDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a valid PDF, PPT/PPTX, TXT, or Image file.',
      });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    // Extract text / prepare image data safely
    const extracted = await extractDocumentContent({
      buffer,
      originalName: originalname,
      mimeType: mimetype,
    });

    const docRecord = await UploadedDocument.create({
      user: req.user._id,
      originalName: originalname,
      mimeType: mimetype,
      size,
      pageCount: extracted.pageCount || 1,
      extractedText: extracted.text.slice(0, 25000),
    });

    await Progress.create({
      user: req.user._id,
      actionType: 'document_uploaded',
      title: `Attached study document: "${originalname}"`,
      details: `${Math.round(size / 1024)} KB • ${extracted.pageCount || 1} pages/slides`,
    });

    res.status(200).json({
      success: true,
      message: 'Document uploaded and processed successfully.',
      document: {
        _id: docRecord._id,
        originalName: originalname,
        mimeType: mimetype,
        size,
        pageCount: extracted.pageCount || 1,
        isImage: extracted.isImage,
        imageData: extracted.imageData,
        extractedPreview: extracted.text.slice(0, 500),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Standard non-streaming chat with AI Tutor
 */
export const chatWithTutor = async (req, res, next) => {
  try {
    const {
      message = '',
      history = [],
      courseContext = '',
      mode = 'ask_explain',
      summaryStyle = 'detailed',
      summaryLength = 'medium',
      answerStyle = 'simple',
      questionType = 'exam-questions',
      questionCount = 5,
      difficulty = 'Medium',
      preciseAction = 'shorten',
      documentId = null,
      documentText = '',
      imageData = null,
    } = req.body;

    let attachedText = documentText || '';
    if (documentId && !attachedText) {
      const doc = await UploadedDocument.findOne({ _id: documentId, user: req.user._id });
      if (doc) attachedText = doc.extractedText;
    }

    const validationError = validateChatInput(message, attachedText, imageData);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const result = await generateTutorResponse({
      message: message.trim(),
      history,
      courseContext,
      mode,
      summaryStyle,
      summaryLength,
      answerStyle,
      questionType,
      questionCount,
      difficulty,
      preciseAction,
      documentText: attachedText,
      imageData,
    });

    const modeLabels = {
      summary: 'Generated Summary',
      ask_explain: 'Asked AI Tutor',
      qa_generator: 'Generated Exam Q&A',
      make_precise: 'Made Content Precise',
    };

    await Progress.create({
      user: req.user._id,
      actionType: 'ai_tutor_query',
      title: `${modeLabels[mode] || 'AI Tutor'}: "${(message || 'Attached Document').trim().slice(0, 50)}"`,
      details: courseContext ? `Topic: ${courseContext}` : 'General Computer Science',
    });

    res.status(200).json({
      success: true,
      reply: result.reply,
      model: result.model,
      liveApi: result.liveApi,
      notice: result.notice,
      mode,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Server-Sent Events (SSE) streaming chat with AI Tutor
 */
export const streamChatWithTutor = async (req, res) => {
  const {
    message = '',
    history = [],
    courseContext = '',
    mode = 'ask_explain',
    summaryStyle = 'detailed',
    summaryLength = 'medium',
    answerStyle = 'simple',
    questionType = 'exam-questions',
    questionCount = 5,
    difficulty = 'Medium',
    preciseAction = 'shorten',
    documentId = null,
    documentText = '',
    imageData = null,
  } = req.body;

  let attachedText = documentText || '';
  if (documentId && !attachedText) {
    try {
      const doc = await UploadedDocument.findOne({ _id: documentId, user: req.user._id });
      if (doc) attachedText = doc.extractedText;
    } catch {
      // ignore
    }
  }

  const validationError = validateChatInput(message, attachedText, imageData);
  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let clientAborted = false;
  req.on('close', () => {
    clientAborted = true;
  });

  const sendEvent = (payload) => {
    if (!clientAborted && !res.writableEnded) {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  };

  try {
    await streamTutorResponse(
      {
        message: message.trim(),
        history,
        courseContext,
        mode,
        summaryStyle,
        summaryLength,
        answerStyle,
        questionType,
        questionCount,
        difficulty,
        preciseAction,
        documentText: attachedText,
        imageData,
      },
      {
        shouldAbort: () => clientAborted,
        onMeta: (meta) => {
          sendEvent({ type: 'meta', mode, ...meta });
        },
        onChunk: (textChunk) => {
          sendEvent({ type: 'chunk', text: textChunk });
        },
        onDone: async (finalText) => {
          sendEvent({ type: 'done', timestamp: new Date().toISOString() });
          if (!res.writableEnded) {
            res.end();
          }
          try {
            const modeLabels = {
              summary: 'Summary Generator',
              ask_explain: 'Ask & Explain',
              qa_generator: 'Q&A Generator',
              make_precise: 'Make It Precise',
            };
            await Progress.create({
              user: req.user._id,
              actionType: 'ai_tutor_query',
              title: `${modeLabels[mode] || 'AI Tutor'}: "${(message || 'Attached document').trim().slice(0, 50)}"`,
              details: courseContext ? `Course: ${courseContext}` : 'General CS session',
            });
          } catch {
            // ignore
          }
        },
      }
    );
  } catch (err) {
    sendEvent({
      type: 'error',
      message: err.message || 'Streaming interrupted.',
    });
    if (!res.writableEnded) {
      res.end();
    }
  }
};

/**
 * Save a generated note to student's notebook in MongoDB
 */
export const saveNote = async (req, res, next) => {
  try {
    const { title, content, mode = 'general', style = '', courseContext = '', sourceDocument = '', tags = [] } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required to save a note.',
      });
    }

    const note = await SavedNote.create({
      user: req.user._id,
      title: title.trim(),
      content: content.trim(),
      mode,
      style,
      courseContext: courseContext || 'General Computer Science',
      sourceDocument: sourceDocument || '',
      tags: Array.isArray(tags) ? tags : [],
    });

    await Progress.create({
      user: req.user._id,
      actionType: 'note_saved',
      title: `Saved study note: "${title.trim().slice(0, 50)}"`,
      details: `Mode: ${mode} • ${courseContext || 'Computer Science'}`,
    });

    res.status(201).json({
      success: true,
      message: 'Note saved successfully to your notebook!',
      note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all saved notes for the authenticated student
 */
export const getSavedNotes = async (req, res, next) => {
  try {
    const notes = await SavedNote.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a saved note
 */
export const deleteNote = async (req, res, next) => {
  try {
    const note = await SavedNote.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    await SavedNote.deleteMany({ _id: req.params.id, user: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
