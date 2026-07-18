'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogIn, LogOut, Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Footer from './components/Footer';
import GlobalStepper from './components/GlobalStepper';
import { WorkflowProvider } from './context/WorkflowContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function Navbar() {
  const { isAuthenticated, loading, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  if (!mounted) {
    return (
      <nav className="navbar navbar-dark-landing">
        <Link href="/" className="brand-link" aria-label="LANN SA home" style={{ gap: '6px' }}>
          <img
            src="/lann-sa-final-logo.png"
            alt="LANN SA logo"
            style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'contain', flexShrink: 0, mixBlendMode: 'screen' }}
          />
          <span>LANN SA</span>
        </Link>
        <div className="nav-center-links">
          <span className="nav-link" style={{ opacity: 0 }}>{t('navbar.home')}</span>
        </div>
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0 }}>
          <button
            type="button"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '0.38rem 0.9rem', fontSize: '0.82rem', fontWeight: 600,
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#CBD5E1',
              minWidth: '80px', textAlign: 'center'
            }}
          >
            {language === 'en' ? '🇲🇲 မြန်မာ' : '🇬🇧 English'}
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar navbar-dark-landing">
      <Link href="/" className="brand-link" aria-label="LANN SA home" style={{ gap: '6px' }}>
        <img
          src="/lann-sa-final-logo.png"
          alt="LANN SA logo"
          style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'contain', flexShrink: 0, mixBlendMode: 'screen' }}
        />
        <span>LANN SA</span>
      </Link>
      <div className="nav-center-links">
        <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>{t('navbar.home')}</Link>
        {!loading && isAuthenticated && (
          <Link href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>{t('navbar.dashboard')}</Link>
        )}
      </div>
      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={toggleLanguage}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '0.38rem 0.9rem', fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer', borderRadius: '8px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#CBD5E1',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
            minWidth: '80px', textAlign: 'center'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.11)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.4)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#CBD5E1'; }}
        >
          {language === 'en' ? '🇲🇲 မြန်မာ' : '🇬🇧 English'}
        </button>
        {!loading && isAuthenticated ? (
          <button type="button" className="button-secondary nav-auth-button" onClick={handleLogout}>
            <LogOut size={18} />
            {t('navbar.logout')}
          </button>
        ) : !loading ? (
          <Link href="/login" className="button-primary nav-auth-button">
            <LogIn size={18} />
            {t('navbar.login')}
          </Link>
        ) : null}
      </div>
    </nav >
  );
}

export default function ClientShell({ children }) {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  return (
    <LanguageProvider>
      <AuthProvider>
        <WorkflowProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} suppressHydrationWarning>
            <Navbar />
            <main className="app-main" style={{ position: 'relative', zIndex: 10 }}>
              <GlobalStepper />
              {children}
            </main>
            <Footer isLanding={isLanding} />
          </div>
        </WorkflowProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
