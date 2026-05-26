import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, HelpCircle, User, LayoutDashboard } from 'lucide-react';
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

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnboarding = location.pathname === '/';

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
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-bold text-base" style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Lattice B2B
          </span>
          {!isOnboarding && (
            <>
              <span style={{ color: 'var(--border-dark)', marginLeft: '8px' }}>/</span>
              <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>workspace</span>
            </>
          )}
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

function Dashboard({ workspace, businessProfile }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [chatAgents, setChatAgents] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Determine drawer state from route path
  let drawerType = null;
  if (location.pathname.includes('/chat')) drawerType = 'chat';
  else if (location.pathname.includes('/drilldown')) drawerType = 'drilldown';

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedNodeId(null);
        if (drawerType !== 'chat') navigate('/workspace');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerType, navigate]);

  const handleSelectNode = (id) => {
    setSelectedNodeId(id);
    navigate('/workspace/drilldown');
  };

  const handleStartInterrogation = (agentsList) => {
    setChatAgents(agentsList);
    navigate('/workspace/chat');
  };

  const selectedEntity = workspace.entities.find(e => e.id === selectedNodeId);

  return (
    <div className="flex h-full" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* MAIN DASHBOARD CONTENT */}
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
        {location.pathname.includes('/predict') ? (
          <AIReportPage onStartInterrogation={handleStartInterrogation} />
        ) : (
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
        )}
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
                agents={chatAgents}
                onClose={() => navigate('/workspace')}
                onBackToReport={() => navigate('/workspace/predict')}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [workspace, setWorkspace] = useState({
    entities: [],
    edges: [],
    materials: []
  });
  const [businessProfile, setBusinessProfile] = useState({
    businessType: 'B2B SaaS',
    productService: 'Inventory Management',
    businessChallenges: 'Market Penetration, Lead Generation',
    dailySales: '450',
    monthlyRevenue: '120000',
    budget: '25000',
    customerInfo: 'SMB Retailers, Wholesalers',
    marketingActivities: 'Ads, Content Marketing, B2B Sales'
  });

  const navigate = useNavigate();

  // Fetch workspace data on mount
  useEffect(() => {
    async function load() {
      const data = await api.getWorkspaceData();
      setWorkspace(data);
    }
    load();
  }, []);

  const handleOnboardingComplete = (profile) => {
    setBusinessProfile(profile);
    navigate('/workspace');
  };

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={
          <Onboarding 
            onImportComplete={handleOnboardingComplete} 
            onSkipToSandbox={() => navigate('/workspace')} 
          />
        } />
        <Route path="/workspace/*" element={<Dashboard workspace={workspace} businessProfile={businessProfile} />} />
      </Route>
    </Routes>
  );
}
