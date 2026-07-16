import React from 'react';
import { useNavigate } from 'react-router-dom';
import Typewriter from 'typewriter-effect';
import { ArrowRight } from 'lucide-react';

export default function LandingPage({ isAuthenticated }) {
    const navigate = useNavigate();

    return (
        <section className="hero-section section-padding container">
            <span className="badge-accent hero-badge">Startup blueprint builder</span>
            <h1 className="display hero-title">
                <Typewriter
                    options={{
                        strings: [
                            'From Idea to Blueprint in Minutes.',
                            'Plan Your Startup with AI Agents.',
                            'Build a Clear Launch Roadmap.',
                        ],
                        autoStart: true,
                        loop: true,
                        delay: 45,
                        deleteSpeed: 24,
                    }}
                />
            </h1>
            <p className="text-secondary hero-copy">
                Turn a rough startup idea into a focused blueprint with guided agents for market, finance, and technical planning.
            </p>

            <div className="hero-panel">
                <h3>Ready to build your startup?</h3>
                <p className="text-muted">Start with one focused idea and let the workflow collect the signals it needs.</p>
                <div className="hero-actions">
                    <button className="button-primary" onClick={() => navigate(isAuthenticated ? '/idea-prompt' : '/login')}>
                        {isAuthenticated ? 'Continue workflow' : 'Login to get started'}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </section>
    );
}
