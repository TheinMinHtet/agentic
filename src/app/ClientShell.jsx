'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogIn, LogOut, Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Footer from './components/Footer';
import { WorkflowProvider } from './context/WorkflowContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function Navbar() {
  const { isAuthenticated, loading, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const isDarkTheme = isLanding || pathname === '/login' || pathname === '/register';

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  return (
    <nav className={`navbar ${isDarkTheme ? 'navbar-dark-landing' : ''}`}>
      <Link href="/" className="brand-link" aria-label="Agentic Workflow home">
        <span className="brand-mark"><Sparkles size={18} /></span>
        <span>Agentic Workflow</span>
      </Link>
      <div className="nav-center-links">
        <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>{t('navbar.home')}</Link>
        {!loading && isAuthenticated && (
          <Link href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>{t('navbar.dashboard')}</Link>
        )}
      </div>
      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          className="button-secondary language-toggle-btn"
          onClick={toggleLanguage}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '8px', minWidth: '70px', textAlign: 'center' }}
        >
          {language === 'en' ? 'မြန်မာ' : 'English'}
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
    </nav>
  );
}

export default function ClientShell({ children }) {
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const isDarkTheme = isLanding || pathname === '/login' || pathname === '/register';

  return (
    <LanguageProvider>
      <AuthProvider>
        <WorkflowProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: isDarkTheme ? '#080B11' : 'var(--color-background)' }}>
            <Navbar />
            <main className="app-main">
              {children}
            </main>
            <Footer isLanding={isLanding} />
          </div>
        </WorkflowProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
