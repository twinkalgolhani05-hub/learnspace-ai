import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(
    Boolean(user?.preferences?.compactSidebar)
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user?.preferences?.compactSidebar !== undefined) {
      setCollapsed(Boolean(user.preferences.compactSidebar));
    }
  }, [user?.preferences?.compactSidebar]);

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`main-wrapper ${collapsed ? 'main-wrapper-expanded' : ''}`}>
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

