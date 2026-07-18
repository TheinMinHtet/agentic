'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflow } from '../context/WorkflowContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Bot, Send, ArrowRight, User, Globe, MapPin, Layers } from 'lucide-react';

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
    const { executeOnboardingChat, onboardingChatHistory, onboardingProgress, setActiveStep } = useWorkflow();
    const { user, loading } = useAuth();
    const { language, t } = useLanguage();

    const [phase, setPhase] = useState(1);
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [onboardingChatHistory, isTyping, phase]);

    useEffect(() => {
        if (!loading && !user?.id) {
            router.push('/login');
        }
    }, [user, loading, router]);

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

    const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    if (loading) return null;

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            style={{ position: 'relative', minHeight: 'calc(100vh - 56px)', overflow: 'hidden', width: '100%' }}
        >
            {/* Mouse Tracking Neon Spotlight */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 1,
                    transition: 'background 0.12s ease-out',
                    background: `radial-gradient(680px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 242, 254, 0.15), rgba(99, 102, 241, 0.08) 35%, transparent 75%)`
                }}
            />

            <section 
                className="workflow-section section-padding container" 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 56px)' }}
            >
                <div className="onboarding-container" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '800px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                
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
                                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Online Business</h3>
                                <p className="text-muted" style={{ fontSize: '14px', textAlign: 'center' }}>100% Digital operations, remote services, e-commerce.</p>
                            </div>
                            
                            <div className="location-card" onClick={() => handleLocationSelect('Offline')} style={{ cursor: 'pointer', padding: '32px 24px', background: 'var(--color-surface-card)', borderRadius: '16px', border: '1px solid var(--color-border-light)', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <MapPin size={48} color="#A78BFA" style={{ marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Physical Business</h3>
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
                    <div style={{ marginTop: '40px', width: '100%' }}>
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: '16px', minHeight: '40px' }}>
                            <div style={{ position: 'absolute', left: 0 }}>
                                <button 
                                    className="back-button"
                                    onClick={() => setPhase(1)}
                                >
                                    &larr; {language === 'en' ? 'Back' : 'နောက်သို့'}
                                </button>
                            </div>
                            <h2 style={{ margin: 0, fontWeight: 900, fontSize: '32px', fontFamily: 'var(--typography-heading-family)', textAlign: 'center', padding: '0 80px' }}>
                                {language === 'en' ? 'Select your industry' : 'သင်၏လုပ်ငန်းအမျိုးအစားကို ရွေးချယ်ပါ'}
                            </h2>
                        </div>
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
                    </div>
                )}

                {/* Phase 3: Chat Wizard */}
                {phase === 3 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-surface-card)', borderRadius: '24px', border: '1px solid var(--color-border-light)', overflow: 'hidden', marginTop: '24px', height: '600px', maxHeight: '600px', flexShrink: 0 }}>
                        
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
                                    <span style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 700 }}>{Math.round(((onboardingProgress || 0) / 5) * 100)}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        width: `${Math.min(100, ((onboardingProgress || 0) / 5) * 100)}%`, 
                                        height: '100%', 
                                        background: 'linear-gradient(90deg, #A78BFA, var(--color-accent))',
                                        transition: 'width 0.5s ease-out',
                                        borderRadius: '99px'
                                    }} />
                                </div>
                            </div>
                        </div>

                        {/* Chat History */}
                        <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
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
                                            fontSize: '15px',
                                            whiteSpace: 'pre-wrap'
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

            </section>
            
            <style jsx>{`
                .back-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 18px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 999px;
                    color: var(--color-text-secondary);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                    backdrop-filter: blur(8px);
                }
                .back-button:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: var(--color-text-primary);
                    border-color: rgba(255, 255, 255, 0.25);
                    transform: translateX(-4px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
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
        </div>
    );
}
