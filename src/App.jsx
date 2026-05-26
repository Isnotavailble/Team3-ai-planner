import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, HelpCircle, User, LayoutDashboard, Sparkles, ChevronDown } from 'lucide-react';
import api from './services/api';
import Onboarding from './components/Onboarding/Onboarding';
import Drilldown from './components/Sidebar/Drilldown';
import AIReportPage from './components/AIReportPage/AIReportPage';
import AgentChat from './components/Interrogate/AgentChat';
import DynamicKPICards from './components/Dashboard/DynamicKPICards';
import TrendChart from './components/Dashboard/TrendChart';
import RecentSignals from './components/Dashboard/RecentSignals';
import MarketGraphCard from './components/Dashboard/MarketGraphCard';
import CategorizedMetrics from './components/Dashboard/CategorizedMetrics';

export const mockHistories = [
  {
    id: 'current',
    name: 'B2B SaaS Growth Strategy — Today',
    profile: {
      businessType: 'B2B SaaS',
      productService: 'Inventory Management',
      businessChallenges: 'Market Penetration, Lead Generation',
      dailySales: '450',
      monthlyRevenue: '120000',
      budget: '25000',
      customerInfo: 'SMB Retailers, Wholesalers',
      marketingActivities: 'Ads, Content Marketing, B2B Sales'
    }
  },
  {
    id: 'history1',
    name: 'Q3 Supply Chain Optimization — Yesterday',
    profile: {
      businessType: 'Logistics',
      productService: 'Freight Forwarding',
      businessChallenges: 'Cost Reduction, Route Efficiency',
      dailySales: '120',
      monthlyRevenue: '350000',
      budget: '50000',
      customerInfo: 'Manufacturers, Distributors',
      marketingActivities: 'Trade Shows, Direct Sales'
    }
  },
  {
    id: 'history2',
    name: 'Enterprise Penetration Analysis — Oct 12',
    profile: {
      businessType: 'Enterprise Software',
      productService: 'ERP System',
      businessChallenges: 'Long Sales Cycles, High CAC',
      dailySales: '2',
      monthlyRevenue: '800000',
      budget: '150000',
      customerInfo: 'Fortune 500, Procurement Officers',
      marketingActivities: 'ABM, Executive Events, Outbound'
    }
  }
];

function Layout({ isGlobalChatOpen, setIsGlobalChatOpen, activeHistoryId, setActiveHistoryId }) {
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
                        <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">Session History</span>
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
              <HelpCircle size={16} /> Help & Guides
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
              <Sparkles size={12} className={isGlobalChatOpen ? 'text-txt-primary' : ''} /> Ask AI
            </button>

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 rounded-md cursor-pointer text-xs font-medium"
              style={{
                background: 'transparent', border: '1px solid var(--border-default)',
                height: '32px', padding: '0 12px', color: 'var(--text-secondary)'
              }}
            >
              <Plus size={12} /> New Session
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

function Dashboard({ workspace, businessProfile, isGlobalChatOpen, setIsGlobalChatOpen, globalChatAgents, setGlobalChatAgents }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Determine drawer state from route path OR global state
  let drawerType = null;
  if (isGlobalChatOpen) drawerType = 'chat';
  else if (location.pathname.includes('/drilldown')) drawerType = 'drilldown';

  // Keyboard shortcut listener
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
  }, [drawerType, navigate, isGlobalChatOpen, setIsGlobalChatOpen]);

  const handleSelectNode = React.useCallback((id) => {
    setSelectedNodeId(id);
    navigate('/workspace/drilldown');
  }, [navigate]);

  const handleStartInterrogation = React.useCallback((agentsList) => {
    setGlobalChatAgents(agentsList);
    setIsGlobalChatOpen(true);
  }, [setGlobalChatAgents, setIsGlobalChatOpen]);

  const selectedEntity = workspace.entities.find(e => e.id === selectedNodeId);

  // PERFORMANCE FIX: Memoize main content to prevent Recharts from lagging drawer animations
  const mainContent = React.useMemo(() => {
    if (location.pathname.includes('/predict')) {
      return <AIReportPage onStartInterrogation={handleStartInterrogation} />;
    }
    return (
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Strategic Dashboard
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Market intelligence overview · Updated just now
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/workspace/predict')}
              className="flex items-center gap-1.5 border-none rounded-lg cursor-pointer text-xs font-medium px-4 py-2 transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
            >
              <Play size={12} fill="currentColor" /> Run Prediction
            </button>
          </div>
        </div>

        {/* KPI Cards Row */}
        <DynamicKPICards workspace={workspace} />

        {/* Categorized Metrics */}
        {businessProfile && (
          <CategorizedMetrics profile={businessProfile} />
        )}

        {/* Two-column layout: Trend Chart + Signals */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <TrendChart workspace={workspace} />
          </div>
          <div className="lg:col-span-2">
            <RecentSignals materials={workspace.materials} />
          </div>
        </div>

        {/* Market Graph Card */}
        <MarketGraphCard
          entities={workspace.entities}
          edges={workspace.edges}
          selectedId={selectedNodeId}
          onSelectNode={handleSelectNode}
        />
      </div>
    );
  }, [location.pathname, workspace, businessProfile, selectedNodeId, navigate, handleStartInterrogation, handleSelectNode]);

  return (
    <div className="flex h-full" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* MAIN DASHBOARD CONTENT */}
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
        {mainContent}
      </div>

      {/* SIDEBAR INLINE DRAWER (WITH SMOOTH SLIDE ANIMATION) */}
      <AnimatePresence mode="wait">
        {drawerType && (
          <motion.div
            key={drawerType}
            initial={{ x: 380, opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0.8 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            style={{ zIndex: 3, height: '100%', position: 'relative' }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [baseWorkspace, setBaseWorkspace] = useState({
    entities: [],
    edges: [],
    materials: []
  });

  const [workspace, setWorkspace] = useState({
    entities: [],
    edges: [],
    materials: []
  });

  const [activeHistoryId, setActiveHistoryId] = useState('current');

  const [businessProfile, setBusinessProfile] = useState(
    mockHistories.find(h => h.id === 'current').profile
  );

  useEffect(() => {
    const history = mockHistories.find(h => h.id === activeHistoryId);
    if (history) {
      setBusinessProfile(history.profile);
    }
  }, [activeHistoryId]);

  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);
  const [globalChatAgents, setGlobalChatAgents] = useState([]);

  const navigate = useNavigate();

  // Fetch base workspace data on mount
  useEffect(() => {
    async function load() {
      const data = await api.getWorkspaceData();
      setBaseWorkspace(data);
    }
    load();
  }, []);

  // Compute dynamic workspace data for history simulation
  useEffect(() => {
    if (!baseWorkspace.entities.length) return;

    let sliceRatio = 1; // current
    if (activeHistoryId === 'history1') sliceRatio = 0.6;
    if (activeHistoryId === 'history2') sliceRatio = 0.35;

    const sliceArr = (arr, ratio) => arr.slice(0, Math.max(1, Math.floor(arr.length * ratio)));

    setWorkspace({
      entities: sliceArr(baseWorkspace.entities, sliceRatio),
      edges: sliceArr(baseWorkspace.edges, sliceRatio),
      materials: sliceArr(baseWorkspace.materials, sliceRatio)
    });
  }, [activeHistoryId, baseWorkspace]);

  const handleOnboardingComplete = (profile) => {
    setBusinessProfile(profile);
    navigate('/workspace');
  };

  return (
    <Routes>
      <Route element={<Layout isGlobalChatOpen={isGlobalChatOpen} setIsGlobalChatOpen={setIsGlobalChatOpen} activeHistoryId={activeHistoryId} setActiveHistoryId={setActiveHistoryId} />}>
        <Route path="/" element={
          <Onboarding 
            onImportComplete={handleOnboardingComplete} 
            onSkipToSandbox={() => navigate('/workspace')} 
          />
        } />
        <Route path="/workspace/*" element={<Dashboard workspace={workspace} businessProfile={businessProfile} isGlobalChatOpen={isGlobalChatOpen} setIsGlobalChatOpen={setIsGlobalChatOpen} globalChatAgents={globalChatAgents} setGlobalChatAgents={setGlobalChatAgents} />} />
      </Route>
    </Routes>
  );
}
