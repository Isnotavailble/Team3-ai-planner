import { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import api, { calculateMissingSales } from './services/api';
import Onboarding from './components/Onboarding/Onboarding';
import Layout from './components/Layout/Layout';
import WorkspaceLayout from './components/Workspace/WorkspaceLayout';
import DashboardPage from './components/Dashboard/DashboardPage';
import ReportsView from './components/Dashboard/ReportsView';
import AnalyticsView from './components/Dashboard/AnalyticsView';
import ProfileView from './components/Dashboard/ProfileView';
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



  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const emptyProfileTemplate = useMemo(() => ({
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
  }), []);

  const [businessProfile, setBusinessProfile] = useState(emptyProfileTemplate);
  const [excelAuditResult, setExcelAuditResult] = useState(null);

  // Invalidate Excel Audit Cache on new sales history upload
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExcelAuditResult(null);
  }, [businessProfile?.salesHistory]);

  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const navigate = useNavigate();


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
  }, [emptyProfileTemplate]);

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
  }, [emptyProfileTemplate]);

  const userId = session?.user?.id;

  // Load User Profile from Database via Backend API
  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
          setBaseWorkspace(data);
        }
      } catch (err) {
        console.error('Failed to load user profile via backend:', err);
      } finally {
        setIsProfileLoading(false);
      }
    }

    loadUserProfile();
  }, [userId, mapDbProfileToBusinessProfile, emptyProfileTemplate]);

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
      sales: {
        ...(newProfile.sales || {}),
        ...calculatedSales
      }
    };

    setBusinessProfile(profileWithCalculatedSales);

    if (session) {
      try {
        console.log('Syncing profile updates to backend /workspace...');
        const data = await api.getWorkspaceData(profileWithCalculatedSales, true);
        if (data && data.profile) {
          console.log('Profile successfully updated via backend:', data.profile);
          setBusinessProfile(mapDbProfileToBusinessProfile(data.profile));
          setBaseWorkspace(data);
        }
      } catch (err) {
        console.error('Failed to sync profile update with backend:', err);
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHistoryLoading(true);
    const timer = setTimeout(() => {
      setIsHistoryLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);



  // Compute dynamic workspace data
  useEffect(() => {
    if (!baseWorkspace.entities.length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
              language={language}
              isLoading={isHistoryLoading || isProfileLoading}
            />
          } />
          
          <Route path="reports" element={
            <ReportsView 
              workspace={workspace} 
              businessProfile={businessProfile} 
              language={language}
              isLoading={isHistoryLoading || isProfileLoading}
              excelAuditResult={excelAuditResult}
              setExcelAuditResult={setExcelAuditResult}
            />
          } />

          <Route path="analytics" element={
            <AnalyticsView 
              workspace={workspace}
              businessProfile={businessProfile} 
              language={language}
              isLoading={isHistoryLoading || isProfileLoading}
            />
          } />

          <Route path="profile" element={
            <ProfileView 
              workspace={workspace} 
              businessProfile={businessProfile} 
              setBusinessProfile={updateBusinessProfile}
              language={language}
              setLanguage={setLanguage}
              isLoading={isHistoryLoading || isProfileLoading}
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
