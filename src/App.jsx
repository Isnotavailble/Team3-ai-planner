import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import api, { calculateMissingSales } from './services/api';
import Onboarding from './components/Onboarding/Onboarding';
import Layout from './components/Layout/Layout';
import WorkspaceLayout from './components/Workspace/WorkspaceLayout';
import DashboardPage from './components/Dashboard/DashboardPage';
import ReportsView from './components/Dashboard/ReportsView';
import AnalyticsView from './components/Dashboard/AnalyticsView';
import ProfileView from './components/Dashboard/ProfileView';
import { mockHistories } from './data/mockHistories';
import AuthPage from './components/AuthPage';
import { supabase } from './utils/supabaseClient';

export default function App() {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'mm' || saved === 'en') ? saved : 'mm';
  });

  const setLanguage = useCallback((newLang) => {
    if (newLang === 'mm' || newLang === 'en') {
      setLanguageState(newLang);
      localStorage.setItem('language', newLang);
    }
  }, []);

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

  const emptyProfileTemplate = {
    businessName: null,
    product: null,
    hasPOS: null,
    sales: { daily: null, weekly: null, monthly: null, yearly: null },
    expenses: null,
    rivals: [],
    customers: [],
    suppliers: [],
    products: [],
    salesHistory: [],
    targetScenario: null,
    expectedResult: null,
    thresholds: { inventoryLow: null }
  };

  const [businessProfile, setBusinessProfile] = useState(emptyProfileTemplate);

  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Listen to Supabase Auth State
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        localStorage.setItem('login', 'true');
      } else {
        localStorage.setItem('login', 'false');
        setIsProfileLoading(false);
      }
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        localStorage.setItem('login', 'true');
      } else {
        localStorage.setItem('login', 'false');
        setBusinessProfile(emptyProfileTemplate);
        setIsProfileLoading(false);
      }
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Map database profile columns to frontend businessProfile shape
  const mapDbProfileToBusinessProfile = useCallback((dbProfile) => {
    if (!dbProfile) return emptyProfileTemplate;
    return {
      businessName: dbProfile.business_name || null,
      product: dbProfile.product_category || null,
      hasPOS: dbProfile.has_pos !== null ? dbProfile.has_pos : null,
      sales: dbProfile.sales || { daily: null, weekly: null, monthly: null, yearly: null },
      expenses: dbProfile.monthly_expenses || null,
      rivals: dbProfile.rivals || [],
      customers: dbProfile.customers || [],
      suppliers: dbProfile.suppliers || [],
      products: dbProfile.products || [],
      salesHistory: dbProfile.sales_history || [],
      targetScenario: dbProfile.target_scenario || null,
      expectedResult: dbProfile.expected_result || null,
      thresholds: dbProfile.thresholds || { inventoryLow: null }
    };
  }, []);

  const userId = session?.user?.id;

  // Load User Profile from Database via Backend API
  useEffect(() => {
    if (!userId) {
      setIsProfileLoading(false);
      return;
    }

    async function loadUserProfile() {
      try {
        setIsProfileLoading(true);
        console.log('Loading profile for user via backend workspace API...');
        
        // Fetch workspace which handles profile load/insertion securely with Service Role
        const data = await api.getWorkspaceData(emptyProfileTemplate);
        
        if (data && data.profile) {
          console.log('User profile loaded from backend:', data.profile);
          setBusinessProfile(mapDbProfileToBusinessProfile(data.profile));
        }
      } catch (err) {
        console.error('Failed to load user profile via backend:', err);
      } finally {
        setIsProfileLoading(false);
      }
    }

    loadUserProfile();
  }, [userId, mapDbProfileToBusinessProfile]);

  // Sync profile updates (e.g. from settings, onboarding, dashboard) to Supabase DB via Backend API
  const updateBusinessProfile = async (updater) => {
    let newProfile;
    if (typeof updater === 'function') {
      newProfile = updater(businessProfile);
    } else {
      newProfile = updater;
    }

    // Auto-calculate missing periods
    const calculatedSales = calculateMissingSales(newProfile.sales);
    const profileWithCalculatedSales = {
      ...newProfile,
      sales: calculatedSales
    };

    setBusinessProfile(profileWithCalculatedSales);

    if (session) {
      try {
        console.log('Syncing profile updates to backend /workspace...');
        const data = await api.getWorkspaceData(profileWithCalculatedSales, true);
        if (data && data.profile) {
          console.log('Profile successfully updated via backend:', data.profile);
          setBusinessProfile(mapDbProfileToBusinessProfile(data.profile));
        }
      } catch (err) {
        console.error('Failed to sync profile update with backend:', err);
      }
    }
  };

  useEffect(() => {
    setIsHistoryLoading(true);
    const timer = setTimeout(() => {
      setIsHistoryLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch workspace data on mount and when businessProfile or language updates
  useEffect(() => {
    if (!userId) return; // Do not fetch if user is not logged in or logged out
    if (isProfileLoading) return; // Wait until profile loads!

    async function load() {
      const data = await api.getWorkspaceData(businessProfile);
      setBaseWorkspace(data);
      const dData = await api.getDashboardData(businessProfile, language);
      setDashboardData(dData);
      const insights = await api.getInsights(businessProfile, language);
      setBaseInsights(insights);
    }
    load();
  }, [businessProfile, language, isProfileLoading, userId]);

  // Compute dynamic workspace data
  useEffect(() => {
    if (!baseWorkspace.entities.length) return;
    setWorkspace({
      entities: baseWorkspace.entities,
      edges: baseWorkspace.edges,
      materials: baseWorkspace.materials
    });
  }, [baseWorkspace]);

  const handleOnboardingComplete = async (profile) => {
    setIsHistoryLoading(true);
    await updateBusinessProfile(profile);
    setTimeout(() => {
      setIsHistoryLoading(false);
      navigate('/workspace');
    }, 1000);
  };

  const handleSkipToSandbox = () => {
    setIsHistoryLoading(true);
    setTimeout(() => {
      setIsHistoryLoading(false);
      navigate('/workspace');
    }, 1000);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen light-mesh-bg" style={{ fontFamily: 'var(--font-sans)' }}></div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={
        session ? (
          <Navigate to="/workspace" replace />
        ) : (
          <AuthPage mode="login" onAuthSuccess={() => {}} />
        )
      } />

      <Route path="/register" element={
        session ? (
          <Navigate to="/workspace" replace />
        ) : (
          <AuthPage mode="register" onAuthSuccess={() => {}} />
        )
      } />

      {/* Main app flow */}
      <Route element={
        session ? (
          <Layout language={language} />
        ) : (
          <Navigate to="/login" replace />
        )
      }>
        
        {/* Redirect root to workspace */}
        <Route path="/" element={<Navigate to="/workspace" replace />} />

        {/* Protected workspace paths */}
        <Route path="/workspace" element={
          <WorkspaceLayout 
            workspace={workspace} 
            language={language}
          />
        }>
          <Route index element={
            <DashboardPage 
              workspace={workspace} 
              businessProfile={businessProfile} 
              dashboardData={dashboardData}
              language={language}
              isLoading={isHistoryLoading || isProfileLoading || !dashboardData}
            />
          } />
          
          <Route path="reports" element={
            <ReportsView 
              workspace={workspace} 
              businessProfile={businessProfile} 
              language={language}
              isLoading={isHistoryLoading || isProfileLoading || !dashboardData}
            />
          } />

          <Route path="analytics" element={
            <AnalyticsView 
              workspace={workspace}
              businessProfile={businessProfile} 
              language={language}
              baseInsights={baseInsights}
              setBaseInsights={setBaseInsights}
              isLoading={isHistoryLoading || isProfileLoading || !dashboardData}
            />
          } />

          <Route path="profile" element={
            <ProfileView 
              workspace={workspace} 
              businessProfile={businessProfile} 
              setBusinessProfile={updateBusinessProfile}
              language={language}
              setLanguage={setLanguage}
              isLoading={isHistoryLoading || isProfileLoading || !dashboardData}
            />
          } />
        </Route>
      </Route>

      {/* Standalone Onboarding Route (Full Screen, Protected) */}
      <Route path="/onboarding" element={
        session ? (
          <Onboarding 
            onImportComplete={handleOnboardingComplete} 
            onSkipToSandbox={handleSkipToSandbox} 
            language={language}
          />
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
