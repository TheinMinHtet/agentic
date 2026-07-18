'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    Layers, 
    ArrowRight, 
    ShieldCheck, 
    ExternalLink,
    Zap,
    Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Inline SVG social icons (lucide-react doesn't ship brand marks) ── */
function GitHubIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
    );
}
function TwitterIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
    );
}
function DiscordIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" />
            <path d="M7.5 7.2C9 6.4 10.5 6 12 6s3 .4 4.5 1.2c1 2 1.5 5 1.5 8 0 .5-.5 1-1.5 1.5-1-.5-2-1-3-1.5-.5.5-1 1-1.5 1s-1-.5-1.5-1c-1 .5-2 1-3 1.5-1-.5-1.5-1-1.5-1.5 0-3 .5-6 1.5-8Z" />
        </svg>
    );
}
function LinkedInIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />
        </svg>
    );
}

export default function Footer({ isLanding = true }) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    return (
        <footer className="footer-root">
            <style jsx>{`
                /* ─────────── ROOT ─────────── */
                .footer-root {
                    position: relative;
                    width: 100%;
                    background-color: #060810;
                    /* Same grid-dot background as the hero section */
                    background-image:
                        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 22px 22px;
                    color: #CBD5E1;
                    font-family: var(--font-inter, 'Inter', system-ui, -apple-system, sans-serif);
                    overflow: hidden;
                    z-index: 20;
                }

                /* Top gradient fade so the grid fades from the page above */
                .footer-root::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 180px;
                    background: linear-gradient(to bottom, #080B11, transparent);
                    pointer-events: none;
                    z-index: 1;
                }

                /* Soft ambient glow blobs */
                .footer-root::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 700px 400px at 15% 60%, rgba(99, 102, 241, 0.09) 0%, transparent 100%),
                        radial-gradient(ellipse 500px 350px at 80% 80%, rgba(0, 242, 254, 0.07) 0%, transparent 100%);
                    pointer-events: none;
                    z-index: 1;
                }

                .footer-inner {
                    position: relative;
                    z-index: 2;
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 28px;
                }

                /* ─────────── CTA BANNER ─────────── */
                .footer-cta {
                    position: relative;
                    margin-top: 64px;
                    margin-bottom: 72px;
                    padding: 44px 48px;
                    border-radius: 24px;
                    background: rgba(13, 18, 28, 0.7);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(129, 140, 248, 0.25);
                    box-shadow:
                        0 24px 64px rgba(0, 0, 0, 0.6),
                        inset 0 1px 1px rgba(255, 255, 255, 0.12);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 40px;
                    overflow: hidden;
                }

                .footer-cta::before {
                    content: '';
                    position: absolute;
                    width: 360px;
                    height: 360px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.2), transparent 70%);
                    top: -120px;
                    left: -80px;
                    pointer-events: none;
                }

                .footer-cta-text {
                    max-width: 600px;
                }

                .footer-cta-title {
                    font-family: var(--font-jakarta, 'Plus Jakarta Sans', system-ui, sans-serif);
                    font-size: 28px;
                    font-weight: 800;
                    color: #FFFFFF;
                    line-height: 1.2;
                    letter-spacing: -0.025em;
                    margin: 0 0 10px 0;
                }

                .footer-cta-title span {
                    background: linear-gradient(135deg, #FFFFFF 20%, #A78BFA 60%, #00F2FE 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .footer-cta-desc {
                    font-size: 15px;
                    color: #94A3B8;
                    line-height: 1.6;
                    margin: 0;
                }

                .footer-cta-actions {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    flex-shrink: 0;
                }

                .cta-primary-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 32px;
                    border-radius: 999px;
                    background: #0D121C;
                    color: #FFFFFF;
                    font-size: 15px;
                    font-weight: 700;
                    border: 1.5px solid rgba(0, 242, 254, 0.5);
                    box-shadow:
                        0 10px 24px rgba(0, 0, 0, 0.7),
                        0 0 20px rgba(0, 242, 254, 0.2),
                        inset 0 1px 1px rgba(255, 255, 255, 0.15);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    white-space: nowrap;
                }
                .cta-primary-btn:hover {
                    background: #131B2A;
                    border-color: #00F2FE;
                    box-shadow:
                        0 16px 36px rgba(0, 0, 0, 0.8),
                        0 0 32px rgba(0, 242, 254, 0.38),
                        inset 0 1px 2px rgba(255, 255, 255, 0.22);
                    transform: translateY(-2px);
                }

                /* ─────────── DIVIDER ─────────── */
                .footer-divider {
                    height: 1px;
                    background: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(129, 140, 248, 0.25) 20%,
                        rgba(0, 242, 254, 0.2) 50%,
                        rgba(129, 140, 248, 0.25) 80%,
                        transparent 100%
                    );
                    margin-bottom: 56px;
                }

                .footer-divider-top {
                    margin-top: 56px;
                }

                /* ─────────── LINK GRID ─────────── */
                .footer-columns {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    gap: 56px;
                    padding-bottom: 56px;
                }

                .footer-brand-desc {
                    font-size: 14.5px;
                    color: #94A3B8;
                    line-height: 1.65;
                    margin: 0;
                    max-width: 340px;
                }

                .footer-status-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    margin-top: 24px;
                    padding: 10px 16px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .footer-status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #34D399;
                    box-shadow: 0 0 8px rgba(52, 211, 153, 0.7);
                    animation: footer-pulse 2s ease-in-out infinite;
                }

                @keyframes footer-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.45; }
                }

                .footer-col-heading {
                    font-family: var(--font-jakarta, 'Plus Jakarta Sans', system-ui, sans-serif);
                    font-size: 12.5px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #64748B;
                    margin: 0 0 22px 0;
                }

                .footer-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .footer-link {
                    font-size: 14px;
                    color: #64748B !important;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: color 0.2s ease;
                }
                .footer-link:hover {
                    color: #CBD5E1 !important;
                }
                .footer-link-ext {
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }
                .footer-link:hover .footer-link-ext {
                    opacity: 0.6;
                }

                .footer-link-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #34D399 !important;
                    text-decoration: none;
                }
                .footer-link-badge:hover {
                    color: #6EE7B7 !important;
                }

                /* ─────────── BOTTOM BAR ─────────── */
                .footer-bottom {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 24px;
                    padding: 28px 0 36px;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                }

                .footer-copy {
                    font-size: 13px;
                    color: #475569;
                    margin: 0;
                }

                .footer-socials {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .footer-social-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748B;
                    background: transparent;
                    border: 1px solid transparent;
                    transition: all 0.2s ease;
                    text-decoration: none;
                }
                .footer-social-btn:hover {
                    color: #E2E8F0;
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.1);
                }

                /* ─────────── RESPONSIVE ─────────── */
                @media (max-width: 1024px) {
                    .footer-columns {
                        grid-template-columns: 1fr 1fr;
                        gap: 40px;
                    }
                    .footer-cta {
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 36px 32px;
                    }
                }
                @media (max-width: 640px) {
                    .footer-columns {
                        grid-template-columns: 1fr;
                        gap: 36px;
                    }
                    .footer-cta {
                        padding: 28px 22px;
                    }
                    .footer-cta-title {
                        font-size: 22px;
                    }
                    .footer-cta-actions {
                        flex-direction: column;
                        width: 100%;
                    }
                    .cta-primary-btn {
                        width: 100%;
                        justify-content: center;
                    }
                    .footer-bottom {
                        flex-direction: column;
                        text-align: center;
                    }
                }
            `}</style>

            <div className="footer-inner">
                {/* ── CTA Banner (Landing page only) ── */}
                {isLanding && (
                    <div className="footer-cta">
                        <div className="footer-cta-text">
                            <h3 className="footer-cta-title">
                                Ready to build your <span>AI venture blueprint</span>?
                            </h3>
                            <p className="footer-cta-desc">
                                Deploy 5 specialized agents to stress-test assumptions, audit financial risks, and generate an investor-ready consensus model.
                            </p>
                        </div>
                        <div className="footer-cta-actions">
                            <button
                                type="button"
                                className="cta-primary-btn"
                                onClick={() => router.push(isAuthenticated ? '/idea-prompt' : '/login')}
                            >
                                <Sparkles size={16} />
                                <span>Launch Studio</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Gradient divider ── */}
                <div className={`footer-divider ${!isLanding ? 'footer-divider-top' : ''}`} />

                {/* ── Link columns ── */}
                <div className="footer-columns">
                    {/* Brand column */}
                    <div>
                        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '18px' }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 12,
                                background: 'linear-gradient(135deg, #6366F1, #00F2FE)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#000', boxShadow: '0 0 18px rgba(99,102,241,0.3)'
                            }}>
                                <Layers size={20} strokeWidth={2.5} />
                            </div>
                            <span style={{
                                fontFamily: "var(--font-jakarta, 'Plus Jakarta Sans', system-ui, sans-serif)",
                                fontSize: 19, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em'
                            }}>
                                Agentic<span style={{ color: '#818CF8' }}>.ai</span>
                            </span>
                        </Link>
                        <p className="footer-brand-desc">
                            The autonomous multi-agent simulation studio for founders, architects, and venture strategists.
                        </p>
                        <div className="footer-status-chip">
                            <span className="footer-status-dot" />
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#94A3B8' }}>All systems operational</span>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h5 className="footer-col-heading">Product</h5>
                        <ul className="footer-links">
                            <li><Link href="/" className="footer-link" style={{ color: '#64748B' }}>WarRoom Studio</Link></li>
                            <li><Link href="/dashboard" className="footer-link" style={{ color: '#64748B' }}>Dashboard</Link></li>
                            <li><Link href="/" className="footer-link" style={{ color: '#64748B' }}>Consensus Engine</Link></li>
                            <li><Link href="/" className="footer-link" style={{ color: '#64748B' }}>Monte Carlo Sims</Link></li>
                            <li>
                                <Link href="/" className="footer-link" style={{ color: '#64748B' }}>
                                    API Reference
                                    <ExternalLink size={12} className="footer-link-ext" />
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Agents */}
                    <div>
                        <h5 className="footer-col-heading">Agents</h5>
                        <ul className="footer-links">
                            <li><Link href="/" className="footer-link" style={{ color: '#64748B' }}>Market Intelligence</Link></li>
                            <li><Link href="/" className="footer-link" style={{ color: '#64748B' }}>Technical Architect</Link></li>
                            <li><Link href="/" className="footer-link" style={{ color: '#64748B' }}>Brand Identity</Link></li>
                            <li><Link href="/" className="footer-link" style={{ color: '#64748B' }}>Financial Modeling</Link></li>
                            <li><Link href="/" className="footer-link" style={{ color: '#64748B' }}>Growth Strategy</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h5 className="footer-col-heading">Company</h5>
                        <ul className="footer-links">
                            <li><Link href="/" className="footer-link" style={{ color: '#64748B' }}>About</Link></li>
                            <li><Link href="/" className="footer-link" style={{ color: '#64748B' }}>Research</Link></li>
                            <li>
                                <Link href="/" className="footer-link-badge" style={{ color: '#34D399' }}>
                                    <ShieldCheck size={14} />
                                    SOC-2 Type II
                                </Link>
                            </li>
                            <li><Link href="/" className="footer-link" style={{ color: '#64748B' }}>Privacy</Link></li>
                            <li><Link href="/" className="footer-link" style={{ color: '#64748B' }}>Terms</Link></li>
                        </ul>
                    </div>
                </div>

                {/* ── Bottom bar ── */}
                <div className="footer-bottom">
                    <p className="footer-copy">© 2026 Agentic Workflow Inc. All rights reserved.</p>
                    <div className="footer-socials">
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-social-btn" aria-label="GitHub">
                            <GitHubIcon size={17} />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer-social-btn" aria-label="Twitter">
                            <TwitterIcon size={17} />
                        </a>
                        <a href="https://discord.com" target="_blank" rel="noreferrer" className="footer-social-btn" aria-label="Discord">
                            <DiscordIcon size={17} />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer-social-btn" aria-label="LinkedIn">
                            <LinkedInIcon size={17} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
