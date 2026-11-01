import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  RotateCcw,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import QuizMathText from '../components/QuizMathText';

/**
 * Normalizes question options safely on the client side,
 * handling single-string collapsed options, objects, or prefix letters.
 */
const normalizeClientOptions = (rawOptions) => {
  let parsed = [];
  if (Array.isArray(rawOptions)) {
    if (rawOptions.length === 1 && typeof rawOptions[0] === 'string') {
      const single = rawOptions[0];
      const parts = single
        .split(/(?:^|\s+)(?:[A-D][\.\)\:\-]\s*|\([A-D]\)\s*|[A-D]\s+)/i)
        .map((s) => s.trim())
        .filter(Boolean);
      parsed = parts.length >= 2 ? parts : [single];
    } else {
      parsed = rawOptions;
    }
  } else if (rawOptions && typeof rawOptions === 'object') {
    parsed = Object.keys(rawOptions)
      .sort()
      .map((k) => rawOptions[k]);
  } else if (typeof rawOptions === 'string') {
    parsed = rawOptions
      .split(/(?:^|\s+)(?:[A-D][\.\)\:\-]\s*|\([A-D]\)\s*|[A-D]\s+)/i)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let cleaned = parsed
    .map((opt) =>
      String(opt)
        .trim()
        .replace(/^(?:Option\s+[A-D]\s*[:.-]?\s*|[A-D]\s*[:.)-]\s*|\([A-D]\)\s*|[A-D]\s+(?=[$A-Za-z0-9]))/i, '')
        .trim()
    )
    .filter(Boolean);

  while (cleaned.length < 4) {
    cleaned.push(`Option ${String.fromCharCode(65 + cleaned.length)}`);
  }
  return cleaned.slice(0, 4);
};

/**
 * Strips leading question index numbers (e.g. "1. ", "Q1: ", "1) ")
 * so that displayed question indices never appear duplicated.
 */
const cleanQuestionTitle = (raw = '') => {
  return String(raw || '')
    .trim()
    .replace(/^(?:Question\s*\d+\s*[:.-]?\s*|Q\d+\s*[:.-]?\s*|\d+\s*[:.)-]\s*)/i, '')
    .trim();
};

const QuizTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/quizzes/${id}`);
        setQuiz(data.quiz);
      } catch (err) {
        setError(err.message || 'Failed to load quiz questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  // Quiz timer while active
  useEffect(() => {
    if (!quiz || result) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz, result]);

  const handleSelectOption = (questionId, optionIndex) => {
    if (result) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    setError('');

    const unansweredCount = quiz.questions.filter(
      (q) => selectedAnswers[q._id] === undefined
    ).length;

    if (unansweredCount > 0) {
      setError(
        `Please answer all questions before submitting (${unansweredCount} question${
          unansweredCount > 1 ? 's' : ''
        } remaining).`
      );
      return;
    }

    try {
      setSubmitting(true);
      const data = await api.post(`/quizzes/${id}/submit`, {
        answers: selectedAnswers,
        timeSpentSeconds: elapsedSeconds,
      });
      setResult(data.result);
    } catch (err) {
      setError(err.message || 'Could not submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setElapsedSeconds(0);
    setResult(null);
    setError('');
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-ring"></div>
        <p>Preparing quiz session and rendering mathematical expressions...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="card-panel">
        <p className="text-error">{error || 'Quiz not found.'}</p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/quizzes')}
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  // Render Instant Results & Answer Review View
  if (result) {
    return (
      <div className="quiz-result-page">
        <button
          type="button"
          className="back-nav-btn"
          onClick={() => navigate('/quizzes')}
        >
          <ArrowLeft size={17} />
          <span>Back to All Quizzes</span>
        </button>

        <div className="quiz-score-banner">
          <div className="score-banner-left">
            <span
              className={`pass-pill ${
                result.passed ? 'pass-pill-ok' : 'pass-pill-retry'
              }`}
            >
              {result.passed ? 'PASSED ASSESSMENT' : 'NEEDS FURTHER REVIEW'}
            </span>
            <h1>{result.quizTitle}</h1>
            <p>
              You answered <strong>{result.score}</strong> out of{' '}
              <strong>{result.totalQuestions}</strong> questions correctly in{' '}
              <strong>{formatTimer(result.timeSpentSeconds)}</strong>.
            </p>

            <div className="score-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRetake}
              >
                <RotateCcw size={16} />
                <span>Retake Quiz</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/progress')}
              >
                <Award size={16} />
                <span>View Learning Progress</span>
              </button>
            </div>
          </div>

          <div className="score-banner-stat-box">
            <div className="score-radial-wrap">
              <div
                className={`score-big-circle ${
                  result.passed ? 'circle-pass' : 'circle-retry'
                }`}
              >
                <span className="big-percent">{result.percentage}%</span>
                <span className="percent-label">Final Score</span>
              </div>
            </div>
            <div className="score-meta-tags">
              <span>Required: {quiz.passingPercentage}%</span>
              <span>•</span>
              <span>
                {result.passed
                  ? 'Criteria Satisfied'
                  : 'Score below pass threshold'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Solutions & Step-by-Step Review */}
        <div className="quiz-review-section">
          <div className="section-head-simple">
            <div>
              <h3>Detailed Answer Review & Explanations</h3>
              <p>Review each question, your selected option, and the verified mathematical solution</p>
            </div>
          </div>

          <div className="review-questions-list">
            {result.review.map((item) => {
              const reviewOptions = normalizeClientOptions(item.options);
              const cleanPrompt = cleanQuestionTitle(item.questionText);

              return (
                <div
                  key={item.questionId}
                  className={`review-item ${
                    item.isCorrect ? 'review-item-correct' : 'review-item-wrong'
                  }`}
                >
                  <div className="review-item-header">
                    <span className="review-q-num">Question {item.number}</span>
                    {item.isCorrect ? (
                      <span className="review-status-ok">
                        <CheckCircle2 size={16} /> Correct (+1 pt)
                      </span>
                    ) : (
                      <span className="review-status-wrong">
                        <XCircle size={16} /> Incorrect (0 pt)
                      </span>
                    )}
                  </div>

                  <h4 className="review-question-title">
                    <QuizMathText content={cleanPrompt} />
                  </h4>

                  <div className="review-options-grid">
                    {reviewOptions.map((opt, optIdx) => {
                      const isUserChoice = optIdx === item.selectedOptionIndex;
                      const isRightAnswer = optIdx === item.correctOptionIndex;

                      let optClass = 'review-opt';
                      if (isRightAnswer) optClass += ' review-opt-correct';
                      else if (isUserChoice && !isRightAnswer)
                        optClass += ' review-opt-wrong';

                      return (
                        <div key={optIdx} className={optClass}>
                          <span className="opt-letter">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="opt-text">
                            <QuizMathText content={opt} inline={true} stripPrefix={true} />
                          </span>
                          {isRightAnswer && (
                            <span className="opt-tag-correct">Correct Answer</span>
                          )}
                          {isUserChoice && !isRightAnswer && (
                            <span className="opt-tag-user">Your Choice</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {item.explanation && (
                    <div className="review-explanation">
                      <strong>Explanation:</strong>{' '}
                      <QuizMathText content={item.explanation} inline={false} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz Taking View
  const currentQuestion = quiz.questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / quiz.totalQuestions) * 100);

  const cleanCurrentPrompt = cleanQuestionTitle(currentQuestion?.questionText);
  const currentOptions = normalizeClientOptions(currentQuestion?.options);

  return (
    <div className="quiz-take-page">
      <div className="quiz-top-bar">
        <button
          type="button"
          className="back-nav-btn"
          onClick={() => navigate('/quizzes')}
        >
          <ArrowLeft size={17} />
          <span>Exit Quiz</span>
        </button>

        <div className="quiz-timer-pill">
          <Clock size={16} />
          <span>Time Elapsed: {formatTimer(elapsedSeconds)}</span>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="quiz-workspace-card">
        <div className="quiz-workspace-header">
          <div>
            <span className="badge-code">{quiz.course?.code || 'CS Assessment'}</span>
            <h2>{quiz.title}</h2>
          </div>
          <div className="quiz-progress-box">
            <span>
              Question <strong>{currentIndex + 1}</strong> of{' '}
              <strong>{quiz.totalQuestions}</strong> ({answeredCount} answered)
            </span>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Number Navigation Strip (Clearly Spaced and Clickable) */}
        <div className="question-num-strip" role="navigation" aria-label="Question Navigation">
          {quiz.questions.map((q, idx) => {
            const isAnswered = selectedAnswers[q._id] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q._id || idx}
                type="button"
                className={`q-num-pill ${isCurrent ? 'q-num-current' : ''} ${
                  isAnswered ? 'q-num-answered' : ''
                }`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to Question ${idx + 1}${isAnswered ? ' (Answered)' : ''}`}
                title={`Question ${idx + 1}${isAnswered ? ' (Answered)' : ' (Not answered)'}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Current Question & 4 Separate Structured Options */}
        <div className="question-stage">
          <div className="question-card-inner">
            <div className="question-prompt-header">
              <span className="question-index-tag">
                Question {currentIndex + 1} of {quiz.totalQuestions}
              </span>
              <span className="question-points-pill">1 Point</span>
            </div>

            <div className="question-prompt">
              <span className="question-num-prefix">{currentIndex + 1}.</span>
              <div className="question-text-rendered">
                <QuizMathText content={cleanCurrentPrompt} inline={false} />
              </div>
            </div>

            <div className="options-list">
              {currentOptions.map((optionText, idx) => {
                const isSelected = selectedAnswers[currentQuestion._id] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`option-choice-btn ${
                      isSelected ? 'option-choice-selected' : ''
                    }`}
                    onClick={() => handleSelectOption(currentQuestion._id, idx)}
                    aria-pressed={isSelected}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="option-label-text">
                      <QuizMathText content={optionText} inline={true} stripPrefix={true} />
                    </span>
                    {isSelected && (
                      <span className="option-selected-check">
                        <CheckCircle2 size={18} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation & Submit Controls */}
        <div className="quiz-nav-footer">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          >
            <ArrowLeft size={16} />
            <span>Previous Question</span>
          </button>

          <div className="quiz-nav-right">
            {currentIndex < quiz.totalQuestions - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(quiz.totalQuestions - 1, prev + 1)
                  )
                }
              >
                <span>Next Question</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-emerald"
                onClick={handleSubmitQuiz}
                disabled={submitting}
              >
                <CheckCircle2 size={17} />
                <span>{submitting ? 'Evaluating...' : 'Submit Quiz'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTake;
