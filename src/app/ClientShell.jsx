'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogIn, LogOut, Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Footer from './components/Footer';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLanding = pathname === '/';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  return (
    <nav className={`navbar ${isLanding ? 'navbar-dark-landing' : ''}`}>
      <Link href="/" className="brand-link" aria-label="Agentic Workflow home">
        <span className="brand-mark"><Sparkles size={18} /></span>
        <span>Agentic Workflow</span>
      </Link>
      <div className="nav-center-links">
        <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
        {isAuthenticated && (
          <Link href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
        )}
      </div>
      <div className="nav-actions">
        {isAuthenticated ? (
          <button type="button" className="button-secondary nav-auth-button" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        ) : (
          <Link href="/login" className="button-primary nav-auth-button">
            <LogIn size={18} />
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default function ClientShell({ children }) {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: isLanding ? '#080B11' : 'var(--color-background)' }}>
        <Navbar />
        <main className="app-main">
          {children}
        </main>
        <Footer isLanding={isLanding} />
      </div>
    </AuthProvider>
  );
}



