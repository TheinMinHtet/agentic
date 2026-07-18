'use client';

import React, { useState, useRef } from 'react';
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

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  return (
    <nav className="navbar navbar-dark-landing">
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
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <WorkflowProvider>
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            style={{ 
              minHeight: '100vh', 
              display: 'flex', 
              flexDirection: 'column', 
              backgroundColor: '#080B11',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Global cursor-tracking spotlight */}
            <div
              className="landing-spotlight"
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1,
                transition: 'background 0.12s ease-out',
                background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 242, 254, 0.12), rgba(99, 102, 241, 0.06) 35%, transparent 75%)`
              }}
            />

            <Navbar />
            <main className="app-main" style={{ position: 'relative', zIndex: 10 }}>
              {children}
            </main>
            <Footer isLanding={isLanding} />
          </div>
        </WorkflowProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
