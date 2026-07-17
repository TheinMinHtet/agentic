'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflow } from '../context/WorkflowContext';

export default function SpecializedAgentsPage() {
    const router = useRouter();
    const {
        agentProgress,
        agentThinking,
        runParallelSpecializedPlanning,
        setActiveStep
    } = useWorkflow();

    const [error, setError] = useState(null);

    // Trigger parallel multi-agent runner on mount
    useEffect(() => {
        let isCurrent = true;

        async function execute() {
            try {
                const success = await runParallelSpecializedPlanning();
                if (success && isCurrent) {
                    setActiveStep('dashboard');
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 2000);
                } else if (isCurrent) {
                    setError("Specialized orchestration failed. Please verify your Google API Key and try again.");
                }
            } catch (err) {
                console.error(err);
                if (isCurrent) {
                    setError(err.message || "An unexpected error occurred during specialized planning.");
                }
            }
        }

        execute();

        return () => {
            isCurrent = false;
        };
    }, []);

    // Get color for progress statuses
    const getStatusStyles = (status) => {
        switch (status) {
            case 'completed':
                return { label: 'COMPLETED', bg: 'rgba(174, 236, 29, 0.15)', color: '#3d6b00' };
            case 'running':
                return { label: 'RUNNING', bg: 'rgba(56, 189, 248, 0.15)', color: '#0369a1' };
            case 'failed':
                return { label: 'FAILED', bg: 'rgba(239, 68, 68, 0.15)', color: '#b91c1c' };
            default:
                return { label: 'PENDING', bg: 'var(--color-surface-light)', color: 'var(--color-text-muted)' };
        }
    };

    const agentsList = [
        { key: 'finance', title: 'Finance Agent', desc: 'Sizing capital requirements, operational margins & revenue tiers.' },
        { key: 'brand', title: 'Brand Agent', desc: 'Crafting guidelines, taglines, suggested names & visual palette.' },
        { key: 'website', title: 'Website Agent', desc: 'Defining wireframe sections, product capabilities & tech stacks.' },
        { key: 'marketing', title: 'Marketing Agent', desc: 'Formulating acquisition strategies and 90-day launch roadmap.' }
    ];

    return (
        <section className="workflow-section section-padding container" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <h2 style={{ marginBottom: '16px', fontWeight: 900, fontSize: '32px', fontFamily: 'var(--typography-heading-family)', textAlign: 'center' }}>
                Step 4: Specialized AI Agents Pool
            </h2>
            <p className="text-secondary" style={{ marginBottom: '48px', fontSize: '18px', textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
                Watch our specialized business planning agents execute in parallel to compile your blueprint.
            </p>

            {/* Grid layout of 4 agents */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '32px',
                marginBottom: '48px'
            }}>
                {agentsList.map(({ key, title, desc }) => {
                    const status = getStatusStyles(agentProgress[key]);
                    return (
                        <div className="card" key={key} style={{
                            borderRadius: '32px',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '400px',
                            backgroundColor: 'var(--color-surface-medium)',
                            boxShadow: 'var(--elevation-card)',
                            border: agentProgress[key] === 'running' ? '2px solid var(--color-primary)' : '1px solid var(--color-border-light)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h4 style={{ margin: 0, fontWeight: 900 }}>{title}</h4>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    letterSpacing: '0.05em',
                                    padding: '4px 10px',
                                    borderRadius: '999px',
                                    backgroundColor: status.bg,
                                    color: status.color
                                }}>
                                    {status.label}
                                </span>
                            </div>
                            <p className="text-muted" style={{ fontSize: '13px', lineHeight: '1.4', marginBottom: '16px' }}>{desc}</p>
                            
                            {/* Inner Terminal Box for each agent's logs */}
                            <div style={{
                                flex: 1,
                                backgroundColor: '#110416',
                                color: '#a3f3a3',
                                fontFamily: 'Courier New, Courier, monospace',
                                padding: '12px',
                                borderRadius: '12px',
                                overflowY: 'auto',
                                fontSize: '11px',
                                lineHeight: '1.5',
                                textAlign: 'left',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                {agentThinking[key].length === 0 ? (
                                    <div style={{ color: 'var(--color-text-light-muted)', fontStyle: 'italic' }}>
                                        Waiting for start signal...
                                    </div>
                                ) : (
                                    agentThinking[key].map((log, i) => (
                                        <div key={i} style={{ marginBottom: '4px' }}>{log}</div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Business Plan compilation overlay card */}
            {agentProgress.business !== 'idle' && (
                <div className="card" style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    borderRadius: '24px',
                    padding: '24px',
                    backgroundColor: 'var(--color-surface-light)',
                    border: '1px dashed var(--color-primary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {agentProgress.business === 'running' && (
                            <div style={{
                                width: '20px', height: '20px', borderRadius: '50%',
                                border: '3px solid var(--color-border-light)',
                                borderTopColor: 'var(--color-primary)',
                                animation: 'spin 1s linear infinite'
                            }} />
                        )}
                        <h4 style={{ margin: 0, fontWeight: 900 }}>
                            {agentProgress.business === 'completed' 
                                ? '✓ Business Concept & Lean Canvas Integrated' 
                                : 'Business Agent: Integrating specialized reports...'}
                        </h4>
                    </div>
                    <div style={{
                        marginTop: '12px',
                        fontFamily: 'Courier New, Courier, monospace',
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                        textAlign: 'left'
                    }}>
                        {agentThinking.business.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '16px' }}>
                        {error}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                        <button className="button-primary" onClick={() => window.location.reload()} style={{ borderRadius: '12px' }}>
                            Retry Execution
                        </button>
                        <button className="button-secondary" onClick={() => router.push('/business-info')} style={{ borderRadius: '12px' }}>
                            Back to Details
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </section>
    );
}
