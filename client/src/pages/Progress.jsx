import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  BookOpen,
  Clock,
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
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import StatCard from '../components/StatCard';

const Progress = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const res = await api.get('/progress');
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load academic progress.');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-ring"></div>
        <p>Calculating your academic analytics...</p>
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

  const stats = data?.stats || {};
  const courseProgress = data?.courseProgress || [];
  const quizHistory = data?.quizHistory || [];
  const quizChartData = data?.quizChartData || [];
  const recentActivities = data?.recentActivities || [];

  return (
    <div className="progress-page">
      <div className="page-header-bar">
        <div>
          <h1>Academic Progress & Performance Analytics</h1>
          <p>
            Track your real-time course completion percentages, quiz scores, and
            full learning activity history.
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="stats-grid-4">
        <StatCard
          title="Overall Course Completion"
          value={`${stats.overallLearningProgress || 0}%`}
          subtitle={`${stats.completedCourses || 0} of ${
            stats.totalEnrolledCourses || 0
          } enrolled courses finished`}
          icon={TrendingUp}
          tone="blue"
        />
        <StatCard
          title="Lessons Completed"
          value={stats.totalLessonsCompleted || 0}
          subtitle="Across all enrolled subjects"
          icon={BookOpen}
          tone="emerald"
        />
        <StatCard
          title="Average Quiz Score"
          value={`${stats.averageQuizScore || 0}%`}
          subtitle={`Highest score: ${stats.highestQuizScore || 0}%`}
          icon={Award}
          tone="purple"
        />
        <StatCard
          title="Total Quizzes Attempted"
          value={stats.totalQuizzesAttempted || 0}
          subtitle="Stored in MongoDB records"
          icon={ClipboardCheck}
          tone="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="dashboard-grid-2">
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3>Subject-Wise Completion & Quiz Mastery</h3>
              <p>Comparison of lesson completion % and highest quiz score %</p>
            </div>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height={290}>
              <BarChart
                data={courseProgress}
                margin={{ top: 10, right: 16, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="shortTitle" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} unit="%" />
                <Tooltip formatter={(val) => [`${val}%`]} />
                <Legend />
                <Bar
                  dataKey="progressPercentage"
                  name="Course Completion %"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="bestQuizPercentage"
                  name="Best Quiz Score %"
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
              <h3>Quiz Score Trend Over Time</h3>
              <p>Your chronological quiz attempt scores</p>
            </div>
          </div>

          <div className="chart-box">
            {quizChartData.length === 0 ? (
              <div className="empty-chart-state">
                <Award size={36} className="text-purple" />
                <h4>No Quiz Attempts Recorded</h4>
                <p>Take an online quiz to populate your performance trend line.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={290}>
                <LineChart
                  data={quizChartData}
                  margin={{ top: 10, right: 16, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="attemptLabel" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(val) => [`${val}%`, 'Quiz Score']} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    name="Score Percentage"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#7c3aed' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Course-by-Course Breakdown Table */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div>
            <h3>Course Completion Breakdown</h3>
            <p>Detailed status for every course in the curriculum</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Enrollment</th>
                <th>Lessons Completed</th>
                <th>Completion %</th>
                <th>Best Quiz Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {courseProgress.map((course) => (
                <tr key={course.courseId}>
                  <td>
                    <div className="table-course-cell">
                      <span className="badge-code">{course.code}</span>
                      <strong>{course.title}</strong>
                    </div>
                  </td>
                  <td>{course.category}</td>
                  <td>
                    {course.isEnrolled ? (
                      <span className="status-pill status-pill-green">Enrolled</span>
                    ) : (
                      <span className="status-pill status-pill-gray">Not Enrolled</span>
                    )}
                  </td>
                  <td>
                    {course.completedLessonsCount} / {course.totalLessons}
                  </td>
                  <td>
                    <div className="table-progress-cell">
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${course.progressPercentage}%` }}
                        />
                      </div>
                      <span>{course.progressPercentage}%</span>
                    </div>
                  </td>
                  <td>
                    {course.quizAttemptsCount > 0 ? (
                      <strong>{course.bestQuizPercentage}%</strong>
                    ) : (
                      <span className="text-muted">No attempts</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/courses/${course.courseId}`)}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quiz Attempts History & Activity Log */}
      <div className="dashboard-grid-2">
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3>Quiz Attempt History</h3>
              <p>All submitted quizzes and instant evaluation scores</p>
            </div>
          </div>

          {quizHistory.length === 0 ? (
            <p className="empty-text">You have not submitted any quizzes yet.</p>
          ) : (
            <div className="quiz-attempts-list">
              {quizHistory.map((item) => (
                <div key={item._id} className="quiz-attempt-row">
                  <div>
                    <span className="badge-code">{item.courseCode}</span>
                    <h4>{item.quizTitle}</h4>
                    <small className="text-muted">
                      Submitted on{' '}
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </small>
                  </div>
                  <div className="quiz-attempt-score-col">
                    <strong className="attempt-percent">{item.percentage}%</strong>
                    <span>
                      {item.score}/{item.totalQuestions} Correct
                    </span>
                    <span
                      className={`pass-pill ${
                        item.passed ? 'pass-pill-ok' : 'pass-pill-retry'
                      }`}
                    >
                      {item.passed ? 'Passed' : 'Review'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3>Learning Activity History</h3>
              <p>Complete chronological timeline of your actions</p>
            </div>
          </div>

          <div className="activity-timeline">
            {recentActivities.map((act) => (
              <div key={act._id} className="activity-item">
                <div className={`activity-dot dot-${act.actionType}`} />
                <div className="activity-content">
                  <h5>{act.title}</h5>
                  <p>{act.details}</p>
                  <span className="activity-time">
                    <Clock size={12} />{' '}
                    {new Date(act.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;

