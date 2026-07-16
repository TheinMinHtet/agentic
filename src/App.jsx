import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Sparkles } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import IdeaPromptPage from './pages/IdeaPromptPage';
import BusinessInfoPage from './pages/BusinessInfoPage';
import PlanningPage from './pages/PlanningPage';
import SpecializedAgentsPage from './pages/SpecializedAgentsPage';
import DashboardPage from './pages/DashboardPage';
import RefinementPage from './pages/RefinementPage';
import './App.css';

const AUTH_STORAGE_KEY = 'agentic:isAuthenticated';

function Navbar({ isAuthenticated, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="brand-link" aria-label="Agentic Workflow home">
        <span className="brand-mark"><Sparkles size={18} /></span>
        <span>Agentic Workflow</span>
      </Link>
      <div className="nav-actions">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
        {isAuthenticated && (
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
        )}
        {isAuthenticated ? (
          <button type="button" className="button-secondary nav-auth-button" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        ) : (
          <Link to="/login" className="button-primary nav-auth-button">
            <LogIn size={18} />
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(AUTH_STORAGE_KEY) === 'true');

  const handleLogin = () => {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<LandingPage isAuthenticated={isAuthenticated} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/idea-prompt" element={<IdeaPromptPage />} />
          <Route path="/business-info" element={<BusinessInfoPage />} />
          <Route path="/planning" element={<PlanningPage />} />
          <Route path="/specialized-agents" element={<SpecializedAgentsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/refinement" element={<RefinementPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
