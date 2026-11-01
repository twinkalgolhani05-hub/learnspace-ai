import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  ClipboardCheck,
  TrendingUp,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Courses', path: '/courses', icon: BookOpen },
  { label: 'AI Tutor', path: '/ai-tutor', icon: Sparkles, badge: 'AI' },
  { label: 'Quizzes', path: '/quizzes', icon: ClipboardCheck },
  { label: 'My Progress', path: '/progress', icon: TrendingUp },
  { label: 'Profile', path: '/profile', icon: User },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${
          mobileOpen ? 'sidebar-mobile-open' : ''
        }`}
      >
        <div className="sidebar-header">
          <div
            className="sidebar-brand"
            onClick={() => {
              navigate('/dashboard');
              onCloseMobile();
            }}
            role="button"
            tabIndex={0}
          >
            <div className="brand-logo-box">
              <GraduationCap size={22} />
            </div>
            {!collapsed && (
              <div className="brand-text">
                <span className="brand-name">LearnSpace</span>
                <span className="brand-tag">AI Smart LMS</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="sidebar-collapse-btn desktop-only"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <button
            type="button"
            className="sidebar-collapse-btn mobile-only"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-nav-section">
          {!collapsed && <div className="sidebar-section-label">LEARNING MENU</div>}
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <IconComponent size={20} className="sidebar-link-icon" />
                  {!collapsed && (
                    <span className="sidebar-link-text">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="sidebar-badge">{item.badge}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-link sidebar-logout-btn"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={20} className="sidebar-link-icon" />
            {!collapsed && <span className="sidebar-link-text">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

