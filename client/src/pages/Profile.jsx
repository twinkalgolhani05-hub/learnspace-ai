import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Building2,
  BookOpen,
  IdCard,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Profile = () => {
  const { user, updateUserState } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || 'Computer Science & Engineering',
    semester: user?.semester || '5th Semester',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await api.get('/profile');
        if (data?.profile) {
          setFormData({
            name: data.profile.name || '',
            department: data.profile.department || '',
            semester: data.profile.semester || '',
            bio: data.profile.bio || '',
          });
          updateUserState(data.profile);
        }
      } catch {
        // fallback to context user
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      const data = await api.put('/profile', formData);
      if (data?.profile) {
        updateUserState(data.profile);
      }
      setSuccessMsg(data.message || 'Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name = 'Student') =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="profile-page">
      <div className="page-header-bar">
        <div>
          <h1>Student Academic Profile</h1>
          <p>View and update your personal academic information</p>
        </div>
      </div>

      {successMsg && (
        <div className="alert-banner alert-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="profile-grid">
        {/* Left Student ID Card */}
        <div className="card-panel profile-summary-card">
          <div className="profile-avatar-xl">
            <span>{getInitials(formData.name || user?.name)}</span>
          </div>
          <h2>{formData.name || user?.name}</h2>
          <p className="profile-dept-tag">{formData.department}</p>
          <span className="badge-code">{formData.semester}</span>

          <div className="profile-meta-list">
            <div className="profile-meta-item">
              <IdCard size={16} />
              <div>
                <small>Student Roll ID</small>
                <strong>{user?.studentId || 'LS-202601'}</strong>
              </div>
            </div>
            <div className="profile-meta-item">
              <Mail size={16} />
              <div>
                <small>Academic Email</small>
                <strong>{user?.email}</strong>
              </div>
            </div>
            <div className="profile-meta-item">
              <Building2 size={16} />
              <div>
                <small>Department</small>
                <strong>{formData.department}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Profile Edit Form */}
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3>Edit Profile Details</h3>
              <p>Keep your student records and academic bio up to date</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="prof-name">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="prof-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="prof-email">College Email Address (Read-only)</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="prof-email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-disabled"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="prof-dept">Department</label>
                <div className="input-with-icon">
                  <Building2 size={18} className="input-icon" />
                  <select
                    id="prof-dept"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="Computer Science & Engineering">
                      Computer Science & Engineering
                    </option>
                    <option value="Information Technology">
                      Information Technology
                    </option>
                    <option value="Artificial Intelligence & Data Science">
                      Artificial Intelligence & Data Science
                    </option>
                    <option value="Electronics & Communication">
                      Electronics & Communication
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prof-sem">Current Semester</label>
                <div className="input-with-icon">
                  <BookOpen size={18} className="input-icon" />
                  <select
                    id="prof-sem"
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

            <div className="form-group">
              <label htmlFor="prof-bio">Academic Bio & Learning Goals</label>
              <textarea
                id="prof-bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about your academic interests and career goals..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              <Save size={17} />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

