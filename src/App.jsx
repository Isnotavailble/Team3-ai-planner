import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import api from './services/api';
import Onboarding from './components/Onboarding/Onboarding';
import AIReportPage from './components/AIReportPage/AIReportPage';
import Layout from './components/Layout/Layout';
import WorkspaceLayout from './components/Workspace/WorkspaceLayout';
import DashboardPage from './components/Dashboard/DashboardPage';
import { mockHistories } from './data/mockHistories';

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
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const [businessProfile, setBusinessProfile] = useState(
    mockHistories.find(h => h.id === 'current').profile
  );

  useEffect(() => {
    setIsHistoryLoading(true);
    const timer = setTimeout(() => {
      setIsHistoryLoading(false);
    }, 1000);

    const history = mockHistories.find(h => h.id === activeHistoryId);
    if (history) {
      setBusinessProfile(history.profile);
    }

    return () => clearTimeout(timer);
  }, [activeHistoryId]);

  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);
  const [globalChatAgents, setGlobalChatAgents] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

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
    setIsHistoryLoading(true);
    setTimeout(() => {
      setIsHistoryLoading(false);
    }, 4000);
    navigate('/workspace');
  };

  const handleSelectNode = useCallback((id) => {
    setSelectedNodeId(id);
    navigate('/workspace/drilldown');
  }, [navigate]);

  const handleStartInterrogation = useCallback((agentsList) => {
    setGlobalChatAgents(agentsList);
    setIsGlobalChatOpen(true);
  }, [setGlobalChatAgents, setIsGlobalChatOpen]);

  return (
    <Routes>
      <Route element={
        <Layout 
          isGlobalChatOpen={isGlobalChatOpen} 
          setIsGlobalChatOpen={setIsGlobalChatOpen} 
          activeHistoryId={activeHistoryId} 
          setActiveHistoryId={setActiveHistoryId} 
        />
      }>
        <Route path="/" element={
          <Onboarding 
            onImportComplete={handleOnboardingComplete} 
            onSkipToSandbox={() => navigate('/workspace')} 
          />
        } />
        
        <Route path="/workspace" element={
          <WorkspaceLayout 
            workspace={workspace} 
            isHistoryLoading={isHistoryLoading}
            isGlobalChatOpen={isGlobalChatOpen}
            setIsGlobalChatOpen={setIsGlobalChatOpen}
            globalChatAgents={globalChatAgents}
            setGlobalChatAgents={setGlobalChatAgents}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            handleSelectNode={handleSelectNode}
          />
        }>
          {/* Main workspace index: Dashboard Page */}
          <Route index element={
            <DashboardPage 
              workspace={workspace} 
              businessProfile={businessProfile} 
              selectedNodeId={selectedNodeId}
              handleSelectNode={handleSelectNode}
            />
          } />
          
          {/* Workspace node drilldown page */}
          <Route path="drilldown" element={
            <DashboardPage 
              workspace={workspace} 
              businessProfile={businessProfile} 
              selectedNodeId={selectedNodeId}
              handleSelectNode={handleSelectNode}
            />
          } />
          
          {/* Workspace predictive simulation page */}
          <Route path="predict" element={
            <AIReportPage onStartInterrogation={handleStartInterrogation} />
          } />
        </Route>
      </Route>
    </Routes>
  );
}
