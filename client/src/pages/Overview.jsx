import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  PlayCircle,
  ClipboardCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatCard from '../components/StatCard';

const Overview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await api.get('/progress');
        setProgressData(data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-ring"></div>
        <p>Loading your academic dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-banner alert-error">
        <span>{error}</span>
      </div>
    );
  }

  const stats = progressData?.stats || {
    totalEnrolledCourses: 0,
    completedCourses: 0,
    overallLearningProgress: 0,
    averageQuizScore: 0,
    totalQuizzesAttempted: 0,
    totalLessonsCompleted: 0,
  };

  const courseProgress = progressData?.courseProgress || [];
  const enrolledCourses = courseProgress.filter((c) => c.isEnrolled);
  const displayCourses = enrolledCourses.length > 0 ? enrolledCourses : courseProgress;
  const quizChartData = progressData?.quizChartData || [];
  const recentActivities = progressData?.recentActivities || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="overview-page">
      {/* Welcome Banner */}
      <section className="hero-banner">
        <div className="hero-banner-content">
          <span className="hero-pill">
            <Sparkles size={14} /> AI-Powered Academic Workspace
          </span>
          <h1>Welcome back, {user?.name || 'Student'}! 👋</h1>
          <p>
            You have completed <strong>{stats.totalLessonsCompleted} lessons</strong> across{' '}
            <strong>{stats.totalEnrolledCourses} enrolled courses</strong> with an overall
            progress of <strong>{stats.overallLearningProgress}%</strong>. Keep up the momentum!
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-white"
              onClick={() => navigate('/courses')}
            >
              <BookOpen size={17} />
              <span>Explore Courses</span>
            </button>
            <button
              type="button"
              className="btn btn-glass"
              onClick={() => navigate('/ai-tutor')}
            >
              <Sparkles size={17} />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>

        <div className="hero-summary-card">
          <div className="hero-ring-label">Overall Course Mastery</div>
          <div className="hero-big-percent">{stats.overallLearningProgress}%</div>
          <div className="progress-bar-track hero-progress-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${stats.overallLearningProgress}%` }}
            />
          </div>
          <span className="hero-ring-sub">
            {stats.completedCourses} of {stats.totalEnrolledCourses} Enrolled Courses Completed
          </span>
        </div>
      </section>

      {/* Top 4 KPI Stat Cards */}
      <section className="stats-grid-4">
        <StatCard
          title="Total Enrolled Courses"
          value={stats.totalEnrolledCourses}
          subtitle={`Out of ${stats.totalCoursesAvailable || 4} catalogue courses`}
          icon={BookOpen}
          tone="blue"
        />
        <StatCard
          title="Completed Courses"
          value={stats.completedCourses}
          subtitle={`${stats.totalLessonsCompleted} lessons finished`}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          title="Overall Learning Progress"
          value={`${stats.overallLearningProgress}%`}
          subtitle="Across all enrolled courses"
          icon={TrendingUp}
          tone="purple"
        />
        <StatCard
          title="Average Quiz Score"
          value={`${stats.averageQuizScore}%`}
          subtitle={`${stats.totalQuizzesAttempted} quizzes attempted`}
          icon={Award}
          tone="amber"
        />
      </section>

      {/* Learning Performance Charts */}
      <section className="dashboard-grid-2">
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3>Course Completion & Quiz Comparison</h3>
              <p>Real-time course progress vs. best quiz percentage per subject</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/progress')}
            >
              <span>Full Analytics</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart
                data={courseProgress}
                margin={{ top: 10, right: 16, left: -12, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="shortTitle" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} unit="%" />
                <Tooltip
                  formatter={(value, name) => [`${value}%`, name]}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                  }}
                />
                <Bar
                  dataKey="progressPercentage"
                  name="Lesson Progress"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="bestQuizPercentage"
                  name="Best Quiz Score"
                  fill="#7c3aed"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3>Quiz Score Progression</h3>
              <p>Performance trend across your recent online quiz attempts</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/quizzes')}
            >
              <span>Take a Quiz</span>
              <ClipboardCheck size={15} />
            </button>
          </div>

          <div className="chart-box">
            {quizChartData.length === 0 ? (
              <div className="empty-chart-state">
                <Award size={36} className="text-purple" />
                <h4>No Quizzes Attempted Yet</h4>
                <p>Complete your first course quiz to visualize your score trend here.</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/quizzes')}
                >
                  Browse Quizzes
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={270}>
                <AreaChart
                  data={quizChartData}
                  margin={{ top: 10, right: 16, left: -12, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="courseCode" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} unit="%" />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Score Percentage']}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Course Progress Cards & Recent Learning Activities */}
      <section className="dashboard-grid-asymmetric">
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3>Active Course Progress</h3>
              <p>Jump back into your lessons and track completion</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/courses')}
            >
              <span>All Courses</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="course-progress-list">
            {displayCourses.map((course) => (
              <div key={course.courseId} className="course-progress-item">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="course-progress-thumb"
                />
                <div className="course-progress-info">
                  <div className="course-progress-top">
                    <span className="badge-code">{course.code}</span>
                    <span className="course-instructor-sm">{course.instructor}</span>
                  </div>
                  <h4>{course.title}</h4>
                  <div className="progress-row">
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>
                    <span className="progress-percent-text">
                      {course.progressPercentage}%
                    </span>
                  </div>
                  <div className="course-progress-meta">
                    <span>
                      {course.completedLessonsCount} / {course.totalLessons} lessons completed
                    </span>
                    {course.bestQuizPercentage > 0 && (
                      <span className="quiz-pill-sm">
                        Best Quiz: {course.bestQuizPercentage}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="course-progress-action">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/courses/${course.courseId}`)}
                  >
                    <PlayCircle size={16} />
                    <span>{course.isEnrolled ? 'Continue' : 'View'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3>Recent Learning Activities</h3>
              <p>Live log of your lessons, quizzes & AI study sessions</p>
            </div>
          </div>

          <div className="activity-timeline">
            {recentActivities.length === 0 ? (
              <p className="empty-text">
                No recent learning activity yet. Start a course or ask the AI Tutor!
              </p>
            ) : (
              recentActivities.slice(0, 7).map((activity) => (
                <div key={activity._id} className="activity-item">
                  <div className={`activity-dot dot-${activity.actionType}`} />
                  <div className="activity-content">
                    <h5>{activity.title}</h5>
                    <p>{activity.details}</p>
                    <span className="activity-time">
                      <Clock size={12} /> {formatDate(activity.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Overview;

