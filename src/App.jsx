import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import api from './services/api';
import Onboarding from './components/Onboarding/Onboarding';
import Layout from './components/Layout/Layout';
import WorkspaceLayout from './components/Workspace/WorkspaceLayout';
import DashboardPage from './components/Dashboard/DashboardPage';
import ReportsView from './components/Dashboard/ReportsView';
import GoalsView from './components/Dashboard/GoalsView';
import AnalyticsView from './components/Dashboard/AnalyticsView';
import ProfileView from './components/Dashboard/ProfileView';
import DirectoryView from './components/Dashboard/DirectoryView';
import { mockHistories } from './data/mockHistories';

export default function App() {
  const [language, setLanguage] = useState('mm'); // 'mm' (default) | 'en'

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

  const [dashboardData, setDashboardData] = useState(null);

  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // Initialize with empty profile or default shape
  const [businessProfile, setBusinessProfile] = useState(
    mockHistories.find(h => h.id === 'current').profile
  );

  useEffect(() => {
    setIsHistoryLoading(true);
    const timer = setTimeout(() => {
      setIsHistoryLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);
  const [globalChatAgents, setGlobalChatAgents] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const navigate = useNavigate();

  // Fetch workspace data on mount and when businessProfile updates
  useEffect(() => {
    async function load() {
      const data = await api.getWorkspaceData(businessProfile);
      setBaseWorkspace(data);
      const dData = await api.getDashboardData(businessProfile, language);
      setDashboardData(dData);
    }
    load();
  }, [businessProfile, language]);

  // Compute dynamic workspace data (no longer split by activeHistoryId)
  useEffect(() => {
    if (!baseWorkspace.entities.length) return;
    setWorkspace({
      entities: baseWorkspace.entities,
      edges: baseWorkspace.edges,
      materials: baseWorkspace.materials
    });
  }, [baseWorkspace]);

  const handleOnboardingComplete = (profile) => {
    setBusinessProfile(profile);
    setIsHistoryLoading(true);
    setTimeout(() => {
      setIsHistoryLoading(false);
    }, 1000);
    navigate('/workspace');
  };

  const handleSkipToSandbox = () => {
    setIsHistoryLoading(true);
    setTimeout(() => {
      setIsHistoryLoading(false);
    }, 1000);
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
          language={language}
        />
      }>
        <Route path="/" element={
          <Onboarding 
            onImportComplete={handleOnboardingComplete} 
            onSkipToSandbox={handleSkipToSandbox} 
            language={language}
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
            language={language}
          />
        }>
          <Route index element={
            <DashboardPage 
              workspace={workspace} 
              businessProfile={businessProfile} 
              dashboardData={dashboardData}
              selectedNodeId={selectedNodeId}
              handleSelectNode={handleSelectNode}
              language={language}
            />
          } />
          
          {/* Workspace node drilldown page */}
          <Route path="drilldown" element={
            <DashboardPage 
              workspace={workspace} 
              businessProfile={businessProfile} 
              dashboardData={dashboardData}
              selectedNodeId={selectedNodeId}
              handleSelectNode={handleSelectNode}
              language={language}
            />
          } />
          
          {/* Financial Reports sub-page */}
          <Route path="reports" element={
            <ReportsView 
              workspace={workspace} 
              businessProfile={businessProfile} 
              language={language}
            />
          } />

          {/* Goals & Budget sub-page */}
          <Route path="goals" element={
            <GoalsView 
              workspace={workspace} 
              businessProfile={businessProfile} 
              setBusinessProfile={setBusinessProfile}
              language={language}
            />
          } />

          {/* Analytics & Prediction simulation sub-page */}
          <Route path="analytics" element={
            <AnalyticsView 
              workspace={workspace}
              businessProfile={businessProfile} 
              onStartInterrogation={handleStartInterrogation}
              language={language}
            />
          } />

          {/* Profile settings sub-page */}
          <Route path="profile" element={
            <ProfileView 
              workspace={workspace} 
              businessProfile={businessProfile} 
              setBusinessProfile={setBusinessProfile}
              language={language}
              setLanguage={setLanguage}
            />
          } />

          {/* Directory sub-page */}
          <Route path="directory" element={
            <DirectoryView 
              businessProfile={businessProfile} 
              setBusinessProfile={setBusinessProfile}
              language={language}
            />
          } />
        </Route>
      </Route>
    </Routes>
  );
}
