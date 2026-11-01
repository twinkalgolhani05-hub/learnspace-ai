import React, { useState } from 'react';
import {
  Lock,
  Sparkles,
  Bell,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Settings = () => {
  const { user, updateUserState } = useAuth();

  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    quizReminders: user?.preferences?.quizReminders ?? true,
    aiExplanationStyle: user?.preferences?.aiExplanationStyle || 'step-by-step',
    weeklyStudyGoalHours: user?.preferences?.weeklyStudyGoalHours || 12,
    compactSidebar: user?.preferences?.compactSidebar ?? false,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      setSavingPrefs(true);
      const data = await api.put('/profile', { preferences });
      if (data?.profile) {
        updateUserState(data.profile);
      }
      setSuccessMsg('Application preferences saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Could not save preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!passwords.currentPassword || !passwords.newPassword) {
      setErrorMsg('Please enter both your current password and a new password.');
      return;
    }

    if (passwords.newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    try {
      setSavingPass(true);
      const data = await api.put('/profile', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setSuccessMsg(data.message || 'Password changed securely!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header-bar">
        <div>
          <h1>Account & Application Settings</h1>
          <p>
            Configure your AI Tutor explanation style, study goals, and account
            security
          </p>
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

      <div className="dashboard-grid-2">
        {/* Learning & AI Tutor Preferences */}
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3>
                <Sparkles size={18} className="text-purple" /> Learning & AI
                Preferences
              </h3>
              <p>Customize how LearnSpace and the Gemini AI Tutor work for you</p>
            </div>
          </div>

          <form onSubmit={handleSavePreferences} className="settings-form">
            <div className="form-group">
              <label htmlFor="pref-ai-style">
                Default AI Tutor Explanation Style
              </label>
              <select
                id="pref-ai-style"
                value={preferences.aiExplanationStyle}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    aiExplanationStyle: e.target.value,
                  }))
                }
              >
                <option value="step-by-step">
                  Step-by-Step Guided Walkthrough (Recommended)
                </option>
                <option value="concise">
                  Concise Exam Revision Bullet Points
                </option>
                <option value="detailed">
                  Detailed University Lecture Depth
                </option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pref-hours">
                Weekly Study Target (Hours / Week):{' '}
                <strong>{preferences.weeklyStudyGoalHours} hrs</strong>
              </label>
              <input
                id="pref-hours"
                type="range"
                min="2"
                max="40"
                value={preferences.weeklyStudyGoalHours}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    weeklyStudyGoalHours: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div className="toggle-list">
              <label className="toggle-row">
                <div>
                  <strong>Course & Progress Notifications</strong>
                  <span>Receive updates when you complete lessons or courses</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      emailNotifications: e.target.checked,
                    }))
                  }
                />
              </label>

              <label className="toggle-row">
                <div>
                  <strong>Quiz Assessment Reminders</strong>
                  <span>Remind me to take course quizzes after completing lessons</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.quizReminders}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      quizReminders: e.target.checked,
                    }))
                  }
                />
              </label>

              <label className="toggle-row">
                <div>
                  <strong>Compact Left Sidebar by Default</strong>
                  <span>Start with a collapsed icon-only navigation sidebar</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.compactSidebar}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      compactSidebar: e.target.checked,
                    }))
                  }
                />
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingPrefs}
            >
              <Save size={17} />
              <span>
                {savingPrefs ? 'Saving Preferences...' : 'Save Preferences'}
              </span>
            </button>
          </form>
        </div>

        {/* Security & Password Change */}
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3>
                <ShieldCheck size={18} className="text-blue" /> Change Password
                Securely
              </h3>
              <p>
                Passwords are encrypted with bcrypt before being stored in MongoDB
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="settings-form">
            <div className="form-group">
              <label htmlFor="curr-pass">Current Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="curr-pass"
                  type="password"
                  placeholder="Enter your current password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="new-pass">New Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="new-pass"
                  type="password"
                  placeholder="At least 6 characters"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="conf-pass">Confirm New Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="conf-pass"
                  type="password"
                  placeholder="Re-enter your new password"
                  value={passwords.confirmNewPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      confirmNewPassword: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingPass}
            >
              <Lock size={17} />
              <span>
                {savingPass ? 'Updating Password...' : 'Update Password'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;

