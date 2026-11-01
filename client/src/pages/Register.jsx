import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Building2,
  BookOpen,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Computer Science & Engineering',
    semester: '5th Semester',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in your full name, email address, and password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    try {
      setSubmitting(true);
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        department: formData.department,
        semester: formData.semester,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          <h1>Join the Next-Gen AI Learning Platform</h1>
          <p>
            Create your free student account to enroll in computer science
            courses, practice with instant-feedback quizzes, and study alongside
            your personal AI Tutor.
          </p>

          <div className="auth-stats-grid">
            <div className="auth-stat-box">
              <strong>4+</strong>
              <span>Core CSE Courses</span>
            </div>
            <div className="auth-stat-box">
              <strong>16+</strong>
              <span>Interactive Lessons</span>
            </div>
            <div className="auth-stat-box">
              <strong>24/7</strong>
              <span>Gemini AI Tutor</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create Student Account</h2>
            <p>Start your personalized AI-assisted learning journey</p>
          </div>

          {error && (
            <div className="alert-banner alert-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  placeholder="Aarav Patel"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">College Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="aarav@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="reg-department">Department</label>
                <div className="input-with-icon">
                  <Building2 size={18} className="input-icon" />
                  <select
                    id="reg-department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="Computer Science & Engineering">
                      Computer Science & Eng.
                    </option>
                    <option value="Information Technology">
                      Information Technology
                    </option>
                    <option value="Artificial Intelligence & Data Science">
                      AI & Data Science
                    </option>
                    <option value="Electronics & Communication">
                      Electronics & Comm.
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-semester">Semester</label>
                <div className="input-with-icon">
                  <BookOpen size={18} className="input-icon" />
                  <select
                    id="reg-semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="reg-confirm"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={submitting}
            >
              <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

