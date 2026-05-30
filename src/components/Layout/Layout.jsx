
import { useLocation, Outlet } from 'react-router-dom';
import { HelpCircle, User } from 'lucide-react';
import logo from '../../assets/logo.png';

export default function Layout({ language = 'mm' }) {
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
          <img 
            src={logo} 
            alt="Strivo Logo" 
            style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px' }} 
          />
          <div className="flex items-center relative">
            <span className="font-bold text-base" style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Strivo
            </span>
            {!isOnboarding && (
              <>
                <span style={{ color: 'var(--border-dark)', marginLeft: '8px', marginRight: '8px' }}>/</span>
                <span className="font-mono text-xs flex items-center gap-1 hover:text-txt-primary transition-colors" 
                      style={{ color: 'var(--text-secondary)' }}>
                  workspace
                </span>
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
