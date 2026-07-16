import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';

export default function LoginPage({ onLogin }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        onLogin();
        navigate('/idea-prompt');
    };

    const handleMockGoogle = () => {
        onLogin();
        navigate('/idea-prompt');
    };

    return (
        <section className="auth-section section-padding container">
            <div className="auth-card card">
                <span className="badge-accent auth-badge">
                    <ShieldCheck size={14} />
                    Secure workspace
                </span>
                <h2>Welcome back</h2>
                <p className="text-muted auth-copy">
                    Sign in to continue shaping your startup blueprint with the agent workflow.
                </p>
                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-field">
                        <label>Email or username</label>
                        <input
                            type="text"
                            className="input-text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label>Password</label>
                        <input
                            type="password"
                            className="input-text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" className="button-primary button-full">
                        Continue to workflow
                        <ArrowRight size={18} />
                    </button>
                </form>
                <div className="auth-divider"><span>or</span></div>
                <div>
                    <button className="button-secondary button-full" onClick={handleMockGoogle}>
                        <Mail size={18} />
                        Continue with Google
                    </button>
                </div>
            </div>
        </section>
    );
}
