'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SpecializedAgentsPage() {
    const router = useRouter();
    const [activeAgents, setActiveAgents] = useState(0);

    useEffect(() => {
        // mock agent activity
        const interval = setInterval(() => {
            setActiveAgents((prev) => {
                if (prev >= 3) {
                    clearInterval(interval);
                    setTimeout(() => router.push('/dashboard'), 1500);
                    return prev;
                }
                return prev + 1;
            });
        }, 1200);
        return () => clearInterval(interval);
    }, [router]);

    return (
        <section className="workflow-section section-padding container" style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '16px' }}>Step 4: Specialized AI Agents</h2>
            <p className="text-secondary" style={{ marginBottom: '48px', fontSize: '18px' }}>
                Watch as multiple specialized agents collaborate in parallel to build your blueprint.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '32px' }}>
                <div className="card" style={{ opacity: activeAgents >= 1 ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                    <h4>Market Agent</h4>
                    <p className="text-muted" style={{ fontSize: '14px', marginTop: '8px' }}>
                        {activeAgents >= 1 ? 'Analyzed TAM: $4.2B' : 'Waiting...'}
                    </p>
                </div>
                <div className="card" style={{ opacity: activeAgents >= 2 ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                    <h4>Financial Agent</h4>
                    <p className="text-muted" style={{ fontSize: '14px', marginTop: '8px' }}>
                        {activeAgents >= 2 ? 'Calculated Breakeven: Month 14' : 'Waiting...'}
                    </p>
                </div>
                <div className="card" style={{ opacity: activeAgents >= 3 ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                    <h4>Tech Agent</h4>
                    <p className="text-muted" style={{ fontSize: '14px', marginTop: '8px' }}>
                        {activeAgents >= 3 ? 'Selected Stack: React Native, Node.js' : 'Waiting...'}
                    </p>
                </div>
            </div>
        </section>
    );
}
