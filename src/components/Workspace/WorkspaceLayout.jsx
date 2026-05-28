import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BarChart2, Target, TrendingUp, Settings } from 'lucide-react';
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
    return 'home';
  };

  const activeTab = getActiveTab();

  const navItems = [
    { id: 'home', path: '/workspace', label: t.navHome, labelEn: 'Home Briefing', icon: Home },
    { id: 'reports', path: '/workspace/reports', label: t.navReports, labelEn: 'Financial Reports', icon: BarChart2 },
    { id: 'goals', path: '/workspace/goals', label: t.navGoals, labelEn: 'Goals & Budget', icon: Target },
    { id: 'analytics', path: '/workspace/analytics', label: t.navAnalytics, labelEn: 'Analytics & Projections', icon: TrendingUp },
    { id: 'profile', path: '/workspace/profile', label: t.navProfile, labelEn: 'Profile & Settings', icon: Settings }
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex' }}>
      
      {/* LEFT NAVIGATION SIDEBAR */}
      <aside 
        style={{
          width: '260px',
          background: 'var(--bg-elevated)',
          borderRight: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 15,
          flexShrink: 0
        }}
      >
        {/* Sidebar Header / Logo area */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
          <div className="mono text-[10px] uppercase tracking-wider text-txt-tertiary mb-1" style={{ color: 'var(--text-secondary)' }}>
            Lattice MSME
          </div>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {language === 'mm' ? "လုပ်ငန်း စီမံခန့်ခွဲမှု" : "Business Navigator"}
          </h2>
        </div>

        {/* Sidebar Nav Links */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all border-none cursor-pointer ${isActive ? 'bg-surface-active text-txt-primary font-semibold' : 'hover:bg-surface-hover text-txt-secondary'}`}
                style={{
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)'
                }}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--accent)' : 'var(--text-tertiary)', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '13px', fontWeight: isActive ? '600' : '500' }}>{item.label}</span>
                  <span className="mono" style={{ fontSize: '9px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{item.labelEn}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer info */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
          <div className="mono" style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>
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
          left: '260px',
          top: 0,
          right: 0,
          bottom: 0,
          background: 'var(--bg-base)'
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
