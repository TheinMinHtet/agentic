'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflow } from '../context/WorkflowContext';

export default function PlanningPage() {
    const router = useRouter();
    const {
        agentProgress,
        agentThinking,
        runSequentialPlanning,
        setActiveStep
    } = useWorkflow();

    const [error, setError] = useState(null);
    const terminalEndRef = useRef(null);

    // Run sequential planning pipeline on mount
    useEffect(() => {
        let isCurrent = true;

        async function execute() {
            try {
                const success = await runSequentialPlanning();
                if (success && isCurrent) {
                    setActiveStep('specialized-agents');
                    setTimeout(() => {
                        router.push('/specialized-agents');
                    }, 1500);
                } else if (isCurrent) {
                    setError("Planning failed. Please verify your Google API Key and try again.");
                }
            } catch (err) {
                console.error(err);
                if (isCurrent) {
                    setError(err.message || "An unexpected error occurred during agent orchestration.");
                }
            }
        }

        execute();

        return () => {
            isCurrent = false;
        };
    }, []);

    // Autoscroll logs to bottom
    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [agentThinking.refinement, agentThinking.market]);

    const activeAgentName = agentProgress.market === 'running' 
        ? 'Market Research Agent' 
        : 'Refinement Agent';

    return (
        <section className="workflow-section section-padding container" style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ marginBottom: '16px', fontWeight: 900, fontSize: '32px', fontFamily: 'var(--typography-heading-family)', textAlign: 'center' }}>
                Step 3: AI Agent Planning Layer
            </h2>
            <p className="text-secondary" style={{ marginBottom: '40px', fontSize: '18px', textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px auto' }}>
                Our orchestrator is refining your concept and drafting initial market intelligence...
            </p>

            <div className="card" style={{
                width: '100%',
                maxWidth: '800px',
                margin: '0 auto',
                borderRadius: '32px',
                padding: '40px',
                backgroundColor: 'var(--color-surface-medium)',
                boxShadow: 'var(--elevation-card)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    {agentProgress.market !== 'completed' && !error ? (
                        <div style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            border: '3px solid var(--color-border-light)',
                            borderTopColor: 'var(--color-primary)',
                            animation: 'spin 1s linear infinite'
                        }} />
                    ) : (
                        <div style={{
                            width: '12px', height: '12px', borderRadius: '50%',
                            backgroundColor: error ? '#ef4444' : 'var(--color-accent)'
                        }} />
                    )}
                    <h4 style={{ margin: 0, fontWeight: 900 }}>
                        {error ? 'Execution Interrupted' : `Active Agent: ${activeAgentName}`}
                    </h4>
                </div>

                {/* Console Log Terminal */}
                <div style={{
                    backgroundColor: '#110416',
                    color: '#a3f3a3',
                    fontFamily: 'Courier New, Courier, monospace',
                    padding: '24px',
                    borderRadius: '16px',
                    height: '280px',
                    overflowY: 'auto',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    textAlign: 'left',
                    boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {agentThinking.refinement.map((log, i) => (
                        <div key={`ref-${i}`} style={{ color: '#eef2ff' }}>{log}</div>
                    ))}
                    {agentThinking.market.map((log, i) => (
                        <div key={`mkt-${i}`} style={{ color: '#aeec1d' }}>{log}</div>
                    ))}
                    
                    {agentProgress.market === 'completed' && (
                        <div style={{ color: 'var(--color-accent)', fontWeight: 'bold', marginTop: '8px' }}>
                            [SUCCESS] Planning steps completed. Advancing to Specialized Agents Pool...
                        </div>
                    )}

                    {error && (
                        <div style={{ color: '#ef4444', fontWeight: 'bold', marginTop: '8px' }}>
                            [ERROR] {error}
                        </div>
                    )}
                    <div ref={terminalEndRef} />
                </div>

                {error && (
                    <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
                        <button className="button-primary" onClick={() => window.location.reload()} style={{ borderRadius: '12px' }}>
                            Retry Execution
                        </button>
                        <button className="button-secondary" onClick={() => router.push('/business-info')} style={{ borderRadius: '12px' }}>
                            Back to Details
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </section>
    );
}
