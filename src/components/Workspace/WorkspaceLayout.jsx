import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Drilldown from '../Sidebar/Drilldown';
import AgentChat from '../Interrogate/AgentChat';
import WorkspaceSkeleton from './WorkspaceSkeleton';

export default function WorkspaceLayout({
  workspace,
  isHistoryLoading,
  isGlobalChatOpen,
  setIsGlobalChatOpen,
  globalChatAgents,
  setGlobalChatAgents,
  selectedNodeId,
  setSelectedNodeId,
  handleSelectNode
}) {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* MAIN CONTENT OUTLET */}
      <div 
        className="overflow-y-auto overflow-x-hidden" 
        style={{ 
          scrollBehavior: 'smooth',
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0
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
