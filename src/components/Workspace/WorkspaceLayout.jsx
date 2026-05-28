import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BarChart2, Target, TrendingUp, Settings, Database } from 'lucide-react';
import Drilldown from '../Sidebar/Drilldown';
import AgentChat from '../Interrogate/AgentChat';
import WorkspaceSkeleton from './WorkspaceSkeleton';
import { translations } from '../../data/translations';

export default function WorkspaceLayout({
  workspace,
  isHistoryLoading,
  isGlobalChatOpen,
  setIsGlobalChatOpen,
  globalChatAgents,
  setGlobalChatAgents,
  selectedNodeId,
  setSelectedNodeId,
  handleSelectNode,
  language = 'mm'
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];
  const [hoveredItem, setHoveredItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SIDEBAR_COLLAPSED = 56;
  const SIDEBAR_EXPANDED = 220;

  // Determine drawer state from route path OR global state
  let drawerType = null;
  if (isGlobalChatOpen) drawerType = 'chat';
  else if (location.pathname.includes('/drilldown')) drawerType = 'drilldown';

  // Keyboard shortcut listener for Esc key closing drawer panels
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedNodeId(null);
        if (isGlobalChatOpen) setIsGlobalChatOpen(false);
        else if (drawerType === 'drilldown') navigate('/workspace');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerType, navigate, isGlobalChatOpen, setIsGlobalChatOpen, setSelectedNodeId]);

  const selectedEntity = workspace.entities.find(e => e.id === selectedNodeId);

  // Determine active tab
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith('/reports')) return 'reports';
    if (path.endsWith('/goals')) return 'goals';
    if (path.endsWith('/analytics')) return 'analytics';
    if (path.endsWith('/profile')) return 'profile';
    if (path.endsWith('/directory')) return 'directory';
    return 'home';
  };

  const activeTab = getActiveTab();

  const navItems = [
    { id: 'home', path: '/workspace', label: t.navHome, icon: Home },
    { id: 'directory', path: '/workspace/directory', label: t.navDirectory || (language === 'mm' ? "အချက်အလက်များ" : "Directory"), icon: Database },
    { id: 'reports', path: '/workspace/reports', label: t.navReports, icon: BarChart2 },
    { id: 'goals', path: '/workspace/goals', label: t.navGoals, icon: Target },
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
        {isHistoryLoading ? (
          <WorkspaceSkeleton pathname={location.pathname} />
        ) : (
          <Outlet />
        )}
      </div>

      {/* SIDEBAR OVERLAY DRAWER (HIGH-PERFORMANCE GPU ANIMATION) */}
      <AnimatePresence>
        {drawerType && (
          <motion.div
            key="dashboard-drawer-container"
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed',
              right: 0,
              top: '56px',
              bottom: 0,
              width: '380px',
              zIndex: 10,
              boxShadow: '-8px 0 24px rgba(0,0,0,0.06)',
              background: 'var(--surface-card)',
              borderLeft: '1px solid var(--border-light)',
              overflow: 'hidden'
            }}
          >
            <div style={{ width: '380px', height: '100%' }}>
              {drawerType === 'drilldown' && selectedEntity && (
                <Drilldown
                  entity={selectedEntity}
                  onClose={() => navigate('/workspace')}
                  onSelectEntity={handleSelectNode}
                  materials={workspace.materials}
                  edges={workspace.edges}
                />
              )}

              {drawerType === 'chat' && (
                <AgentChat
                  agents={globalChatAgents}
                  onClose={() => setIsGlobalChatOpen(false)}
                  onBackToReport={() => setIsGlobalChatOpen(false)}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
