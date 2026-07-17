'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogIn, LogOut, Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkflowProvider } from './context/WorkflowContext';

function Navbar() {
  const { isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  return (
    <nav className="navbar">
      <Link href="/" className="brand-link" aria-label="Agentic Workflow home">
        <span className="brand-mark"><Sparkles size={18} /></span>
        <span>Agentic Workflow</span>
      </Link>
      <div className="nav-actions">
        <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
        {!loading && isAuthenticated && (
          <Link href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
        )}
        {!loading && isAuthenticated ? (
          <button type="button" className="button-secondary nav-auth-button" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        ) : !loading ? (
          <Link href="/login" className="button-primary nav-auth-button">
            <LogIn size={18} />
            Login
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

export default function ClientShell({ children }) {
  return (
    <AuthProvider>
      <WorkflowProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main className="app-main">
            {children}
          </main>
        </div>
      </WorkflowProvider>
    </AuthProvider>
  );
}

