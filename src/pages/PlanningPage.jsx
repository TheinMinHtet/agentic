import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PlanningPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // mock a processing delay
        const timer = setTimeout(() => {
            navigate('/specialized-agents');
        }, 3000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <section className="workflow-section section-padding container" style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '16px' }}>Step 3: AI Agent Planning Layer</h2>
            <p className="text-secondary" style={{ marginBottom: '48px', fontSize: '18px' }}>
                Our orchestrator is planning sub-tasks and assigning them to specialized agents...
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    border: '4px solid var(--color-surface-medium)',
                    borderTopColor: 'var(--color-primary)',
                    animation: 'spin 1s linear infinite'
                }} />
                <p className="text-muted">Analyzing requirements & delegating tasks...</p>
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </section>
    );
}
