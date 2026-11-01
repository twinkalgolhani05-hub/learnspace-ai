import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Trash2,
  Bot,
  User,
  BookOpen,
  Lightbulb,
  FileText,
  AlertCircle,
  Square,
  Cpu,
  Paperclip,
  X,
  Copy,
  Check,
  Download,
  Bookmark,
  RotateCcw,
  FileCheck,
  SlidersHorizontal,
  BookmarkCheck,
  Eye,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AIMessageRenderer from '../components/AIMessageRenderer';

const TUTOR_MODES = [
  {
    id: 'ask_explain',
    name: 'Ask & Explain',
    icon: Sparkles,
    badge: 'Concept Teacher',
    desc: 'Beginner-friendly explanations, step-by-step logic, LaTeX math & exam answers.',
  },
  {
    id: 'summary',
    name: 'Summary Generator',
    icon: FileText,
    badge: 'Quick Notes',
    desc: 'Generate chapter-wise, bullet-point, formula sheets or short exam summaries.',
  },
  {
    id: 'qa_generator',
    name: 'Q&A Generator',
    icon: Lightbulb,
    badge: 'Exam Prep',
    desc: 'Generate university exam questions, 2/4/6-mark answers, viva & MCQs.',
  },
  {
    id: 'make_precise',
    name: 'Make It Precise',
    icon: BookOpen,
    badge: 'Note Refiner',
    desc: 'Shorten notes, simplify jargon, extract key formulas, or format for 2/4/6 marks.',
  },
];

const starterPrompts = [
  {
    label: '1-to-4 Demultiplexer & Truth Table',
    course: 'General Computer Science',
    mode: 'ask_explain',
    prompt: 'Explain a 1-to-4 demultiplexer with a truth table and Boolean algebra equations.',
    icon: Cpu,
  },
  {
    label: 'Summary: BCNF & Normalization',
    course: 'CS-302: Database Management Systems',
    mode: 'summary',
    prompt: 'Generate an exam revision summary of 1NF, 2NF, 3NF, and BCNF normalization with SQL decomposition tables.',
    icon: BookOpen,
  },
  {
    label: 'University Exam Q&A on Dijkstra vs BFS',
    course: 'CS-301: Data Structures & Algorithms',
    mode: 'qa_generator',
    prompt: 'Generate 5 university examination questions with detailed model answers comparing BFS and Dijkstra algorithms.',
    icon: Lightbulb,
  },
  {
    label: 'Make Precise: TCP 3-Way Handshake',
    course: 'CS-303: Computer Networks',
    mode: 'make_precise',
    prompt: 'Convert the TCP 3-Way Handshake explanation into a concise 4-mark university exam answer with sequence numbers.',
    icon: FileText,
  },
];

const getInitialGreeting = (name) => ({
  id: 'welcome-msg',
  role: 'assistant',
  mode: 'ask_explain',
  content: `Hello **${name || 'Student'}**! Welcome to your upgraded **LearnSpace AI Tutor** powered by Google Gemini.

I can help you across **4 specialized study modes**:
1. **Ask & Explain**: Beginner-friendly explanations, step-by-step algorithms, LaTeX math, and diagrams.
2. **Summary Generator**: Very short, detailed, chapter-wise, bulleted, or formula revision summaries.
3. **Q&A Generator**: Important university exam questions, MCQs, viva-voce questions, and model answers.
4. **Make It Precise**: Shorten long answers, simplify explanations, or fit into 2-, 4-, or 6-mark formats.

📎 **Attach study material**: You can attach PDF lecture slides, PPT/PPTX files, images, or code to ask questions directly about your course documents!`,
  timestamp: new Date().toISOString(),
});

// Single chat bubble with Copy, Download, Save, and Regenerate controls
const ChatBubbleRow = memo(
  ({ msg, userName, onCopy, onDownload, onSave, onRegenerate, isCopied, isSaved }) => {
    const isUser = msg.role === 'user';

    return (
      <div className={`chat-bubble-row ${isUser ? 'chat-row-user' : 'chat-row-ai'}`}>
        <div className={`chat-avatar ${isUser ? 'chat-avatar-user' : 'chat-avatar-ai'}`}>
          {isUser ? <User size={18} /> : <Bot size={19} />}
        </div>

        <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
          <div className="chat-bubble-meta">
            <div className="chat-bubble-author-line">
              <strong>{isUser ? userName || 'You' : 'LearnSpace AI Tutor'}</strong>
              {msg.mode && !isUser && (
                <span className="bubble-mode-tag">
                  {msg.mode === 'summary' && 'Summary Mode'}
                  {msg.mode === 'qa_generator' && 'Q&A Mode'}
                  {msg.mode === 'make_precise' && 'Precise Mode'}
                  {msg.mode === 'ask_explain' && 'Explain Mode'}
                </span>
              )}
            </div>
            <span>
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Attached file indicator inside user bubble */}
          {isUser && msg.attachmentName && (
            <div className="bubble-attachment-preview">
              <FileCheck size={14} className="text-emerald" />
              <span>Attached: <strong>{msg.attachmentName}</strong></span>
            </div>
          )}

          <div className="chat-bubble-content">
            {isUser ? (
              <p className="chat-line">{msg.content}</p>
            ) : (
              <AIMessageRenderer content={msg.content} />
            )}
          </div>

          {/* AI Response Action Toolbar (Copy, Download, Save, Regenerate) */}
          {!isUser && msg.id !== 'welcome-msg' && (
            <div className="ai-bubble-actions-toolbar">
              <button
                type="button"
                className="ai-action-btn"
                onClick={() => onCopy(msg.content, msg.id)}
                title="Copy response to clipboard"
              >
                {isCopied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                className="ai-action-btn"
                onClick={() => onDownload(msg.content, msg.mode || 'ai_notes')}
                title="Download this response as Markdown file"
              >
                <Download size={14} />
                <span>Download</span>
              </button>

              <button
                type="button"
                className="ai-action-btn"
                onClick={() => onSave(msg.content, msg.mode || 'ask_explain')}
                title="Save note to your notebook"
              >
                {isSaved ? <BookmarkCheck size={14} className="text-purple" /> : <Bookmark size={14} />}
                <span>{isSaved ? 'Saved' : 'Save Note'}</span>
              </button>

              {onRegenerate && (
                <button
                  type="button"
                  className="ai-action-btn"
                  onClick={onRegenerate}
                  title="Regenerate this response"
                >
                  <RotateCcw size={14} />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ChatBubbleRow.displayName = 'ChatBubbleRow';

const AITutor = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCourse = searchParams.get('course') || 'General Computer Science';
  const initialPrompt = searchParams.get('prompt') || '';
  const initialMode = searchParams.get('mode') || 'ask_explain';

  const [activeMode, setActiveMode] = useState(initialMode);
  const [courseContext, setCourseContext] = useState(initialCourse);

  // Mode 1: Summary options
  const [summaryStyle, setSummaryStyle] = useState('detailed');
  const [summaryLength, setSummaryLength] = useState('medium');

  // Mode 2: Ask & Explain options
  const [answerStyle, setAnswerStyle] = useState('simple');

  // Mode 3: Q&A Generator options
  const [questionType, setQuestionType] = useState('exam-questions');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');

  // Mode 4: Make It Precise options
  const [preciseAction, setPreciseAction] = useState('shorten');

  // Attachment state
  const [attachedFile, setAttachedFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // UI feedback states
  const [copiedId, setCopiedId] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [lastUserPrompt, setLastUserPrompt] = useState('');

  // Saved Notes Drawer
  const [showSavedNotes, setShowSavedNotes] = useState(false);
  const [savedNotesList, setSavedNotesList] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('learnspace_ai_chat');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [getInitialGreeting(user?.name)];
  });

  const [input, setInput] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [apiNotice, setApiNotice] = useState('');
  const [activeModel, setActiveModel] = useState('Google Gemini Flash');

  const chatEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const inFlightRef = useRef(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('learnspace_ai_chat', JSON.stringify(messages));
    } catch {
      // ignore storage error
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt) {
      setSearchParams({});
    }
  }, [initialPrompt, setSearchParams]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    inFlightRef.current = false;
    setLoading(false);
    setStreaming(false);
  };

  // Upload document handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File size exceeds 15 MB limit.');
      return;
    }

    try {
      setUploadingDoc(true);
      setUploadError('');

      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('learnspace_token');
      const apiBase = import.meta.env.VITE_API_URL || '/api';

      const res = await fetch(`${apiBase}/chat/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload document.');
      }

      setAttachedFile(data.document);
    } catch (err) {
      setUploadError(err.message || 'Error uploading file.');
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async (promptText) => {
    const textToSend = (promptText !== undefined ? promptText : input).trim();
    if ((!textToSend && !attachedFile) || inFlightRef.current) return;

    inFlightRef.current = true;
    setError('');
    setLastUserPrompt(textToSend);

    const nowIso = new Date().toISOString();
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend || `[Analyze attached document: ${attachedFile?.originalName}]`,
      attachmentName: attachedFile?.originalName || null,
      timestamp: nowIso,
    };

    const aiMessageId = `ai-${Date.now() + 1}`;
    const historyToSend = messages
      .filter((m) => m.id !== 'welcome-msg' && m.content && m.content.trim())
      .slice(-4)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setStreaming(false);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const requestPayload = {
      message: textToSend,
      history: historyToSend,
      courseContext,
      mode: activeMode,
      summaryStyle,
      summaryLength,
      answerStyle,
      questionType,
      questionCount,
      difficulty,
      preciseAction,
      documentId: attachedFile?._id || null,
      documentText: attachedFile?.extractedPreview || '',
      imageData: attachedFile?.imageData || null,
    };

    try {
      const token = localStorage.getItem('learnspace_token');
      const apiBase = import.meta.env.VITE_API_URL || '/api';

      const response = await fetch(`${apiBase}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        // Fallback to standard non-streaming POST /api/chat
        const data = await api.post('/chat', requestPayload);
        if (data.model) setActiveModel(data.model);
        setApiNotice(data.notice || '');
        setMessages((prev) => [
          ...prev,
          {
            id: aiMessageId,
            role: 'assistant',
            mode: activeMode,
            content: data.reply,
            timestamp: data.timestamp || new Date().toISOString(),
          },
        ]);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let sseBuffer = '';
      let accumulatedText = '';
      let aiBubbleCreated = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const events = sseBuffer.split('\n\n');
        sseBuffer = events.pop() || '';

        for (const evtBlock of events) {
          const line = evtBlock
            .split('\n')
            .find((l) => l.startsWith('data: '));
          if (!line) continue;

          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.type === 'meta') {
              if (payload.model) setActiveModel(payload.model);
              setApiNotice(payload.notice || '');
            } else if (payload.type === 'chunk' && payload.text) {
              accumulatedText += payload.text;
              if (!aiBubbleCreated) {
                aiBubbleCreated = true;
                setLoading(false);
                setStreaming(true);
                setMessages((prev) => [
                  ...prev,
                  {
                    id: aiMessageId,
                    role: 'assistant',
                    mode: activeMode,
                    content: accumulatedText,
                    timestamp: new Date().toISOString(),
                  },
                ]);
              } else {
                const latestText = accumulatedText;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMessageId ? { ...m, content: latestText } : m
                  )
                );
              }
            } else if (payload.type === 'error') {
              setError(payload.message || 'AI Tutor stream encountered an error.');
            }
          } catch {
            // ignore partial JSON frame
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'The AI Tutor encountered an error. Please try again.');
    } finally {
      inFlightRef.current = false;
      abortControllerRef.current = null;
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleCopy = useCallback(async (content, id) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // fallback clipboard
    }
  }, []);

  const handleDownload = useCallback((content, modeName) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LearnSpace_${modeName}_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleSaveNote = useCallback(
    async (content, modeName) => {
      try {
        const titleLine = content.split('\n').find((l) => l.trim().startsWith('#')) || '';
        const noteTitle = titleLine.replace(/^#+\s*/, '').slice(0, 50) || `${modeName.toUpperCase()} Note`;

        await api.post('/chat/notes', {
          title: noteTitle,
          content,
          mode: modeName,
          courseContext,
          sourceDocument: attachedFile?.originalName || '',
        });

        setSavedIds((prev) => new Set([...prev, content.slice(0, 40)]));
        setTimeout(() => {
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(content.slice(0, 40));
            return next;
          });
        }, 4000);
      } catch (err) {
        setError(err.message || 'Could not save note.');
      }
    },
    [courseContext, attachedFile]
  );

  const fetchSavedNotes = async () => {
    try {
      setLoadingNotes(true);
      const data = await api.get('/chat/notes');
      setSavedNotesList(data.notes || []);
    } catch (err) {
      setError(err.message || 'Failed to load saved notes.');
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleDeleteSavedNote = async (noteId) => {
    try {
      await api.delete(`/chat/notes/${noteId}`);
      setSavedNotesList((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err) {
      setError(err.message || 'Failed to delete note.');
    }
  };

  const handleClearChat = () => {
    handleStopGeneration();
    setMessages([getInitialGreeting(user?.name)]);
    setError('');
    sessionStorage.removeItem('learnspace_ai_chat');
  };

  const handleRegenerate = () => {
    if (lastUserPrompt) {
      sendMessage(lastUserPrompt);
    }
  };

  const isBusy = loading || streaming;

  return (
    <div className="ai-tutor-page">
      {/* Top Header Bar */}
      <div className="ai-tutor-header">
        <div className="ai-header-left">
          <div className="ai-avatar-badge">
            <Sparkles size={22} />
          </div>
          <div>
            <h1>LearnSpace AI Tutor</h1>
            <p>
              Powered by <strong>{activeModel}</strong> • Live LaTeX equations, tables, exam revision & documents
            </p>
          </div>
        </div>

        <div className="ai-header-controls">
          <select
            className="course-context-select"
            value={courseContext}
            onChange={(e) => setCourseContext(e.target.value)}
            aria-label="Select course context"
          >
            <option value="General Computer Science">All CS Subjects</option>
            <option value="CS-301: Data Structures & Algorithms">CS-301: Data Structures</option>
            <option value="CS-302: Database Management Systems">CS-302: DBMS</option>
            <option value="CS-303: Computer Networks">CS-303: Computer Networks</option>
            <option value="CS-401: Artificial Intelligence">CS-401: Artificial Intelligence</option>
          </select>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setShowSavedNotes(true);
              fetchSavedNotes();
            }}
            title="View saved notes in your notebook"
          >
            <Bookmark size={15} />
            <span>My Notes</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleClearChat}
            title="Clear conversation history"
          >
            <Trash2 size={15} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* MODULE 1: FOUR STUDY MODES SELECTION TABS */}
      <div className="tutor-modes-nav">
        {TUTOR_MODES.map((mode) => {
          const IconComp = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              className={`tutor-mode-tab-card ${isActive ? 'tutor-mode-tab-active' : ''}`}
              onClick={() => setActiveMode(mode.id)}
            >
              <div className="mode-tab-top">
                <IconComp size={18} className={isActive ? 'text-primary-blue' : 'text-purple'} />
                <span className="mode-badge-pill">{mode.badge}</span>
              </div>
              <strong>{mode.name}</strong>
              <p>{mode.desc}</p>
            </button>
          );
        })}
      </div>

      {/* MODE CONFIGURATION OPTIONS BAR */}
      <div className="mode-controls-panel">
        <div className="mode-controls-label">
          <SlidersHorizontal size={15} />
          <span>Configure {TUTOR_MODES.find((m) => m.id === activeMode)?.name}:</span>
        </div>

        {/* Mode 1 Controls: Summary Generator */}
        {activeMode === 'summary' && (
          <div className="mode-fields-row">
            <div className="mode-field-item">
              <label>Summary Style:</label>
              <select value={summaryStyle} onChange={(e) => setSummaryStyle(e.target.value)}>
                <option value="very-short">Very Short Summary (3-5 Sentences)</option>
                <option value="detailed">Detailed Comprehensive Summary</option>
                <option value="chapter-wise">Chapter-Wise Structured Breakdown</option>
                <option value="bullet-point">Bullet-Point High-Yield Facts</option>
                <option value="exam-revision">Exam Revision & Cram Sheet</option>
                <option value="formulas">Important Definitions & Formulas</option>
              </select>
            </div>
            <div className="mode-field-item">
              <label>Length:</label>
              <select value={summaryLength} onChange={(e) => setSummaryLength(e.target.value)}>
                <option value="short">Short (~200 words)</option>
                <option value="medium">Medium (~500 words)</option>
                <option value="comprehensive">Comprehensive (~1000 words)</option>
              </select>
            </div>
          </div>
        )}

        {/* Mode 2 Controls: Ask and Explain */}
        {activeMode === 'ask_explain' && (
          <div className="mode-fields-row">
            <div className="mode-field-item">
              <label>Answer Style:</label>
              <select value={answerStyle} onChange={(e) => setAnswerStyle(e.target.value)}>
                <option value="simple">Simple Beginner Explanation (Analogy + Steps)</option>
                <option value="detailed">Detailed University Lecture Explanation</option>
                <option value="exam-oriented">Exam-Oriented Structured Answer</option>
                <option value="2-mark">2-Mark Exam Answer (Crisp & Direct)</option>
                <option value="4-mark">4-Mark Exam Answer (Structured Points)</option>
                <option value="6-mark">6-Mark Exam Answer (Comprehensive Theory & Math)</option>
                <option value="precise">Precise Technical Fact Sheet</option>
              </select>
            </div>
          </div>
        )}

        {/* Mode 3 Controls: Q&A Generator */}
        {activeMode === 'qa_generator' && (
          <div className="mode-fields-row">
            <div className="mode-field-item">
              <label>Question Type:</label>
              <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                <option value="exam-questions">Important University Exam Questions</option>
                <option value="short-answer">Short-Answer Questions (2 Marks)</option>
                <option value="long-answer">Long-Answer Descriptive Questions (6 Marks)</option>
                <option value="descriptive">Descriptive & Algorithmic Questions</option>
                <option value="mcq">Multiple Choice Questions (MCQs with 4 Options)</option>
                <option value="true-false">True / False Conceptual Questions</option>
                <option value="fill-blanks">Fill in the Blanks</option>
                <option value="viva">Viva-Voce External Examiner Questions</option>
              </select>
            </div>
            <div className="mode-field-item">
              <label>Question Count:</label>
              <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}>
                <option value="3">3 Questions</option>
                <option value="5">5 Questions</option>
                <option value="10">10 Questions</option>
                <option value="15">15 Questions</option>
              </select>
            </div>
            <div className="mode-field-item">
              <label>Difficulty:</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="Easy">Easy (Fundamental Definitions)</option>
                <option value="Medium">Medium (Standard College Exam)</option>
                <option value="Hard">Hard (Gate & Competitive Depth)</option>
              </select>
            </div>
          </div>
        )}

        {/* Mode 4 Controls: Make It Precise */}
        {activeMode === 'make_precise' && (
          <div className="mode-fields-row">
            <div className="mode-field-item">
              <label>Refinement Action:</label>
              <select value={preciseAction} onChange={(e) => setPreciseAction(e.target.value)}>
                <option value="shorten">Shorten this answer (Keep 100% meaning)</option>
                <option value="simpler">Explain in simpler beginner words</option>
                <option value="bullets">Convert into structured bullet points</option>
                <option value="exam-notes">Make exam-ready revision notes</option>
                <option value="extract-important">Extract only essential points & formulas</option>
                <option value="remove-unnecessary">Remove all unnecessary filler</option>
                <option value="2-mark">Convert into 2-mark exam answer</option>
                <option value="4-mark">Convert into 4-mark exam answer</option>
                <option value="6-mark">Convert into 6-mark exam answer</option>
                <option value="revision-sheet">Create a quick 1-page revision sheet</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {apiNotice && (
        <div className="ai-notice-bar">
          <Sparkles size={15} />
          <span>{apiNotice}</span>
        </div>
      )}

      {error && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Study Prompts */}
      <div className="starter-prompts-grid">
        {starterPrompts.map((item) => {
          const IconComp = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              className="starter-prompt-card"
              disabled={isBusy}
              onClick={() => {
                setActiveMode(item.mode);
                setCourseContext(item.course);
                sendMessage(item.prompt);
              }}
            >
              <IconComp size={17} className="text-purple" />
              <div className="starter-prompt-text">
                <strong>{item.label}</strong>
                <span>{item.course}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chat Conversation Window */}
      <div className="chat-container">
        <div className="chat-messages-list">
          {messages.map((msg) => (
            <ChatBubbleRow
              key={msg.id}
              msg={msg}
              userName={user?.name}
              onCopy={handleCopy}
              onDownload={handleDownload}
              onSave={handleSaveNote}
              onRegenerate={msg.role === 'assistant' && msg.id !== 'welcome-msg' ? handleRegenerate : null}
              isCopied={copiedId === msg.id}
              isSaved={savedIds.has(msg.content?.slice(0, 40))}
            />
          ))}

          {loading && (
            <div className="chat-bubble-row chat-row-ai">
              <div className="chat-avatar chat-avatar-ai">
                <Bot size={19} />
              </div>
              <div className="chat-bubble chat-bubble-ai chat-typing-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>LearnSpace AI is analyzing & generating technical response...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ATTACHMENT PREVIEW CHIP (MODULE 2) */}
        {attachedFile && (
          <div className="attached-document-chip">
            <div className="attached-chip-info">
              <FileCheck size={16} className="text-emerald" />
              <span className="attached-chip-name">{attachedFile.originalName}</span>
              <span className="attached-chip-size">
                ({Math.round(attachedFile.size / 1024)} KB • {attachedFile.pageCount || 1} pgs/slides)
              </span>
            </div>
            <button
              type="button"
              className="btn-remove-attachment"
              onClick={handleRemoveAttachment}
              title="Remove attached document"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {uploadingDoc && (
          <div className="uploading-progress-banner">
            <div className="spinner-ring spinner-xs"></div>
            <span>Extracting text and analyzing multi-page/slide structure...</span>
          </div>
        )}

        {uploadError && (
          <div className="alert-banner alert-error-compact">
            <AlertCircle size={15} />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Input Bar with Attachment Button */}
        <form
          className="chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          {/* Hidden File Input for PDF, PPT, PPTX, TXT, Images */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.webp"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

          <button
            type="button"
            className="btn btn-ghost chat-attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy || uploadingDoc}
            title="Attach PDF, PPT/PPTX presentation, Image, or TXT study notes"
          >
            <Paperclip size={18} />
          </button>

          <input
            type="text"
            placeholder={
              activeMode === 'summary'
                ? 'Paste text or enter topic/chapter to summarize (or use attached document)...'
                : activeMode === 'qa_generator'
                ? 'Enter topic or chapter to generate exam questions & answers...'
                : activeMode === 'make_precise'
                ? 'Paste your long answer, note, or paragraph to make precise...'
                : 'Ask any academic question, request truth table, LaTeX formula, or step-by-step logic...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isBusy}
          />

          {isBusy ? (
            <button
              type="button"
              className="btn btn-stop chat-send-btn"
              onClick={handleStopGeneration}
              title="Stop generating response"
            >
              <Square size={15} />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary chat-send-btn"
              disabled={(!input.trim() && !attachedFile) || uploadingDoc}
            >
              <Send size={17} />
              <span>Send</span>
            </button>
          )}
        </form>
      </div>

      {/* SAVED NOTES DRAWER / MODAL */}
      {showSavedNotes && (
        <div className="notes-modal-overlay" onClick={() => setShowSavedNotes(false)}>
          <div className="notes-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="notes-modal-header">
              <div className="notes-modal-title">
                <Bookmark size={20} className="text-purple" />
                <h2>My Saved Study Notes & Summaries</h2>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowSavedNotes(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="notes-modal-body">
              {loadingNotes ? (
                <div className="page-loading">
                  <div className="spinner-ring"></div>
                  <p>Loading your notebook...</p>
                </div>
              ) : savedNotesList.length === 0 ? (
                <div className="notes-empty-state">
                  <FileText size={40} className="text-muted" />
                  <p>No saved notes yet.</p>
                  <small>Click "Save Note" on any AI Tutor response to keep it in your permanent notebook!</small>
                </div>
              ) : (
                <div className="saved-notes-list">
                  {savedNotesList.map((note) => (
                    <div key={note._id} className="saved-note-card">
                      <div className="saved-note-top">
                        <span className="badge-code">{note.mode.toUpperCase()}</span>
                        <span className="note-date">
                          {new Date(note.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <h4>{note.title}</h4>
                      <p className="note-preview-text">{note.content.slice(0, 180)}...</p>
                      <div className="saved-note-footer">
                        <div className="note-actions">
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => handleCopy(note.content, note._id)}
                          >
                            <Copy size={13} />
                            <span>Copy</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => handleDownload(note.content, note.title)}
                          >
                            <Download size={13} />
                            <span>Download .md</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          className="btn-delete-note"
                          onClick={() => handleDeleteSavedNote(note._id)}
                          title="Delete note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITutor;
