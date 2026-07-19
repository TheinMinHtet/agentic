'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflow } from '../../context/WorkflowContext';
import { ArrowLeft, Sparkles, Send } from 'lucide-react';

export default function RefinementPage() {
    const router = useRouter();
    const {
        businessInfo,
        financeModel,
        brandPackage,
        digitalPresence,
        marketResearch,
        executeRefinementChat
    } = useWorkflow();

    const getCurrencySymbol = () => {
        return 'MMK';
    };

    const formatCost = (cost) => {
        return `${Math.round(cost).toLocaleString()} MMK`;
    };

    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chat, setChat] = useState([
        { role: 'agent', text: 'Here is your initial blueprint! Would you like to adjust the tech stack, lower the budget, or target a new audience?' }
    ]);

    const chatEndRef = useRef(null);

    // Scroll chat to bottom
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chat, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isTyping) return;

        const userMsg = message.trim();
        setChat(prev => [...prev, { role: 'user', text: userMsg }]);
        setMessage('');
        setIsTyping(true);

        try {
            // Call the real refinement chat agent
            const reply = await executeRefinementChat(userMsg);
            setChat(prev => [...prev, { role: 'agent', text: reply }]);
        } catch (err) {
            console.error(err);
            setChat(prev => [...prev, { role: 'agent', text: `Sorry, I encountered an error recalculating parameters: ${err.message}` }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Load active blueprint configurations for left side panel view
    const names = brandPackage?.names || ["GrantFlow AI", "ProposalLift", "FundForge"];
    const colors = brandPackage?.palette || { primary: '#1b0624', secondary: '#aeec1d' };
    const stack = digitalPresence?.stack || ["React Next.js", "Gemini API"];
    const tam = marketResearch?.tam || "5,400,000,000 MMK TAM";
    const setupCosts = financeModel?.costBreakdown || [
        { item: "Gemini API token costs", cost: 360000 },
        { item: "Hosting & Server infrastructure", cost: 240000 }
    ];

    return (
        <section className="refinement-section container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
            <div className="refinement-grid" style={{ height: 'calc(100vh - 104px)' }}>
                
                {/* Left Side: Live Blueprint Preview */}
                <div className="card refinement-preview-card" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '20px', 
                    overflowY: 'auto',
                    borderRadius: '32px',
                    padding: '32px',
                    backgroundColor: 'var(--color-surface-medium)',
                    boxShadow: 'var(--elevation-card)'
                }}>
                    <div style={{ borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--typography-heading-family)' }}>
                            Active Blueprint Config
                        </h4>
                        <p className="text-muted" style={{ fontSize: '12px', margin: '4px 0 0 0' }}>
                            Values shift dynamically based on your chat instructions.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
                        {/* Target Segment */}
                        <div style={{ backgroundColor: 'var(--color-background)', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border-light)' }}>
                            <strong style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Target TAM</strong>
                            <span style={{ fontWeight: 900, fontSize: '16px' }}>{tam}</span>
                        </div>

                        {/* Brand Names suggestions */}
                        <div style={{ backgroundColor: 'var(--color-background)', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border-light)' }}>
                            <strong style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Candidate Brand Names</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {names.slice(0, 3).map((name, i) => (
                                    <span key={i} style={{ backgroundColor: 'var(--color-surface-light)', border: '1px solid var(--color-border-light)', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                                        {name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div style={{ backgroundColor: 'var(--color-background)', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border-light)' }}>
                            <strong style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Recommended Stack</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {stack.slice(0, 3).map((tech, i) => (
                                    <span key={i} style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}>
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Setup budget costs */}
                        <div style={{ backgroundColor: 'var(--color-background)', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border-light)' }}>
                            <strong style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Startup Cost Breakdown</strong>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {setupCosts.slice(0, 3).map((cost, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>{cost.item}</span>
                                        <strong>{formatCost(cost.cost)}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button className="button-secondary" style={{ marginTop: 'auto', alignSelf: 'flex-start', borderRadius: '12px' }} onClick={() => router.push('/dashboard')}>
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>
                </div>

                {/* Right Side: Chat Interface */}
                <div className="card refinement-chat-card" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    backgroundColor: 'var(--color-surface-light)',
                    borderRadius: '32px',
                    padding: '32px',
                    boxShadow: 'var(--elevation-card)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px' }}>
                        <span style={{ color: 'var(--color-primary)' }}><Sparkles size={20} /></span>
                        <h3 style={{ fontSize: '20px', fontWeight: 900 }}>Refinement Agent</h3>
                    </div>

                    {/* Chat Messages Log */}
                    <div style={{ 
                        flex: 1, 
                        backgroundColor: 'var(--color-background)', 
                        borderRadius: '16px', 
                        padding: '20px', 
                        marginBottom: '20px', 
                        overflowY: 'auto', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '16px',
                        border: '1px solid var(--color-border-light)'
                    }}>
                        {chat.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-surface-medium)',
                                color: msg.role === 'user' ? 'white' : 'var(--color-text-secondary)',
                                padding: '14px 20px', 
                                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', 
                                fontSize: '14px', 
                                maxWidth: '80%', 
                                lineHeight: 1.5,
                                textAlign: 'left',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{
                                alignSelf: 'flex-start',
                                backgroundColor: 'var(--color-surface-medium)',
                                color: 'var(--color-text-light-muted)',
                                padding: '14px 20px',
                                borderRadius: '20px 20px 20px 4px',
                                fontSize: '14px',
                                maxWidth: '80%',
                                fontStyle: 'italic'
                            }}>
                                Agent is recalculating parameters...
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat input form */}
                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
                        <input 
                            type="text" 
                            className="input-text" 
                            style={{ flex: 1, borderRadius: '12px' }} 
                            placeholder="e.g., Make it cheaper or target college students..." 
                            value={message} 
                            onChange={e => setMessage(e.target.value)} 
                            disabled={isTyping}
                        />
                        <button 
                            type="submit" 
                            className="button-primary" 
                            style={{ padding: '12px 20px', borderRadius: '12px', minWidth: '100px' }}
                            disabled={!message.trim() || isTyping}
                        >
                            {isTyping ? '...' : <Send size={18} />}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
