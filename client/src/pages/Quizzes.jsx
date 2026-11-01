import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ClipboardCheck,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Paperclip,
  FileCheck,
  X,
  AlertCircle,
  SlidersHorizontal,
  FileText,
  BookOpen,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';

const Quizzes = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryTopic = searchParams.get('topic') || '';
  const initialTab = queryTopic ? 'generate' : 'catalog';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Generator form states
  const [topic, setTopic] = useState(queryTopic || '');
  const [pastedText, setPastedText] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionType, setQuestionType] = useState('MCQ');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [attachedFile, setAttachedFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const fileInputRef = useRef(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get('/quizzes');
      setQuizzes(data.quizzes || []);
    } catch (err) {
      setError(err.message || 'Failed to load quizzes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (queryTopic) {
      setTopic(queryTopic);
      setActiveTab('generate');
    }
  }, [queryTopic]);

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
        throw new Error(data.message || 'Failed to process document.');
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

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!topic.trim() && !pastedText.trim() && !attachedFile) {
      setGenError('Please enter a topic, paste study notes, or attach a document.');
      return;
    }

    try {
      setGenerating(true);
      setGenError('');

      const payload = {
        topic: topic.trim() || attachedFile?.originalName || 'Computer Science Study Material',
        sourceText: pastedText.trim() || attachedFile?.extractedPreview || '',
        documentId: attachedFile?._id || null,
        imageData: attachedFile?.imageData || null,
        numQuestions: Number(numQuestions) || 5,
        difficulty,
        questionType,
        durationMinutes: Number(durationMinutes) || 15,
      };

      const data = await api.post('/quizzes/generate', payload);

      if (data.success && data.quiz?._id) {
        // Immediately navigate to start taking the newly generated quiz!
        navigate(`/quizzes/${data.quiz._id}`);
      } else {
        throw new Error(data.message || 'Could not generate quiz.');
      }
    } catch (err) {
      setGenError(err.message || 'Quiz generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const catalogQuizzes = quizzes.filter((q) => !q.isCustom);
  const customQuizzes = quizzes.filter((q) => q.isCustom);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-ring"></div>
        <p>Loading online assessments...</p>
      </div>
    );
  }

  return (
    <div className="quizzes-page">
      {/* Page Header */}
      <div className="page-header-bar">
        <div>
          <h1>Assessments & AI Quiz Generator</h1>
          <p>
            Test your mastery across computer science subjects, generate personalized AI assessments from your notes, and track progress.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="quizzes-tabs-nav">
        <button
          type="button"
          className={`quiz-tab-btn ${activeTab === 'catalog' ? 'quiz-tab-active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          <Layers size={17} />
          <span>Course Assessments ({catalogQuizzes.length})</span>
        </button>

        <button
          type="button"
          className={`quiz-tab-btn quiz-tab-sparkle ${activeTab === 'generate' ? 'quiz-tab-active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          <Sparkles size={17} />
          <span>Generate My Own Quiz</span>
        </button>

        {customQuizzes.length > 0 && (
          <button
            type="button"
            className={`quiz-tab-btn ${activeTab === 'custom' ? 'quiz-tab-active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            <BookOpen size={17} />
            <span>My Custom Quizzes ({customQuizzes.length})</span>
          </button>
        )}
      </div>

      {/* TAB 1: CATALOG QUIZZES */}
      {activeTab === 'catalog' && (
        <div className="quizzes-grid">
          {catalogQuizzes.map((quiz) => {
            const hasAttempted = quiz.attemptsCount > 0;
            return (
              <div key={quiz._id} className="quiz-card">
                <div className="quiz-card-top">
                  <span className="badge-code">
                    {quiz.course?.code || 'CS'} • {quiz.course?.category || 'Core'}
                  </span>
                  {hasAttempted && (
                    <span className="quiz-attempted-badge">
                      <CheckCircle2 size={14} /> Best: {quiz.bestPercentage}%
                    </span>
                  )}
                </div>

                <h3>{quiz.title}</h3>
                <p className="quiz-card-desc">{quiz.description}</p>

                <div className="quiz-specs-row">
                  <div className="quiz-spec-item">
                    <HelpCircle size={15} />
                    <span>{quiz.totalQuestions} Questions</span>
                  </div>
                  <div className="quiz-spec-item">
                    <Clock size={15} />
                    <span>{quiz.durationMinutes} Mins</span>
                  </div>
                  <div className="quiz-spec-item">
                    <Award size={15} />
                    <span>Pass: {quiz.passingPercentage}%</span>
                  </div>
                </div>

                {quiz.latestAttempt ? (
                  <div className="quiz-history-box">
                    <div>
                      <span className="quiz-history-label">Last Attempt Score</span>
                      <strong>
                        {quiz.latestAttempt.score}/{quiz.latestAttempt.totalQuestions} ({quiz.latestAttempt.percentage}%)
                      </strong>
                    </div>
                    <span
                      className={`pass-pill ${
                        quiz.latestAttempt.passed ? 'pass-pill-ok' : 'pass-pill-retry'
                      }`}
                    >
                      {quiz.latestAttempt.passed ? 'Passed' : 'Needs Review'}
                    </span>
                  </div>
                ) : (
                  <div className="quiz-history-box quiz-history-empty">
                    <span>Not attempted yet — test your understanding!</span>
                  </div>
                )}

                <div className="quiz-card-footer">
                  <button
                    type="button"
                    className="btn btn-primary btn-full"
                    onClick={() => navigate(`/quizzes/${quiz._id}`)}
                  >
                    {hasAttempted ? (
                      <>
                        <RotateCcw size={16} />
                        <span>Retake Quiz ({quiz.attemptsCount} Attempts)</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCheck size={17} />
                        <span>Start Quiz</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: GENERATE MY OWN QUIZ (MODULE 3) */}
      {activeTab === 'generate' && (
        <div className="quiz-generator-container">
          <div className="generator-intro-card">
            <div className="generator-intro-header">
              <div className="generator-badge-icon">
                <Sparkles size={24} />
              </div>
              <div>
                <h2>AI Quiz Generator</h2>
                <p>
                  Generate an instant university-level assessment from any topic, lecture notes, textbook excerpt, PDF, PPT presentation, or diagram image.
                </p>
              </div>
            </div>

            {genError && (
              <div className="alert-banner alert-error">
                <AlertCircle size={18} />
                <span>{genError}</span>
              </div>
            )}

            <form onSubmit={handleGenerateQuiz} className="quiz-generator-form">
              {/* Step 1: Input source */}
              <div className="form-group">
                <label className="form-label-bold">
                  1. Topic, Chapter, or Subject Name:
                </label>
                <input
                  type="text"
                  className="input-text-field"
                  placeholder="e.g. Binary Search Trees & AVL Rotations, BCNF Normalization, TCP 3-Way Handshake"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={generating}
                />
              </div>

              {/* Pasted study text */}
              <div className="form-group">
                <label className="form-label-bold">
                  2. (Optional) Paste Custom Study Notes or Lecture Text:
                </label>
                <textarea
                  className="input-textarea-field"
                  rows={4}
                  placeholder="Paste lecture excerpts, definitions, formulas, or syllabus content to generate questions strictly from this material..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  disabled={generating}
                />
              </div>

              {/* Upload PDF / PPT / Image attachment */}
              <div className="form-group">
                <label className="form-label-bold">
                  3. (Optional) Attach Study File (PDF, PPT/PPTX, Images, TXT):
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.webp"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />

                {attachedFile ? (
                  <div className="generator-attached-chip">
                    <div className="attached-chip-info">
                      <FileCheck size={18} className="text-emerald" />
                      <div>
                        <strong>{attachedFile.originalName}</strong>
                        <span>({Math.round(attachedFile.size / 1024)} KB • {attachedFile.pageCount || 1} pages/slides)</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-attachment"
                      onClick={handleRemoveAttachment}
                      disabled={generating}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary upload-trigger-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingDoc || generating}
                  >
                    <Paperclip size={16} />
                    <span>{uploadingDoc ? 'Uploading & Parsing...' : 'Attach Lecture PDF / PPT / Image'}</span>
                  </button>
                )}

                {uploadError && (
                  <span className="text-error font-sm">{uploadError}</span>
                )}
              </div>

              {/* Step 2: Configuration */}
              <div className="generator-config-grid">
                <div className="config-box">
                  <label>Number of Questions</label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    disabled={generating}
                  >
                    <option value="5">5 Questions (Quick Check)</option>
                    <option value="10">10 Questions (Standard Quiz)</option>
                    <option value="15">15 Questions (Thorough Test)</option>
                    <option value="20">20 Questions (Full Assessment)</option>
                  </select>
                </div>

                <div className="config-box">
                  <label>Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    disabled={generating}
                  >
                    <option value="Easy">Easy (Fundamental Definitions)</option>
                    <option value="Medium">Medium (University Midterm Level)</option>
                    <option value="Hard">Hard (GATE / Competitive Exam)</option>
                  </select>
                </div>

                <div className="config-box">
                  <label>Question Format</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    disabled={generating}
                  >
                    <option value="MCQ">Multiple Choice (4 Options)</option>
                    <option value="True/False">True / False Conceptual</option>
                    <option value="Mixed">Mixed Question Types</option>
                  </select>
                </div>

                <div className="config-box">
                  <label>Time Limit</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    disabled={generating}
                  >
                    <option value="5">5 Minutes</option>
                    <option value="10">10 Minutes</option>
                    <option value="15">15 Minutes</option>
                    <option value="20">20 Minutes</option>
                    <option value="30">30 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Submit generation */}
              <div className="generator-submit-row">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={generating || uploadingDoc || (!topic.trim() && !pastedText.trim() && !attachedFile)}
                >
                  {generating ? (
                    <>
                      <div className="spinner-ring spinner-xs"></div>
                      <span>Generating Assessment with Google Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Generate Quiz Now</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM QUIZZES GENERATED BY THIS USER */}
      {activeTab === 'custom' && (
        <div className="quizzes-grid">
          {customQuizzes.map((quiz) => {
            const hasAttempted = quiz.attemptsCount > 0;
            return (
              <div key={quiz._id} className="quiz-card quiz-card-custom">
                <div className="quiz-card-top">
                  <span className="badge-ai-quiz">
                    <Sparkles size={12} /> AI Custom Quiz
                  </span>
                  <span className="badge-difficulty">{quiz.difficulty || 'Medium'}</span>
                </div>

                <h3>{quiz.title}</h3>
                <p className="quiz-card-desc">{quiz.description}</p>

                <div className="quiz-specs-row">
                  <div className="quiz-spec-item">
                    <HelpCircle size={15} />
                    <span>{quiz.totalQuestions} Questions</span>
                  </div>
                  <div className="quiz-spec-item">
                    <Clock size={15} />
                    <span>{quiz.durationMinutes} Mins</span>
                  </div>
                  {hasAttempted && (
                    <div className="quiz-spec-item">
                      <Award size={15} />
                      <span>Best: {quiz.bestPercentage}%</span>
                    </div>
                  )}
                </div>

                {quiz.latestAttempt ? (
                  <div className="quiz-history-box">
                    <div>
                      <span className="quiz-history-label">Last Score</span>
                      <strong>
                        {quiz.latestAttempt.score}/{quiz.latestAttempt.totalQuestions} ({quiz.latestAttempt.percentage}%)
                      </strong>
                    </div>
                    <span
                      className={`pass-pill ${
                        quiz.latestAttempt.passed ? 'pass-pill-ok' : 'pass-pill-retry'
                      }`}
                    >
                      {quiz.latestAttempt.passed ? 'Passed' : 'Needs Review'}
                    </span>
                  </div>
                ) : (
                  <div className="quiz-history-box quiz-history-empty">
                    <span>Generated and ready to take!</span>
                  </div>
                )}

                <div className="quiz-card-footer">
                  <button
                    type="button"
                    className="btn btn-primary btn-full"
                    onClick={() => navigate(`/quizzes/${quiz._id}`)}
                  >
                    <ClipboardCheck size={17} />
                    <span>{hasAttempted ? 'Retake Custom Quiz' : 'Take This Quiz'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Quizzes;
