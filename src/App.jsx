import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import api from './services/api';
import Onboarding from './components/Onboarding/Onboarding';
import Layout from './components/Layout/Layout';
import WorkspaceLayout from './components/Workspace/WorkspaceLayout';
import DashboardPage from './components/Dashboard/DashboardPage';
import ReportsView from './components/Dashboard/ReportsView';
import AnalyticsView from './components/Dashboard/AnalyticsView';
import ProfileView from './components/Dashboard/ProfileView';
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
  const [baseInsights, setBaseInsights] = useState(null);

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

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch workspace data on mount and when businessProfile updates
  useEffect(() => {
    if (!location.pathname.startsWith('/workspace')) return;
    async function load() {
      const data = await api.getWorkspaceData(businessProfile);
      setBaseWorkspace(data);
      const dData = await api.getDashboardData(businessProfile, language);
      setDashboardData(dData);
      const insights = await api.getInsights(businessProfile, language);
      setBaseInsights(insights);
    }
    load();
  }, [businessProfile, language, location.pathname]);

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

  return (
    <Routes>
      <Route element={
        <Layout language={language} />
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
            language={language}
          />
        }>
          <Route index element={
            <DashboardPage 
              workspace={workspace} 
              businessProfile={businessProfile} 
              dashboardData={dashboardData}
              language={language}
            />
          } />
          
          {/* Financial Reports sub-page */}
          <Route path="reports" element={
            <ReportsView 
              workspace={workspace} 
              businessProfile={businessProfile} 
              dashboardData={dashboardData}
              language={language}
            />
          } />

          {/* Analytics sub-page */}
          <Route path="analytics" element={
            <AnalyticsView 
              workspace={workspace}
              businessProfile={businessProfile} 
              language={language}
              baseInsights={baseInsights}
              setBaseInsights={setBaseInsights}
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
        </Route>
      </Route>
    </Routes>
  );
}
