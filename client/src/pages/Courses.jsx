import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Search,
  Sparkles,
  UserCheck,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';

const Courses = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'enrolled' | 'completed'
  const [enrollingId, setEnrollingId] = useState(null);
  const [toast, setToast] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.get('/courses');
      setCourses(data.courses || []);
    } catch (err) {
      setError(err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchTerm(q);
  }, [searchParams]);

  const handleEnroll = async (e, courseId) => {
    e.stopPropagation();
    try {
      setEnrollingId(courseId);
      const res = await api.post(`/courses/${courseId}/enroll`);
      setToast(res.message || 'Enrolled successfully!');
      await fetchCourses();
      setTimeout(() => setToast(''), 3500);
    } catch (err) {
      setError(err.message || 'Enrollment failed.');
    } finally {
      setEnrollingId(null);
    }
  };

  const categories = ['All', ...new Set(courses.map((c) => c.category))];

  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      selectedCategory === 'All' || course.category === selectedCategory;

    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      course.title.toLowerCase().includes(q) ||
      course.code.toLowerCase().includes(q) ||
      course.instructor.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q) ||
      course.category.toLowerCase().includes(q);

    const matchesEnrollment =
      filterMode === 'all' ||
      (filterMode === 'enrolled' && course.isEnrolled) ||
      (filterMode === 'completed' && course.completed);

    return matchesCategory && matchesSearch && matchesEnrollment;
  });

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-ring"></div>
        <p>Loading course catalogue...</p>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="page-header-bar">
        <div>
          <h1>University Course Catalogue</h1>
          <p>
            Browse core computer science courses, enroll with one click, and track
            your lesson completion percentage.
          </p>
        </div>

        <div className="filter-tabs">
          <button
            type="button"
            className={`tab-pill ${filterMode === 'all' ? 'tab-pill-active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            All Courses ({courses.length})
          </button>
          <button
            type="button"
            className={`tab-pill ${filterMode === 'enrolled' ? 'tab-pill-active' : ''}`}
            onClick={() => setFilterMode('enrolled')}
          >
            Enrolled ({courses.filter((c) => c.isEnrolled).length})
          </button>
          <button
            type="button"
            className={`tab-pill ${filterMode === 'completed' ? 'tab-pill-active' : ''}`}
            onClick={() => setFilterMode('completed')}
          >
            Completed ({courses.filter((c) => c.completed).length})
          </button>
        </div>
      </div>

      {toast && (
        <div className="alert-banner alert-success">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div className="alert-banner alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="catalogue-controls">
        <div className="search-input-box">
          <Search size={18} className="search-box-icon" />
          <input
            type="text"
            placeholder="Filter courses by title, code (CS-301), instructor, or skill..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (searchParams.get('search')) {
                setSearchParams({});
              }
            }}
          />
        </div>

        <div className="category-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip-btn ${selectedCategory === cat ? 'chip-btn-active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="empty-card">
          <BookOpen size={42} className="text-blue" />
          <h3>No Matching Courses Found</h3>
          <p>Try clearing your search filter or switching categories.</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setFilterMode('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <article
              key={course._id}
              className="course-card"
              onClick={() => navigate(`/courses/${course._id}`)}
            >
              <div className="course-card-media">
                <img src={course.thumbnail} alt={course.title} />
                <span className="course-category-badge">{course.category}</span>
                <span className="course-code-badge">{course.code}</span>
              </div>

              <div className="course-card-body">
                <div className="course-meta-row">
                  <span className="meta-item">
                    <Layers size={14} /> {course.totalLessons} Lessons
                  </span>
                  <span className="meta-item">
                    <Clock size={14} /> {course.duration}
                  </span>
                  <span className="level-tag">{course.level}</span>
                </div>

                <h3>{course.title}</h3>
                <p className="course-desc">{course.description}</p>

                <div className="course-instructor-row">
                  <UserCheck size={15} className="text-blue" />
                  <span>{course.instructor}</span>
                </div>

                {course.skills && course.skills.length > 0 && (
                  <div className="skill-tags-row">
                    {course.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="skill-pill">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {course.isEnrolled ? (
                  <div className="course-enrolled-box">
                    <div className="enrolled-header">
                      <span className="status-enrolled">
                        <CheckCircle2 size={14} />{' '}
                        {course.completed ? 'Course Completed' : 'Enrolled'}
                      </span>
                      <strong>{course.progressPercentage}%</strong>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="course-not-enrolled-box">
                    <span>Not enrolled yet • Free university access</span>
                  </div>
                )}

                <div className="course-card-footer">
                  {course.isEnrolled ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/courses/${course._id}`);
                      }}
                    >
                      <span>
                        {course.completed ? 'Review Course' : 'Continue Learning'}
                      </span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <div className="card-btn-split">
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={enrollingId === course._id}
                        onClick={(e) => handleEnroll(e, course._id)}
                      >
                        <Sparkles size={16} />
                        <span>
                          {enrollingId === course._id ? 'Enrolling...' : 'Enroll Now'}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/courses/${course._id}`);
                        }}
                      >
                        Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;

