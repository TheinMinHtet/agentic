'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlanningPage() {
    const router = useRouter();

    useEffect(() => {
        // mock a processing delay
        const timer = setTimeout(() => {
            router.push('/specialized-agents');
        }, 3000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <section className="workflow-section section-padding container" style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '16px' }}>Step 3: AI Agent Planning Layer</h2>
            <p className="text-secondary" style={{ marginBottom: '48px', fontSize: '18px' }}>
                Our orchestrator is planning sub-tasks and assigning them to specialized agents...
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    border: '4px solid #e2e8f0',
                    borderTopColor: 'var(--color-accent)',
                    boxShadow: '0 12px 26px rgba(99, 102, 241, 0.16)',
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
