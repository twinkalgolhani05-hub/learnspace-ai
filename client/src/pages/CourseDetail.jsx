import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle2,
  PlayCircle,
  Award,
  Sparkles,
  UserCheck,
  Layers,
  ClipboardCheck,
} from 'lucide-react';
import { api } from '../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [completingLessonId, setCompletingLessonId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchCourseDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get(`/courses/${id}`);
      setCourse(data.course);
    } catch (err) {
      setError(err.message || 'Unable to load course details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const res = await api.post(`/courses/${id}/enroll`);
      setMessage(res.message || 'Enrolled in course!');
      await fetchCourseDetail();
      setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      setError(err.message || 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleQuickMarkComplete = async (lessonId) => {
    try {
      setCompletingLessonId(lessonId);
      const res = await api.post(`/lessons/${lessonId}/complete`);
      setMessage(res.message || 'Lesson completed!');
      await fetchCourseDetail();
      setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      setError(err.message || 'Could not mark lesson complete.');
    } finally {
      setCompletingLessonId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-ring"></div>
        <p>Loading course syllabus and lessons...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="card-panel">
        <p className="text-error">{error || 'Course not found.'}</p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/courses')}
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const nextLesson =
    course.lessons.find((l) => !l.isCompleted) || course.lessons[0];

  return (
    <div className="course-detail-page">
      <button
        type="button"
        className="back-nav-btn"
        onClick={() => navigate('/courses')}
      >
        <ArrowLeft size={17} />
        <span>Back to Course Catalogue</span>
      </button>

      {message && (
        <div className="alert-banner alert-success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      <div className="course-hero-card">
        <div className="course-hero-main">
          <div className="course-badges-row">
            <span className="badge-code">{course.code}</span>
            <span className="chip-category">{course.category}</span>
            <span className="level-tag">{course.level}</span>
          </div>

          <h1>{course.title}</h1>
          <p className="course-hero-desc">{course.description}</p>

          <div className="course-hero-meta">
            <div>
              <UserCheck size={16} />
              <span>
                <strong>{course.instructor}</strong> • {course.instructorTitle}
              </span>
            </div>
            <div>
              <Layers size={16} />
              <span>{course.totalLessons} Structured Lessons</span>
            </div>
            <div>
              <Clock size={16} />
              <span>{course.duration} Duration</span>
            </div>
          </div>

          <div className="course-hero-actions">
            {!course.isEnrolled ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                <Sparkles size={18} />
                <span>
                  {enrolling ? 'Enrolling...' : 'Enroll in This Course'}
                </span>
              </button>
            ) : (
              nextLesson && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate(`/lessons/${nextLesson._id}`)}
                >
                  <PlayCircle size={18} />
                  <span>
                    {course.progressPercentage === 0
                      ? 'Start First Lesson'
                      : 'Continue Next Lesson'}
                  </span>
                </button>
              )
            )}

            {course.quiz && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/quizzes/${course.quiz._id}`)}
              >
                <ClipboardCheck size={18} />
                <span>Take Course Quiz ({course.quiz.questionCount} Qs)</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                navigate(
                  `/ai-tutor?course=${encodeURIComponent(
                    `${course.code}: ${course.title}`
                  )}`
                )
              }
            >
              <Sparkles size={17} />
              <span>Study with AI Tutor</span>
            </button>
          </div>
        </div>

        <div className="course-hero-side">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="course-detail-thumb"
          />
          <div className="course-progress-summary">
            <div className="enrolled-header">
              <span>Your Completion Status</span>
              <strong>{course.progressPercentage}%</strong>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${course.progressPercentage}%` }}
              />
            </div>
            <p className="progress-sub-caption">
              {course.completedLessonsCount} of {course.totalLessons} lessons marked
              completed
            </p>
          </div>
        </div>
      </div>

      {/* Syllabus & Lessons List */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div>
            <h3>Course Curriculum & Lessons</h3>
            <p>
              Open any lesson to study the lecture notes, code examples, and mark
              it as completed.
            </p>
          </div>
        </div>

        <div className="lessons-syllabus-list">
          {course.lessons.map((lesson) => (
            <div
              key={lesson._id}
              className={`syllabus-item ${
                lesson.isCompleted ? 'syllabus-item-completed' : ''
              }`}
            >
              <div className="syllabus-number">
                {lesson.isCompleted ? (
                  <CheckCircle2 size={22} className="text-emerald" />
                ) : (
                  <span>{lesson.order}</span>
                )}
              </div>

              <div className="syllabus-info">
                <div className="syllabus-title-row">
                  <h4>{lesson.title}</h4>
                  <span className="lesson-duration-tag">
                    <Clock size={13} /> {lesson.duration}
                  </span>
                </div>
                <p>{lesson.summary}</p>
              </div>

              <div className="syllabus-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/lessons/${lesson._id}`)}
                >
                  <BookOpen size={15} />
                  <span>Open Lesson</span>
                </button>

                {!lesson.isCompleted && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={completingLessonId === lesson._id}
                    onClick={() => handleQuickMarkComplete(lesson._id)}
                  >
                    <CheckCircle2 size={15} />
                    <span>
                      {completingLessonId === lesson._id
                        ? 'Saving...'
                        : 'Mark Complete'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Associated Course Quiz Card */}
      {course.quiz && (
        <div className="quiz-cta-banner">
          <div className="quiz-cta-left">
            <div className="quiz-cta-icon">
              <Award size={28} />
            </div>
            <div>
              <h3>Ready to test your knowledge?</h3>
              <p>
                Take the <strong>{course.quiz.title}</strong> ({course.quiz.questionCount}{' '}
                multiple-choice questions • {course.quiz.durationMinutes} mins •{' '}
                {course.quiz.passingPercentage}% passing score).
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/quizzes/${course.quiz._id}`)}
          >
            <span>Start Quiz Now</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;

