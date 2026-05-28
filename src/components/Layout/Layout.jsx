import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, User, Plus, Sparkles, ChevronDown } from 'lucide-react';
import { mockHistories } from '../../data/mockHistories';

export default function Layout({ isGlobalChatOpen, setIsGlobalChatOpen, activeHistoryId, setActiveHistoryId, language = 'mm' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnboarding = location.pathname === '/';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const activeHistory = mockHistories.find(h => h.id === activeHistoryId);

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--surface-page)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
    >
      {/* GLOBAL HEADER */}
      <header className="flex justify-between items-center shrink-0"
        style={{
          height: '56px', padding: '0 24px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: isOnboarding ? 'rgba(255,255,255,0.6)' : 'var(--surface-card)',
          backdropFilter: isOnboarding ? 'blur(12px)' : 'none',
          zIndex: 20
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'var(--text-primary)' }}
          >
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div className="flex items-center cursor-pointer relative" 
                onClick={() => !isOnboarding && setIsDropdownOpen(!isDropdownOpen)}>
            <span className="font-bold text-base" style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Strivo
            </span>
            {!isOnboarding && (
              <>
                <span style={{ color: 'var(--border-dark)', marginLeft: '8px', marginRight: '8px' }}>/</span>
                <span className="font-mono text-xs flex items-center gap-1 hover:text-txt-primary transition-colors" 
                      style={{ color: 'var(--text-secondary)' }}>
                  {activeHistory?.name || 'workspace'} <ChevronDown size={14} />
                </span>
                
                {/* Popover Dropdown */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-4 w-80 bg-surface-card rounded-xl border border-border shadow-lg overflow-hidden z-50 flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-3 border-b border-border-light bg-surface-panel/50">
                        <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">
                          {language === 'mm' ? "စက်ရှင် မှတ်တမ်း" : "Session History"}
                        </span>
                      </div>
                      <div className="p-2 space-y-1">
                        {mockHistories.map(h => (
                          <button key={h.id} 
                            onClick={(e) => { e.stopPropagation(); setActiveHistoryId(h.id); setIsDropdownOpen(false); }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between ${activeHistoryId === h.id ? 'bg-surface-active text-txt-primary font-medium' : 'hover:bg-surface-hover text-txt-secondary border-none cursor-pointer'}`}
                            style={activeHistoryId === h.id ? {border: '1px solid var(--border-light)'} : {background:'transparent'}}
                          >
                            <span className="truncate pr-2" style={{color: 'inherit'}}>{h.name}</span>
                            {activeHistoryId === h.id && <div className="w-2 h-2 rounded-full shrink-0" style={{background: 'var(--accent)'}} />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>

        {isOnboarding ? (
          <div className="flex items-center gap-4" style={{ color: 'var(--text-tertiary)' }}>
            <button className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-xs font-medium"
              style={{ color: 'inherit' }}
            >
              <HelpCircle size={16} /> {language === 'mm' ? "လမ်းညွှန်ချက်များ" : "Help & Guides"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">

            <button
              onClick={() => setIsGlobalChatOpen(!isGlobalChatOpen)}
              className="flex items-center gap-1.5 rounded-md cursor-pointer text-xs font-medium transition-all"
              style={{
                background: isGlobalChatOpen ? 'var(--surface-active)' : 'transparent', 
                border: '1px solid var(--border-default)',
                height: '32px', padding: '0 12px', 
                color: isGlobalChatOpen ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              <Sparkles size={12} className={isGlobalChatOpen ? 'text-txt-primary' : ''} /> {language === 'mm' ? "AI မေးမြန်းရန်" : "Ask AI"}
            </button>

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 rounded-md cursor-pointer text-xs font-medium"
              style={{
                background: 'transparent', border: '1px solid var(--border-default)',
                height: '32px', padding: '0 12px', color: 'var(--text-secondary)'
              }}
            >
              <Plus size={12} /> {language === 'mm' ? "အစမှ ပြန်စရန်" : "New Session"}
            </button>

            <div className="w-px h-4 mx-1" style={{ background: 'var(--border-default)' }} />

            <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: 'var(--surface-active)', color: 'var(--text-secondary)',
                border: '1px solid var(--border-light)'
              }}
            >
              <User size={16} />
            </div>
          </div>
        )}
      </header>

      {/* DYNAMIC CONTENT OUTLET */}
      <div className="flex-1 relative overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
