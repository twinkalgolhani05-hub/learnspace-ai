import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Topbar = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const loadNotifications = async () => {
      try {
        const data = await api.get('/progress');
        if (mounted && data?.recentActivities) {
          const items = data.recentActivities.slice(0, 5);
          setNotifications(items);
          setUnreadCount(Math.min(items.length, 3));
        }
      } catch {
        // Ignore silent notification fetch error
      }
    };
    loadNotifications();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/courses?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/courses');
    }
  };

  const getInitials = (name = 'Student') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getActivityIcon = (type) => {
    if (type === 'quiz_completed') return <Award size={16} className="text-purple" />;
    if (type === 'lesson_completed' || type === 'course_completed')
      return <CheckCircle2 size={16} className="text-emerald" />;
    if (type === 'ai_tutor_query') return <Sparkles size={16} className="text-blue" />;
    return <BookOpen size={16} className="text-blue" />;
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div
          className="topbar-logo-mobile"
          onClick={() => navigate('/dashboard')}
          role="button"
          tabIndex={0}
        >
          <GraduationCap size={20} />
          <span>LearnSpace</span>
        </div>

        <form className="topbar-search" onSubmit={handleSearchSubmit}>
          <Search size={18} className="topbar-search-icon" />
          <input
            type="text"
            placeholder="Search courses, topics, or instructors (e.g. Data Structures, SQL, AI)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search courses"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery('');
                navigate('/courses');
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="topbar-ai-shortcut"
          onClick={() => navigate('/ai-tutor')}
        >
          <Sparkles size={16} />
          <span>Ask AI Tutor</span>
        </button>

        <div className="notif-wrapper" ref={notifRef}>
          <button
            type="button"
            className="topbar-icon-btn"
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setUnreadCount(0);
            }}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <h4>Recent Learning Activity</h4>
                <button
                  type="button"
                  className="text-link-btn"
                  onClick={() => {
                    setNotifOpen(false);
                    navigate('/progress');
                  }}
                >
                  View All
                </button>
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <p className="notif-empty">No recent learning notifications yet.</p>
                ) : (
                  notifications.map((item) => (
                    <div key={item._id} className="notif-item">
                      <div className="notif-item-icon">
                        {getActivityIcon(item.actionType)}
                      </div>
                      <div className="notif-item-body">
                        <p className="notif-item-title">{item.title}</p>
                        <span className="notif-item-sub">{item.details}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className="topbar-profile"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          title="View Student Profile"
        >
          <div className="avatar-circle">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <span>{getInitials(user?.name)}</span>
            )}
          </div>
          <div className="topbar-profile-info">
            <span className="topbar-profile-name">{user?.name || 'Student'}</span>
            <span className="topbar-profile-role">
              {user?.semester || 'Computer Science'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

