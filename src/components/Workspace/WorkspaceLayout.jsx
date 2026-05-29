import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Home, BarChart2, TrendingUp, Settings } from 'lucide-react';
import { translations } from '../../data/translations';

export default function WorkspaceLayout({
  workspace,
  language = 'mm'
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];
  const [hoveredItem, setHoveredItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SIDEBAR_COLLAPSED = 56;
  const SIDEBAR_EXPANDED = 220;

  // Determine active tab
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith('/reports')) return 'reports';
    if (path.endsWith('/analytics')) return 'analytics';
    if (path.endsWith('/profile')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  const navItems = [
    { id: 'home', path: '/workspace', label: t.navHome, icon: Home },
    { id: 'reports', path: '/workspace/reports', label: t.navReports, icon: BarChart2 },
    { id: 'analytics', path: '/workspace/analytics', label: t.navAnalytics, icon: TrendingUp },
    { id: 'profile', path: '/workspace/profile', label: t.navProfile, icon: Settings }
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex' }}>
      
      {/* LEFT NAVIGATION SIDEBAR */}
      <aside
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => { setSidebarOpen(false); setHoveredItem(null); }}
        style={{
          width: sidebarOpen ? `${SIDEBAR_EXPANDED}px` : `${SIDEBAR_COLLAPSED}px`,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 15,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Sidebar Nav Links */}
        <nav style={{ padding: '16px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  background: isActive ? 'var(--accent-soft)' : hoveredItem === item.id ? 'var(--surface-hover)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'background 0.15s ease'
                }}
              >
                <Icon
                  size={20}
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
                    flexShrink: 0
                  }}
                />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isActive ? '600' : '500',
                    opacity: sidebarOpen ? 1 : 0,
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-8px)',
                    transition: 'opacity 0.18s ease, transform 0.18s ease',
                    pointerEvents: 'none'
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer info */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div
            className="mono"
            style={{
              fontSize: '9px',
              color: 'var(--text-tertiary)',
              whiteSpace: 'nowrap',
              opacity: sidebarOpen ? 1 : 0,
              transition: 'opacity 0.18s ease',
              padding: '0 2px'
            }}
          >
            SYSTEM ONLINE &middot; V1.0.0
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT OUTLET (OFFSET BY SIDEBAR WIDTH) */}
      <div
        className="overflow-y-auto overflow-x-hidden"
        style={{
          scrollBehavior: 'smooth',
          position: 'absolute',
          left: sidebarOpen ? `${SIDEBAR_EXPANDED}px` : `${SIDEBAR_COLLAPSED}px`,
          top: 0,
          right: 0,
          bottom: 0,
          background: 'var(--bg-base)',
          transition: 'left 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
