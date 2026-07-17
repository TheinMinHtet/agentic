'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RefinementPage() {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        { role: 'agent', text: 'Here is your initial blueprint! Would you like to adjust the tech stack or target audience?' }
    ]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setChat(prev => [...prev, { role: 'user', text: message }]);
        setMessage('');

        setTimeout(() => {
            setChat(prev => [...prev, { role: 'agent', text: 'Got it, re-calculating Technical Architecture and Financial constraints...' }]);
        }, 1000);
    };

    return (
        <section className="refinement-section container">
            <div className="refinement-grid">
                {/* Left Side: Mock Blueprint View */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                    <h4>Active Blueprint Document</h4>
                    <p className="text-muted" style={{ fontSize: '14px' }}>Drafting changes dynamically based on refinement conversation...</p>
                    <div style={{ marginTop: '16px', border: '1px dashed var(--color-primary)', padding: '16px', borderRadius: '8px' }}>
                        <h5>Current Tech Stack</h5>
                        <p className="text-secondary" style={{ fontSize: '14px' }}>Web App with React, Node.js backend</p>
                    </div>
                    <button className="button-secondary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }} onClick={() => router.push('/dashboard')}>
                        Back to Dashboard
                    </button>
                </div>

                {/* Right Side: Chat Interface */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-light)' }}>
                    <h3 style={{ marginBottom: '8px' }}>Refinement Agent</h3>
                    <div style={{ flex: 1, backgroundColor: 'var(--color-background)', borderRadius: '8px', padding: '16px', marginBottom: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {chat.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-surface-medium)',
                                color: msg.role === 'user' ? 'white' : 'inherit',
                                padding: '12px', borderRadius: '12px', fontSize: '14px', maxWidth: '85%', lineHeight: 1.4
                            }}>
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
                        <input type="text" className="input-text" style={{ flex: 1 }} placeholder="Type instructions..." value={message} onChange={e => setMessage(e.target.value)} />
                        <button type="submit" className="button-primary" style={{ padding: '12px 16px' }}>Send</button>
                    </form>
                </div>
            </div>
        </section>
    );
}
