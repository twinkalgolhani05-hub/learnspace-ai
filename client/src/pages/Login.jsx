import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = async () => {
    setError('');
    setEmail('student@learnspace.edu');
    setPassword('Password123!');
    try {
      setSubmitting(true);
      await login('student@learnspace.edu', 'Password123!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-Showcase">
          <div className="auth-brand-badge">
            <GraduationCap size={26} />
            <span>LearnSpace AI</span>
          </div>
          <h1>Smarter University Learning Powered by AI</h1>
          <p>
            Access interactive computer science courses, ask questions with your
            24/7 Gemini AI Tutor, take instant-graded quizzes, and track your
            academic progress in real time.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <BookOpen size={20} />
              </div>
              <div>
                <h4>Structured University Courses</h4>
                <span>Data Structures, DBMS, Computer Networks & Artificial Intelligence</span>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <Sparkles size={20} />
              </div>
              <div>
                <h4>24/7 Google Gemini AI Tutor</h4>
                <span>Step-by-step explanations, code examples & revision notes</span>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <Award size={20} />
              </div>
              <div>
                <h4>Interactive Quizzes & Analytics</h4>
                <span>Instant grading, detailed answer explanations & Recharts insights</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Student Sign In</h2>
            <p>Enter your credentials to access your LearnSpace dashboard</p>
          </div>

          {error && (
            <div className="alert-banner alert-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="login-email">College Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="student@learnspace.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={submitting}
            >
              <span>{submitting ? 'Signing In...' : 'Sign In to Dashboard'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-divider">
            <span>OR QUICK DEMO ACCESS</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-full"
            onClick={handleDemoFill}
            disabled={submitting}
          >
            <Sparkles size={17} />
            <span>Sign In as Demo Student (Twinkal Golhani)</span>
          </button>

          <p className="auth-footer-text">
            New to LearnSpace?{' '}
            <Link to="/register" className="auth-link">
              Create Student Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

