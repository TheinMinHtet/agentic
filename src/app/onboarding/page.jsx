'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflow } from '../context/WorkflowContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Bot, Send, ArrowRight, User, Globe, MapPin, Layers, History, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const ONLINE_CATEGORIES = [
    "Software & Tech (SaaS, Apps, AI)", "E-commerce & Dropshipping", "Digital Content & Media",
    "Online Marketplaces", "FinTech & Web3", "Online Education", "Virtual Services"
];
const OFFLINE_CATEGORIES = [
    "Food & Beverage", "Physical Retail", "Health, Beauty & Wellness",
    "Home & Local Trades", "Logistics & Transportation", "Real Estate", "In-Person Services"
];
const BOTH_CATEGORIES = [
    "Omnichannel Retail", "Food Delivery & Cloud Kitchens", "Modern Professional Services",
    "Hybrid Education", "Tech-Enabled Real Estate", "Tech-Enabled Logistics"
];

export default function OnboardingPage() {
    const router = useRouter();
    const { executeOnboardingChat, onboardingChatHistory, onboardingProgress, setActiveStep, updateStartupIdea, updateBusinessInfo } = useWorkflow();
    const { user, loading } = useAuth();
    const { language, t } = useLanguage();

    const [phase, setPhase] = useState(1);
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');

    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Idea history
    const [pastIdeas, setPastIdeas] = useState([]);
    const [historyExpanded, setHistoryExpanded] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [onboardingChatHistory, isTyping, phase]);

    useEffect(() => {
        if (!loading && !user?.id) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Fetch idea history from agent_refinements table
    useEffect(() => {
        if (!user?.id) return;
        const supabase = createClient();
        supabase
            .from('agent_refinements')
            .select('idea_id, concept, improved_summary, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
                if (error) { console.error('History fetch error:', error); return; }
                if (data) {
                    // Deduplicate by idea_id (keep latest per idea)
                    const seen = new Set();
                    const unique = data.filter(row => {
                        if (seen.has(row.idea_id)) return false;
                        seen.add(row.idea_id);
                        return true;
                    });
                    setPastIdeas(unique);
                }
            });
    }, [user?.id]);

    const handleLocationSelect = (loc) => {
        setLocation(loc);
        setPhase(2);
    };

    const handleCategorySelect = async (cat) => {
        setCategory(cat);
        setPhase(3);
        setIsTyping(true);
        try {
            await executeOnboardingChat(
                "Hello! I am ready to start discussing my business idea.",
                location,
                cat
            );
        } catch (e) {
            console.error(e);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || isTyping) return;

        const message = chatInput;
        setChatInput('');
        setIsTyping(true);

        try {
            const response = await executeOnboardingChat(message, location, category);
            if (response.is_complete) {
                setIsComplete(true);
                setActiveStep('planning');
                setTimeout(() => {
                    router.push('/planning');
                }, 2500);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsTyping(false);
        }
    };

    const getCategories = () => {
        if (location === 'Online') return ONLINE_CATEGORIES;
        if (location === 'Offline') return OFFLINE_CATEGORIES;
        return BOTH_CATEGORIES;
    };

    if (loading) return null;

    return (
        <section className="workflow-section section-padding container" style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="onboarding-container" style={{ width: '100%', maxWidth: '800px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                {/* ── Idea History Panel ── */}
                {pastIdeas.length > 0 && (
                    <div style={{ marginTop: '28px', marginBottom: '8px', borderRadius: '16px', border: '1px solid var(--color-border-light)', background: 'var(--color-surface-card)', overflow: 'hidden' }}>
                        <button
                            onClick={() => setHistoryExpanded(v => !v)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <History size={18} color="var(--color-accent)" />
                                <span style={{ fontWeight: 700, fontSize: '15px' }}>
                                    {language === 'en' ? `Your Past Ideas (${pastIdeas.length})` : `သင်၏ ယမန်ကစိတ်ကူးများ (${pastIdeas.length})`}
                                </span>
                            </div>
                            {historyExpanded ? <ChevronUp size={18} color="var(--color-text-muted)" /> : <ChevronDown size={18} color="var(--color-text-muted)" />}
                        </button>

                        {historyExpanded && (
                            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {pastIdeas.map((idea) => (
                                    <div
                                        key={idea.idea_id}
                                        style={{ padding: '16px 18px', borderRadius: '12px', border: '1px solid var(--color-border-light)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                                            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(0,242,254,0.08)', border: '1px solid rgba(0,242,254,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Lightbulb size={16} color="var(--color-accent)" />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {idea.improved_summary || 'Untitled Idea'}
                                                </p>
                                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                    {new Date(idea.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                                {idea.concept && (
                                                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {idea.concept}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => router.push(`/dashboard?ideaId=${idea.idea_id}`)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: 'rgba(0,242,254,0.08)', border: '1px solid rgba(0,242,254,0.25)', color: 'var(--color-accent)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                                        >
                                            Dashboard <ArrowRight size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Phase 1: Location */}
                {phase === 1 && (
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <h2 style={{ marginBottom: '16px', fontWeight: 900, fontSize: '32px', fontFamily: 'var(--typography-heading-family)' }}>
                            {language === 'en' ? 'Where will your business operate?' : 'သင်၏လုပ်ငန်း မည်သည့်နေရာတွင် လည်ပတ်မည်နည်း?'}
                        </h2>
                        <p className="text-secondary" style={{ marginBottom: '48px', fontSize: '18px' }}>
                            {language === 'en' ? "Let's start by identifying your primary operational environment." : "သင့်လုပ်ငန်း၏ အဓိက လည်ပတ်မည့် ပုံစံကို ရွေးချယ်ပါ။"}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                            <div className="location-card" onClick={() => handleLocationSelect('Online')} style={{ cursor: 'pointer', padding: '32px 24px', background: 'var(--color-surface-card)', borderRadius: '16px', border: '1px solid var(--color-border-light)', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Globe size={48} color="var(--color-accent)" style={{ marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Online</h3>
                                <p className="text-muted" style={{ fontSize: '14px', textAlign: 'center' }}>100% Digital operations, remote services, e-commerce.</p>
                            </div>

                            <div className="location-card" onClick={() => handleLocationSelect('Offline')} style={{ cursor: 'pointer', padding: '32px 24px', background: 'var(--color-surface-card)', borderRadius: '16px', border: '1px solid var(--color-border-light)', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <MapPin size={48} color="#A78BFA" style={{ marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Offline</h3>
                                <p className="text-muted" style={{ fontSize: '14px', textAlign: 'center' }}>Brick and mortar, physical stores, local services.</p>
                            </div>

                            <div className="location-card" onClick={() => handleLocationSelect('Both')} style={{ cursor: 'pointer', padding: '32px 24px', background: 'var(--color-surface-card)', borderRadius: '16px', border: '1px solid var(--color-border-light)', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Layers size={48} color="#F472B6" style={{ marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Both (Hybrid)</h3>
                                <p className="text-muted" style={{ fontSize: '14px', textAlign: 'center' }}>Omnichannel retail, physical services with digital tech.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Phase 2: Category */}
                {phase === 2 && (
                    <div style={{ marginTop: '40px' }}>
                        <h2 style={{ marginBottom: '16px', fontWeight: 900, fontSize: '32px', fontFamily: 'var(--typography-heading-family)', textAlign: 'center' }}>
                            {language === 'en' ? 'Select your industry' : 'သင်၏လုပ်ငန်းအမျိုးအစားကို ရွေးချယ်ပါ'}
                        </h2>
                        <p className="text-secondary" style={{ marginBottom: '48px', fontSize: '18px', textAlign: 'center' }}>
                            {language === 'en' ? `Based on your choice (${location}), here are the best fits:` : 'သင့်ရွေးချယ်မှုအပေါ် အခြေခံ၍ အကောင်းဆုံး အမျိုးအစားများ-'}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                            {getCategories().map(cat => (
                                <div
                                    key={cat}
                                    onClick={() => handleCategorySelect(cat)}
                                    style={{
                                        cursor: 'pointer', padding: '20px', background: 'var(--color-surface-card)',
                                        borderRadius: '12px', border: '1px solid var(--color-border-light)',
                                        transition: 'all 0.2s', textAlign: 'center', fontWeight: 600
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-light)'; e.currentTarget.style.transform = 'none'; }}
                                >
                                    {cat}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setPhase(1)} style={{ marginTop: '32px', background: 'transparent', color: 'var(--color-text-muted)', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                            &larr; Back to Location
                        </button>
                    </div>
                )}

                {/* Phase 3: Chat Wizard */}
                {phase === 3 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-surface-card)', borderRadius: '24px', border: '1px solid var(--color-border-light)', overflow: 'hidden', marginTop: '24px', height: '600px' }}>

                        {/* Header */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border-light)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), #A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bot size={20} color="#000" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Startup Incubator Agent</h3>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                        {location} &bull; {category}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Blueprint Progress</span>
                                    <span style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 700 }}>{Math.round(((onboardingProgress || 0) / 7) * 100)}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${Math.min(100, ((onboardingProgress || 0) / 7) * 100)}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #A78BFA, var(--color-accent))',
                                        transition: 'width 0.5s ease-out',
                                        borderRadius: '99px'
                                    }} />
                                </div>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {onboardingChatHistory.map((msg, i) => {
                                // Skip the initial invisible trigger message if needed, but here we just render all
                                if (i === 0 && msg.role === 'user' && msg.content.includes("ready to start")) return null;

                                const isModel = msg.role === 'model';
                                return (
                                    <div key={i} style={{ display: 'flex', justifyContent: isModel ? 'flex-start' : 'flex-end', alignItems: 'flex-end', gap: '8px' }}>
                                        {isModel && (
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Bot size={14} color="var(--color-accent)" />
                                            </div>
                                        )}
                                        <div style={{
                                            maxWidth: '75%',
                                            padding: '14px 18px',
                                            borderRadius: '16px',
                                            background: isModel ? 'rgba(255,255,255,0.05)' : 'var(--color-accent)',
                                            color: isModel ? 'var(--color-text-primary)' : '#000',
                                            borderBottomLeftRadius: isModel ? '4px' : '16px',
                                            borderBottomRightRadius: !isModel ? '4px' : '16px',
                                            lineHeight: '1.5',
                                            fontSize: '15px'
                                        }}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}

                            {isTyping && (
                                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Bot size={14} color="var(--color-accent)" />
                                    </div>
                                    <div style={{ padding: '14px 18px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', gap: '4px' }}>
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            )}

                            {isComplete && (
                                <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '12px', border: '1px solid var(--color-accent)', marginTop: '10px' }}>
                                    <p style={{ color: 'var(--color-accent)', fontWeight: 700, margin: 0 }}>
                                        Excellent! I have all the details I need.
                                    </p>
                                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                                        Redirecting to the WarRoom to build your blueprint...
                                    </p>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border-light)', background: 'rgba(0,0,0,0.2)' }}>
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    placeholder="Type your answer here..."
                                    disabled={isTyping || isComplete}
                                    style={{
                                        flex: 1,
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--color-border-light)',
                                        borderRadius: '12px',
                                        padding: '14px 20px',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '15px'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--color-border-light)'}
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim() || isTyping || isComplete}
                                    style={{
                                        background: chatInput.trim() ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                                        color: chatInput.trim() ? '#000' : 'rgba(255,255,255,0.3)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        width: '52px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .typing-dot {
                    width: 6px;
                    height: 6px;
                    background: var(--color-text-muted);
                    border-radius: 50%;
                    animation: typing 1.4s infinite ease-in-out both;
                }
                @keyframes typing {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
                .location-card:hover {
                    border-color: var(--color-accent) !important;
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px rgba(0, 242, 254, 0.1);
                }
            `}</style>
        </section>
    );
}
