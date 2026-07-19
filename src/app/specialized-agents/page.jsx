'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflow } from '../context/WorkflowContext';
import { useLanguage } from '../context/LanguageContext';
import { debateGraph } from '../../agents/debateOrchestrator';

export default function SpecializedAgentsPage() {
    const router = useRouter();
    const {
        businessInfo,
        refinedConcept,
        updateVerifiedBlueprint,
        setActiveStep,
        getApiKey
    } = useWorkflow();
    const { language } = useLanguage();

    const [error, setError] = useState(null);
    const [activeSpeaker, setActiveSpeaker] = useState('market'); // 'market', 'finance', 'both', 'idle'
    const [consensusScore, setConsensusScore] = useState(38);
    const [consensusReached, setConsensusReached] = useState(false);
    const [showOptionBox, setShowOptionBox] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'system',
            content: 'Initializing WarRoom ReAct Loop: Market Intelligence & Financial Modeler agents online.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [verifiedPayload, setVerifiedPayload] = useState(null);
    const [tradeoffOptions, setTradeoffOptions] = useState(null);
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef(null);
    const streamContainerRef = useRef(null);

    const threadConfig = useMemo(() => ({
        configurable: { thread_id: "warroom_debate_session_" + Date.now() }
    }), []);

    const scrollToBottom = () => {
        if (streamContainerRef.current) {
            streamContainerRef.current.scrollTo({
                top: streamContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Run the initial ReAct debate loop on mount
    useEffect(() => {
        let isCurrent = true;

        async function startDebate() {
            setIsThinking(true);
            try {
                // Initial input to graph
                const conceptData = {
                    companyName: refinedConcept?.companyName || businessInfo?.company_name || businessInfo?.title || "GrantFlow AI",
                    targetCountry: refinedConcept?.target_country || businessInfo?.target_country || "Myanmar",
                    location: businessInfo?.location || "Yangon, Myanmar",
                    initialCapital: 3000000,
                    monthlyBurnRate: 1500000,
                    description: refinedConcept?.improved_summary || businessInfo?.core_painpoint,
                    apiKey: getApiKey?.()
                };

                // Step 1: Market Agent runs
                setActiveSpeaker('market');
                await new Promise(r => setTimeout(r, 1200));
                
                const res1 = await debateGraph.invoke({
                    business_concept: conceptData,
                    messages: [],
                    consensus_score: 38,
                    iteration_count: 0
                }, threadConfig);

                if (!isCurrent) return;
                setMessages(prev => [...prev, ...(res1.messages || [])]);
                setConsensusScore(res1.consensus_score || 48);

                // Step 2: Finance Agent runs & hits tradeoff breakpoint
                setActiveSpeaker('finance');
                await new Promise(r => setTimeout(r, 1800));

                const res2 = await debateGraph.invoke(null, threadConfig);
                if (!isCurrent) return;

                setMessages(prev => [...prev, ...(res2.messages || [])]);
                setConsensusScore(res2.consensus_score || 56);
                if (res2.tradeoff_options && res2.tradeoff_options.length > 0) {
                    setTradeoffOptions(res2.tradeoff_options);
                }
                
                // Check if needs human decision
                if (res2.needs_human_decision) {
                    setActiveSpeaker('idle');
                    setShowOptionBox(true);
                    setIsThinking(false);
                } else if (res2.consensus_reached) {
                    setConsensusReached(true);
                    setActiveSpeaker('both');
                    setVerifiedPayload(res2.verified_payload);
                    setIsThinking(false);
                }
            } catch (err) {
                console.error("Debate graph error:", err);
                if (isCurrent) {
                    setError(err.message || "An error occurred in the WarRoom ReAct Loop.");
                    setIsThinking(false);
                }
            }
        }

        startDebate();

        return () => {
            isCurrent = false;
        };
    }, []);

    // Handle Option Selection (HITL resume)
    const handleSelectOption = async (optionId) => {
        setShowOptionBox(false);
        setIsThinking(true);
        setActiveSpeaker('market');

        try {
            // Append user decision notice
            setMessages(prev => [...prev, {
                role: 'system',
                content: `Founder selected strategy: ${optionId === 'option_a' ? 'Option A (Aggressive Expansion - $15 CAC)' : 'Option B (Conservative Growth - $12 CAC Viral Loop)'}. Resuming ReAct convergence...`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            await new Promise(r => setTimeout(r, 1400));

            // Resume graph execution passing selected option
            const res3 = await debateGraph.invoke({
                user_selected_option: optionId,
                needs_human_decision: false
            }, threadConfig);

            setMessages(prev => [...prev, ...(res3.messages || [])]);
            setConsensusScore(res3.consensus_score || 88);
            setActiveSpeaker('finance');

            await new Promise(r => setTimeout(r, 1600));

            // Final convergence check
            const res4 = await debateGraph.invoke(null, threadConfig);
            if (res4.messages && res4.messages.length > 0) {
                setMessages(prev => [...prev, ...res4.messages]);
            }
            setConsensusScore(res4.consensus_score || 98);

            if (res4.consensus_reached || (res4.consensus_score || 0) >= 85) {
                setConsensusReached(true);
                setActiveSpeaker('both');
                setVerifiedPayload(res4.verified_payload);
            }
            setIsThinking(false);
        } catch (err) {
            console.error("Resume graph error:", err);
            setError("Failed to resume debate loop: " + err.message);
            setIsThinking(false);
        }
    };

    const handleProceedBlueprint = () => {
        if (!consensusReached || !verifiedPayload) return;
        updateVerifiedBlueprint(verifiedPayload);
        setActiveStep('dashboard');
        router.push('/dashboard');
    };

    return (
        <>
            <style>{`
                /* Custom Keyframes & Scrollbar */
                .eq-bar {
                    width: 3px;
                    height: 12px;
                    background-color: #00F2FE;
                    display: inline-block;
                    margin: 0 1px;
                    animation: eq-anim 1.2s infinite ease-in-out alternate;
                    border-radius: 1px;
                }
                .eq-bar:nth-child(2) { animation-delay: 0.2s; height: 16px; }
                .eq-bar:nth-child(3) { animation-delay: 0.4s; height: 10px; }
                .eq-bar:nth-child(4) { animation-delay: 0.1s; height: 14px; }
                
                @keyframes eq-anim {
                    0% { transform: scaleY(0.3); }
                    100% { transform: scaleY(1); }
                }
                
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

                /* Custom Hover & Effects that cannot be inline */
                .inner-glow { border: 1px solid rgba(255, 255, 255, 0.08); }
                .inner-glow:hover { border-color: rgba(255, 255, 255, 0.15); }
                .glowing-border { border: 1px solid #00F2FE; box-shadow: inset 0 0 10px rgba(0, 242, 254, 0.2); }
                .glowing-border-purple { border: 1px solid #A78BFA; box-shadow: inset 0 0 10px rgba(167, 139, 250, 0.2); }
                .glowing-border-green { border: 1px solid #34D399; box-shadow: inset 0 0 10px rgba(52, 211, 153, 0.2); }
                
                .hover-text-primary:hover { color: #c0c1ff !important; }
                .hover-bg-surface-variant:hover { background-color: #34343d !important; }
                .hover-opacity-100:hover { opacity: 1 !important; }
                .hover-opacity-90:hover { opacity: 0.9 !important; }
                
                .group:hover .group-hover-opacity-100 { opacity: 1 !important; }
                .hover-border-primary:hover { border-color: rgba(192, 193, 255, 0.5) !important; }
                .hover-border-tertiary:hover { border-color: rgba(255, 183, 131, 0.5) !important; }
                
                .hover-btn-primary:hover { background-color: #c0c1ff !important; color: #1000a9 !important; }
                .hover-btn-surface:hover { background-color: #c7c4d7 !important; color: #13131b !important; }
                
                .transition-all { transition: all 0.3s ease; }
                .transition-colors { transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease; }
                .transition-opacity { transition: opacity 0.3s ease; }
            `}</style>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                width: '100%',
                padding: '24px',
                gap: '16px',
                WebkitFontSmoothing: 'antialiased',
                color: '#e4e1ed',
                fontFamily: '"Inter", sans-serif',
                overflowY: 'auto',
                margin: 0
            }}>
                
                {/* Center Stage Wrapper */}
                <main style={{
                    width: '100%',
                    maxWidth: '1100px',
                    flex: 1,
                    minHeight: '720px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    backgroundColor: 'transparent',
                    overflow: 'hidden',
                    backdropFilter: 'blur(40px)'
                }}>
                    
                    {/* Top App Bar */}
                    <header style={{
                        height: '4rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        flexShrink: 0,
                        zIndex: 10,
                        borderBottom: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                fontFamily: '"Plus Jakarta Sans", sans-serif',
                                fontSize: '24px',
                                lineHeight: '32px',
                                fontWeight: 800,
                                color: 'transparent',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                backgroundImage: 'linear-gradient(to right, #c0c1ff, #adc6ff)'
                            }}>
                                WarRoom OS
                            </div>
                            <span style={{
                                padding: '2px 10px',
                                borderRadius: '9999px',
                                backgroundColor: consensusReached ? 'rgba(52, 211, 153, 0.15)' : 'rgba(0, 242, 254, 0.15)',
                                color: consensusReached ? '#34D399' : '#00F2FE',
                                fontSize: '12px',
                                fontWeight: 700,
                                border: `1px solid ${consensusReached ? 'rgba(52, 211, 153, 0.3)' : 'rgba(0, 242, 254, 0.3)'}`
                            }}>
                                Alignment: {consensusScore}%
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button className="hover-bg-surface-variant transition-colors" style={{
                                padding: '0.375rem 0.75rem',
                                borderRadius: '0.375rem',
                                border: '1px solid rgba(70, 69, 84, 0.3)',
                                color: '#c7c4d7',
                                fontFamily: '"Inter", sans-serif',
                                fontSize: '11px',
                                fontWeight: 600,
                                letterSpacing: '0.05em',
                                background: 'transparent',
                                cursor: 'pointer'
                            }}>
                                Emergency Stop
                            </button>
                            <button className="inner-glow" style={{
                                padding: '0.375rem 0.75rem',
                                borderRadius: '0.375rem',
                                backgroundImage: consensusReached ? 'linear-gradient(to right, #34D399, #10B981)' : 'linear-gradient(to right, #8083ff, #c0c1ff)',
                                color: consensusReached ? '#064E3B' : '#1000a9',
                                fontFamily: '"Inter", sans-serif',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                border: 'none',
                                cursor: 'pointer'
                            }}>
                                {consensusReached ? 'Consensus Locked' : 'ReAct Loop Active'}
                            </button>
                        </div>
                    </header>

                    {error && (
                        <div style={{ padding: '12px 24px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderBottom: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{error}</span>
                            <button onClick={() => window.location.reload()} style={{ padding: '4px 12px', borderRadius: '6px', backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Retry</button>
                        </div>
                    )}

                    {/* Meeting Stage Grid */}
                    <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '1.5rem', paddingBottom: '1rem', flexShrink: 0, marginBottom: '0.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', maxWidth: '760px', marginLeft: 'auto', marginRight: 'auto', gap: '1.5rem', height: '180px' }}>
                            
                            {/* Market Intelligence Agent Card */}
                            <div className={activeSpeaker === 'market' || activeSpeaker === 'both' ? 'glowing-border' : 'inner-glow'} style={{ backgroundColor: '#0D121F', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                                {(activeSpeaker === 'market' || activeSpeaker === 'both') && (
                                    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'radial-gradient(ellipse at center, rgba(0,242,254,0.1), transparent)', opacity: 0.5 }}></div>
                                )}
                                <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', overflow: 'hidden', border: `2px solid ${activeSpeaker === 'market' || activeSpeaker === 'both' ? '#00F2FE' : 'rgba(70, 69, 84, 0.5)'}`, marginBottom: '0.75rem', position: 'relative', zIndex: 10 }}>
                                    <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk_nY__9icBAQdCckdv-oT8bt1Qqv7zjOhmRRy9H17lRJqkqUkkXpQz3SY5jiXdzPIuWWfDEluOhaAnIXjhs8xCHn-52YCkoetuRPyb_n9rea-yKIgT6-rAHXgf4qmGjLqPLqICCaGawznEiRYdcpLRhwKxiz6z5ke2okDYujePzakZSpsjtH0FG2k5zHAR0IsMfWiKwkwA_Xwq0w7AEu0HRgRuVBcW96m1y-W-t3OfjKL5Lsjhs1EcYfVzUER0BQUdLOyyOmdO2eQ" alt="Market Analyst" />
                                </div>
                                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', fontWeight: 500, color: '#e4e1ed', zIndex: 10 }}>Market Intel</span>
                                {(activeSpeaker === 'market' || activeSpeaker === 'both') ? (
                                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', height: '0.75rem', alignItems: 'center', zIndex: 10 }}>
                                        <span className="eq-bar"></span><span className="eq-bar"></span><span className="eq-bar"></span>
                                    </div>
                                ) : null}
                                <span style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: activeSpeaker === 'market' || activeSpeaker === 'both' ? 'rgba(0,242,254,0.1)' : '#34343d', color: activeSpeaker === 'market' || activeSpeaker === 'both' ? '#00F2FE' : '#c7c4d7', fontSize: '11px', fontWeight: 600 }}>
                                    {activeSpeaker === 'market' || activeSpeaker === 'both' ? 'Speaking' : 'Listening'}
                                </span>
                            </div>

                            {/* Financial Modeler Agent Card */}
                            <div className={activeSpeaker === 'finance' ? 'glowing-border-purple' : activeSpeaker === 'both' ? 'glowing-border-green' : 'inner-glow'} style={{ backgroundColor: 'rgba(13, 18, 31, 0.65)', backdropFilter: 'blur(8px)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', overflow: 'hidden', border: `2px solid ${activeSpeaker === 'finance' ? '#A78BFA' : activeSpeaker === 'both' ? '#34D399' : 'rgba(255,183,131,0.3)'}`, marginBottom: '0.75rem' }}>
                                    <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuDleIs6dhFNwep_DS-eAp0VeOM219djpie7YBn9MNh3fv6oCiejB0uHLwTgVR4z6qP61vazNDi6WzP_KSRtiC5YyKUPhGN9YaazalhDMYTqS28hyW5pZwBcJR-D8zNoJduWsVNE--GaWsfgXBfrsSCHMiEWOCzbJBExK7axT6UL9gnocPUykV_mp985oY6h8YhN9DV-5seVsmCUeTko6t17fZiVzfjPRrIuaE5Ix4KoHH1YPj_Iy7Gqj-ZKjmvgYh6lm0bPAmwFHg4z" alt="Financial Modeler" />
                                </div>
                                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', fontWeight: 500, color: '#e4e1ed' }}>Financial Modeler</span>
                                {(activeSpeaker === 'finance' || activeSpeaker === 'both') && (
                                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', height: '0.75rem', alignItems: 'center', zIndex: 10 }}>
                                        <span className="eq-bar" style={{ backgroundColor: activeSpeaker === 'finance' ? '#A78BFA' : '#34D399' }}></span>
                                        <span className="eq-bar" style={{ backgroundColor: activeSpeaker === 'finance' ? '#A78BFA' : '#34D399' }}></span>
                                        <span className="eq-bar" style={{ backgroundColor: activeSpeaker === 'finance' ? '#A78BFA' : '#34D399' }}></span>
                                    </div>
                                )}
                                <span style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: activeSpeaker === 'finance' ? 'rgba(167,139,250,0.1)' : activeSpeaker === 'both' ? 'rgba(52,211,153,0.1)' : 'rgba(255,183,131,0.1)', color: activeSpeaker === 'finance' ? '#A78BFA' : activeSpeaker === 'both' ? '#34D399' : '#ffb783', fontSize: '11px', fontWeight: 600, border: '1px solid rgba(255,183,131,0.2)' }}>
                                    {activeSpeaker === 'finance' ? 'Speaking' : activeSpeaker === 'both' ? 'Consensus' : 'Auditing'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Chat Stream Container */}
                    <div style={{ flex: 1, minHeight: '440px', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(8, 11, 17, 0.95)', margin: '0 24px 24px 24px', borderRadius: '0.75rem', backdropFilter: 'blur(4px)', border: '1px solid rgba(70, 69, 84, 0.3)', overflow: 'hidden' }}>
                        
                        {/* Scrollable Message Stream restricted to ~2 messages height */}
                        <div ref={streamContainerRef} style={{ maxHeight: '250px', overflowY: 'auto', padding: '16px 24px', borderBottom: '1px solid rgba(70, 69, 84, 0.2)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
                                {messages.map((msg, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                                        {msg.role === 'market' ? (
                                            <div style={{ width: '2.2rem', height: '2.2rem', borderRadius: '0.375rem', overflow: 'hidden', flexShrink: 0, marginTop: '0.25rem', border: '1px solid rgba(0, 242, 254, 0.5)' }}>
                                                <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtiiI0LxsiTgU7qMKI82JNFcPq3gUvBMnF4lQIFylL4No0KOIRWMRvYTr1j7UwTmDfN1vS0P5oAeFGFiGkW9jU4VBJu9ATraF97wj_kVzKYuM5DWXn8CKO9G4_O1ZL5L7jS4Rfqe96LcAi74kS8oaXn6jEKC8xNLxEBh2bQKTH-LzgAgSpQkb1WDc5GZ5BZ3BaFIYTP0av9KDk4rZiWQSl-_cXz9SHPs2kqDijG9gVQ0G6qs_yz6I38ML8xW-zC5YJ44a_gRfI_FAC" alt="Market Intel" />
                                            </div>
                                        ) : msg.role === 'finance' ? (
                                            <div style={{ width: '2.2rem', height: '2.2rem', borderRadius: '0.375rem', overflow: 'hidden', flexShrink: 0, marginTop: '0.25rem', border: '1px solid rgba(167, 139, 250, 0.5)' }}>
                                                <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4snu6T4IDE8PaaYhSoUnUxcRZ8BSkHdlSMpQNYhvH_L_CkywJZCrB7sDa45oZtV4WKCl0Xh8Q9PIQFpIHoursJrwaX8c8ihdkPMLuQVjB4D3yA1dipfFIRxKT-5ztvX1TMA4HR3SEJtnky7zAjhaSrI0IR41KUWVZceOZlRdle7Fov-d1Oz75tKzDead1E7gJrPks6F69Yb0O_ADeNlYLU7yo1yAKcET-Iy0fURzsLFxBWrGmx-2HPoyLj3z9oUr6TB2FKspfreBM" alt="Financial Modeler" />
                                            </div>
                                        ) : (
                                            <div style={{ borderLeft: '2px solid #8083ff', paddingLeft: '0.75rem', flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#e4e1ed' }}>System</span>
                                                    <span style={{ fontSize: '11px', color: '#908fa0' }}>{msg.timestamp || 'Live'}</span>
                                                </div>
                                                <p style={{ fontSize: '14px', lineHeight: '22px', color: '#c7c4d7', margin: 0 }}>{msg.content}</p>
                                            </div>
                                        )}

                                        {msg.role !== 'system' && (
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#e4e1ed' }}>
                                                        {msg.role === 'market' ? 'Market Intel' : 'Financial Modeler'}
                                                    </span>
                                                    <span style={{
                                                        padding: '0.125rem 0.5rem',
                                                        borderRadius: '9999px',
                                                        backgroundColor: msg.role === 'market' ? 'rgba(0,242,254,0.1)' : 'rgba(167,139,250,0.1)',
                                                        color: msg.role === 'market' ? '#00F2FE' : '#A78BFA',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        border: `1px solid ${msg.role === 'market' ? 'rgba(0,242,254,0.2)' : 'rgba(167,139,250,0.2)'}`
                                                    }}>
                                                        {msg.role === 'market' ? 'Active Analysis' : 'Auditing / Stress-Test'}
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: '#908fa0' }}>{msg.timestamp || 'Live'}</span>
                                                </div>
                                                {msg.searched_sites && msg.searched_sites.length > 0 && (
                                                    <div style={{ marginBottom: '0.5rem', padding: '0.35rem 0.6rem', borderRadius: '0.375rem', backgroundColor: msg.role === 'market' ? 'rgba(0, 242, 254, 0.05)' : 'rgba(167, 139, 250, 0.05)', borderLeft: `2px solid ${msg.role === 'market' ? 'rgba(0, 242, 254, 0.4)' : 'rgba(167, 139, 250, 0.4)'}` }}>
                                                        {msg.searched_sites.map((site, sIdx) => (
                                                            <div key={sIdx} style={{ fontSize: '11px', color: 'rgba(199, 196, 215, 0.6)', lineHeight: '18px', fontFamily: '"Plus Jakarta Sans", monospace', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span style={{ color: msg.role === 'market' ? '#00F2FE' : '#A78BFA', fontSize: '10px' }}>⚡</span>
                                                                <span>{msg.role === 'market' ? 'Checked site:' : 'Checked tool:'} {site}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <p style={{ fontSize: '14px', lineHeight: 1.625, color: '#c7c4d7', margin: 0 }}>
                                                    {msg.content}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isThinking && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: activeSpeaker === 'finance' ? '#A78BFA' : '#00F2FE', fontSize: '13px', fontStyle: 'italic', padding: '4px 0' }}>
                                        <span className="eq-bar" style={{ backgroundColor: activeSpeaker === 'finance' ? '#A78BFA' : '#00F2FE' }}></span>
                                        <span className="eq-bar" style={{ backgroundColor: activeSpeaker === 'finance' ? '#A78BFA' : '#00F2FE' }}></span>
                                        <span>{activeSpeaker === 'market' ? 'tool calling......' : 'financial simulation & regulatory tool calling......'}</span>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Bottom Option Box (Appears when graph hits interrupt()) */}
                        {showOptionBox && (
                            <div style={{ flexShrink: 0, padding: '0 24px 24px 24px', borderTop: '1px solid rgba(70, 69, 84, 0.2)', paddingTop: '1.5rem', backgroundColor: 'rgba(8, 11, 17, 0.6)' }}>
                                <div style={{ maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
                                    <div className="inner-glow" style={{ padding: '1.5rem', borderRadius: '0.75rem', backgroundColor: 'rgba(41, 41, 50, 0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(192, 193, 255, 0.3)' }}>
                                        <h3 style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '18px', lineHeight: '24px', fontWeight: 600, color: '#c0c1ff', margin: '0 0 1rem 0' }}>
                                            ⚡ Consensus Trade-off: Select Primary Strategy
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                                            
                                            {(tradeoffOptions || [
                                                {
                                                    id: 'option_a',
                                                    title: 'Fast Market Share Growth ($15/customer)',
                                                    tag: 'High Growth',
                                                    description: 'Focus on fast customer acquisition using paid ads. Best for rapid brand awareness.'
                                                },
                                                {
                                                    id: 'option_b',
                                                    title: 'Safe Profit Margins & Viral Invites ($12/customer)',
                                                    tag: 'Recommended',
                                                    description: 'Focus on team referral sharing and organic invites. Keeps profit margins high and extends runway beyond 24 months.'
                                                }
                                            ]).map((opt, idx) => (
                                                <div key={opt.id || idx} className={`group ${opt.id === 'option_b' ? 'hover-border-tertiary' : 'hover-border-primary'} transition-all`} style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'rgba(52, 52, 61, 0.5)', border: '1px solid rgba(70, 69, 84, 0.4)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#e4e1ed' }}>{opt.id === 'option_a' ? 'Option A' : 'Option B'}</span>
                                                        <span style={{ fontSize: '11px', color: opt.id === 'option_b' ? '#34D399' : '#c0c1ff', backgroundColor: opt.id === 'option_b' ? 'rgba(52,211,153,0.1)' : 'rgba(192,193,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{opt.tag || (opt.id === 'option_b' ? 'Recommended' : 'High Growth')}</span>
                                                    </div>
                                                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#e4e1ed', margin: '0 0 0.25rem 0' }}>{opt.title}</h4>
                                                    <p style={{ fontSize: '14px', lineHeight: '22px', color: '#c7c4d7', margin: '0 0 1rem 0' }}>{opt.description}</p>
                                                    <button onClick={() => handleSelectOption(opt.id || 'option_a')} className={opt.id === 'option_b' ? 'hover-btn-surface transition-all' : 'hover-btn-primary transition-all'} style={{ width: '100%', padding: '0.6rem 0', borderRadius: '0.375rem', backgroundColor: opt.id === 'option_b' ? '#34D399' : 'rgba(192, 193, 255, 0.15)', border: opt.id === 'option_b' ? 'none' : '1px solid rgba(192, 193, 255, 0.4)', color: opt.id === 'option_b' ? '#064E3B' : '#c0c1ff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                                                        Select This Option
                                                    </button>
                                                </div>
                                            ))}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </main>

                {/* Proceed Blueprint Button */}
                <div style={{ width: '100%', maxWidth: '1100px', flexShrink: 0, display: 'flex', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                    <button 
                        onClick={handleProceedBlueprint}
                        disabled={!consensusReached}
                        className="inner-glow transition-all" 
                        style={{
                            width: '280px',
                            maxWidth: '28%',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '0.75rem',
                            backgroundImage: consensusReached ? 'linear-gradient(to right, #34D399, #10B981)' : 'linear-gradient(to right, #34343d, #464554)',
                            color: consensusReached ? '#064E3B' : '#908fa0',
                            fontFamily: '"Plus Jakarta Sans", sans-serif',
                            fontSize: '14px',
                            fontWeight: 700,
                            boxShadow: consensusReached ? '0 0 25px rgba(52, 211, 153, 0.4)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            border: 'none',
                            cursor: consensusReached ? 'pointer' : 'not-allowed',
                            opacity: consensusReached ? 1 : 0.6,
                            textAlign: 'center',
                            lineHeight: '1.4'
                        }}
                    >
                        {consensusReached ? 'Proceed To Blueprint →' : 'Awaiting Debate Consensus...'}
                    </button>
                </div>
            </div>
        </>
    );
}
