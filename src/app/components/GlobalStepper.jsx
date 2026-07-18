'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const STEPS = [
    { id: 'onboarding', path: '/onboarding', label: '1. Onboarding' },
    { id: 'specialized', path: '/specialized-agents', label: '2. AI Orchestration' },
    { id: 'dashboard', path: '/dashboard', label: '3. Dashboard' }
];

export default function GlobalStepper() {
    const pathname = usePathname();
    const { t } = useLanguage();

    if (pathname === '/' || pathname === '/login' || pathname === '/register') {
        return null;
    }

    const currentIndex = STEPS.findIndex(step => pathname.includes(step.path));
    if (currentIndex === -1) return null;

    return (
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '0' }}>
            <div className="card-glass" style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {STEPS.map((step, index) => {
                    const isActive = index === currentIndex;
                    const isCompleted = index < currentIndex;

                    return (
                        <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: index < STEPS.length - 1 ? 1 : 0 }}>
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2
                            }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: isActive ? 'var(--gradient-ai)' : isCompleted ? 'var(--color-success)' : 'rgba(255, 255, 255, 0.05)',
                                    border: `2px solid ${isActive || isCompleted ? 'transparent' : 'rgba(255, 255, 255, 0.1)'}`,
                                    color: isActive || isCompleted ? '#F8FAFC' : 'var(--color-text-secondary)',
                                    fontWeight: '800', fontSize: '15px',
                                    boxShadow: isActive ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {isCompleted ? <Check size={18} strokeWidth={3} /> : (index + 1)}
                                </div>
                                <span style={{
                                    fontSize: '13px', fontWeight: isActive ? 800 : 600,
                                    color: isActive ? '#00F2FE' : isCompleted ? '#F8FAFC' : 'var(--color-text-muted)',
                                    textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap'
                                }}>
                                    {step.label}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div style={{
                                    flex: 1, height: '3px', margin: '0 24px', marginTop: '-30px',
                                    background: isCompleted ? 'var(--color-success)' : 'rgba(255, 255, 255, 0.08)',
                                    borderRadius: '2px'
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
