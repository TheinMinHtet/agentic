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
        startupIdea,
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
                const isPhysical = (() => {
                    const text = `${refinedConcept?.improved_summary || ''} ${businessInfo?.business_type || ''} ${businessInfo?.core_painpoint || ''} ${startupIdea || ''}`.toLowerCase();
                    const physicalKeywords = ['physical', 'food', 'beverage', 'retail', 'hardware', 'clothing', 'fashion', 'cosmetics', 'snack', 'drink', 'manufacturing', 'cogs', 'packaging', 'factory', 'goods', 'product', 'restaurant', 'cafe', 'store'];
                    const digitalKeywords = ['saas', 'software', 'app', 'edtech', 'platform', 'ai', 'cloud', 'portal', 'token', 'website'];
                    const hasPhysical = physicalKeywords.some(kw => text.includes(kw));
                    const hasDigital = digitalKeywords.some(kw => text.includes(kw));
                    return hasPhysical && !hasDigital;
                })();

                const derivedName = refinedConcept?.companyName || businessInfo?.company_name || businessInfo?.title || (startupIdea ? startupIdea.split(' ').slice(0, 3).join(' ').replace(/[^a-zA-Z0-9 ]/g, '') : null) || (isPhysical ? "Myanmar Craft Consumer Goods" : "EduBot Myanmar");

                // Initial input to graph
                const conceptData = {
                    companyName: derivedName,
                    targetCountry: refinedConcept?.target_country || businessInfo?.target_country || "Myanmar",
                    location: businessInfo?.location || "Yangon, Myanmar",
                    businessType: businessInfo?.business_type || (isPhysical ? "Physical Product / Retail" : "EdTech / SaaS"),
                    initialCapital: isPhysical ? 10000000 : 8000000,
                    monthlyBurnRate: isPhysical ? 2500000 : 1500000,
                    description: refinedConcept?.improved_summary || businessInfo?.core_painpoint || startupIdea || (isPhysical ? "Locally sourced quality physical products with robust supply chain distribution." : "AI-powered digital platform solving local user pain points across Myanmar."),
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
            <style jsx global>{`
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

                /* Custom Hover & Effects */
                .inner-glow { border: 1px solid rgba(255, 255, 255, 0.08); }
                .inner-glow:hover { border-color: rgba(255, 255, 255, 0.15); }
                .glowing-border { border: 1px solid #00F2FE; box-shadow: inset 0 0 10px rgba(0, 242, 254, 0.2); }
                .glowing-border-purple { border: 1px solid #A78BFA; box-shadow: inset 0 0 10px rgba(167, 139, 250, 0.2); }
                .glowing-border-green { border: 1px solid #34D399; box-shadow: inset 0 0 10px rgba(52, 211, 153, 0.2); }
                
                .hover-bg-surface-variant:hover { background-color: #34343d !important; }
                .hover-border-primary:hover { border-color: rgba(192, 193, 255, 0.5) !important; }
                .hover-border-tertiary:hover { border-color: rgba(255, 183, 131, 0.5) !important; }
                .hover-btn-primary:hover { background-color: #c0c1ff !important; color: #1000a9 !important; }
                .hover-btn-surface:hover { background-color: #c7c4d7 !important; color: #13131b !important; }
                
                .transition-all { transition: all 0.3s ease; }
                .transition-colors { transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease; }

                /* Responsive Layout Classes */
                .warroom-page-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    min-height: 100vh;
                    width: 100%;
                    padding: 24px;
                    gap: 20px;
                    -webkit-font-smoothing: antialiased;
                    color: #e4e1ed;
                    font-family: 'Inter', sans-serif;
                    overflow-y: auto;
                    box-sizing: border-box;
                }

                .warroom-main-card {
                    width: 100%;
                    max-width: 1100px;
                    flex: 1;
                    min-height: 680px;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    background-color: transparent;
                    overflow: hidden;
                    backdrop-filter: blur(40px);
                }

                .warroom-header {
                    min-height: 4.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    flex-shrink: 0;
                    z-index: 10;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .warroom-header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .warroom-header-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .warroom-title {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 24px;
                    line-height: 32px;
                    font-weight: 800;
                    color: transparent;
                    -webkit-background-clip: text;
                    background-clip: text;
                    background-image: linear-gradient(to right, #c0c1ff, #adc6ff);
                }

                .warroom-badge {
                    padding: 4px 12px;
                    border-radius: 9999px;
                    font-size: 12px;
                    font-weight: 700;
                    white-space: nowrap;
                }

                .warroom-stage-section {
                    padding: 24px 24px 16px 24px;
                    flex-shrink: 0;
                }

                .warroom-agents-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    max-width: 760px;
                    margin: 0 auto;
                    gap: 24px;
                    min-height: 170px;
                }

                .agent-card {
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .agent-avatar-wrapper {
                    width: 4.2rem;
                    height: 4.2rem;
                    border-radius: 9999px;
                    overflow: hidden;
                    margin-bottom: 12px;
                    position: relative;
                    z-index: 10;
                    flex-shrink: 0;
                }

                .warroom-chat-box {
                    flex: 1;
                    min-height: 400px;
                    display: flex;
                    flex-direction: column;
                    background-color: rgba(8, 11, 17, 0.95);
                    margin: 0 24px 24px 24px;
                    border-radius: 12px;
                    backdrop-filter: blur(4px);
                    border: 1px solid rgba(70, 69, 84, 0.3);
                    overflow: hidden;
                }

                .warroom-chat-stream {
                    flex: 1;
                    max-height: 320px;
                    overflow-y: auto;
                    padding: 20px 24px;
                    border-bottom: 1px solid rgba(70, 69, 84, 0.2);
                }

                .chat-msg-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .chat-msg-row:last-child {
                    margin-bottom: 0;
                }

                .chat-avatar {
                    width: 2.2rem;
                    height: 2.2rem;
                    border-radius: 6px;
                    overflow: hidden;
                    flex-shrink: 0;
                    margin-top: 4px;
                }

                .warroom-option-box {
                    flex-shrink: 0;
                    padding: 24px;
                    border-top: 1px solid rgba(70, 69, 84, 0.2);
                    background-color: rgba(8, 11, 17, 0.65);
                }

                .tradeoff-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 16px;
                }

                .proceed-btn-wrapper {
                    width: 100%;
                    max-width: 1100px;
                    flex-shrink: 0;
                    display: flex;
                    justify-content: center;
                    margin: 0 auto 16px auto;
                    padding: 0 12px;
                    box-sizing: border-box;
                }

                .proceed-btn {
                    width: 28%;
                    min-width: 260px;
                    max-width: 320px;
                    padding: 14px 24px;
                    border-radius: 12px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 14px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: none;
                    transition: all 0.3s ease;
                    text-align: center;
                    line-height: 1.4;
                    box-sizing: border-box;
                }

                /* TABLET BREAKPOINT (< 768px) */
                @media (max-width: 768px) {
                    .warroom-page-wrapper {
                        padding: 16px;
                        gap: 16px;
                    }
                    .warroom-main-card {
                        min-height: auto;
                        border-radius: 12px;
                    }
                    .warroom-header {
                        padding: 14px 16px;
                    }
                    .warroom-stage-section {
                        padding: 16px 16px 12px 16px;
                    }
                    .warroom-agents-grid {
                        gap: 14px;
                        min-height: 150px;
                    }
                    .agent-avatar-wrapper {
                        width: 3.5rem;
                        height: 3.5rem;
                        margin-bottom: 8px;
                    }
                    .warroom-chat-box {
                        margin: 0 16px 16px 16px;
                        min-height: 350px;
                    }
                    .warroom-chat-stream {
                        padding: 16px;
                        max-height: 300px;
                    }
                    .warroom-option-box {
                        padding: 16px;
                    }
                    .proceed-btn {
                        width: 60%;
                        min-width: 240px;
                    }
                }

                /* MOBILE BREAKPOINT (< 576px) */
                @media (max-width: 576px) {
                    .warroom-page-wrapper {
                        padding: 10px;
                        gap: 14px;
                    }
                    .warroom-header {
                        flex-direction: column;
                        align-items: stretch;
                        padding: 12px 14px;
                        gap: 12px;
                    }
                    .warroom-header-left {
                        justify-content: space-between;
                        width: 100%;
                    }
                    .warroom-header-right {
                        justify-content: space-between;
                        width: 100%;
                        gap: 8px;
                    }
                    .warroom-header-right button {
                        flex: 1;
                        padding: 8px 10px;
                        font-size: 11px;
                        justify-content: center;
                    }
                    .warroom-title {
                        font-size: 20px;
                    }
                    .warroom-stage-section {
                        padding: 14px 12px 10px 12px;
                    }
                    .warroom-agents-grid {
                        grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
                        gap: 10px;
                    }
                    .agent-card {
                        padding: 12px 8px;
                    }
                    .agent-avatar-wrapper {
                        width: 3.2rem;
                        height: 3.2rem;
                    }
                    .warroom-chat-box {
                        margin: 0 12px 12px 12px;
                        min-height: 320px;
                    }
                    .warroom-chat-stream {
                        padding: 12px;
                        max-height: 260px;
                    }
                    .chat-msg-row {
                        gap: 10px;
                        margin-bottom: 16px;
                    }
                    .chat-avatar {
                        width: 1.8rem;
                        height: 1.8rem;
                    }
                    .warroom-option-box {
                        padding: 14px 12px;
                    }
                    .tradeoff-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    .proceed-btn {
                        width: 100%;
                        max-width: 100%;
                        min-width: auto;
                        padding: 14px 16px;
                    }
                }
            `}</style>

            <div className="warroom-page-wrapper">
                
                {/* Center Stage Wrapper */}
                <main className="warroom-main-card">
                    
                    {/* Top App Bar */}
                    <header className="warroom-header">
                        <div className="warroom-header-left">
                            <div className="warroom-title">
                                WarRoom OS
                            </div>
                            <span className="warroom-badge" style={{
                                backgroundColor: consensusReached ? 'rgba(52, 211, 153, 0.15)' : 'rgba(0, 242, 254, 0.15)',
                                color: consensusReached ? '#34D399' : '#00F2FE',
                                border: `1px solid ${consensusReached ? 'rgba(52, 211, 153, 0.3)' : 'rgba(0, 242, 254, 0.3)'}`
                            }}>
                                Alignment: {consensusScore}%
                            </span>
                        </div>

                        <div className="warroom-header-right">
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
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center'
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
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center'
                            }}>
                                {consensusReached ? 'Consensus Locked' : 'ReAct Loop Active'}
                            </button>
                        </div>
                    </header>

                    {error && (
                        <div style={{ padding: '12px 24px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderBottom: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <span>{error}</span>
                            <button onClick={() => window.location.reload()} style={{ padding: '6px 14px', borderRadius: '6px', backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Retry</button>
                        </div>
                    )}

                    {/* Meeting Stage Grid */}
                    <div className="warroom-stage-section">
                        <div className="warroom-agents-grid">
                            
                            {/* Market Intelligence Agent Card */}
                            <div className={`agent-card ${activeSpeaker === 'market' || activeSpeaker === 'both' ? 'glowing-border' : 'inner-glow'}`} style={{ backgroundColor: '#0D121F' }}>
                                {(activeSpeaker === 'market' || activeSpeaker === 'both') && (
                                    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'radial-gradient(ellipse at center, rgba(0,242,254,0.1), transparent)', opacity: 0.5 }}></div>
                                )}
                                <div className="agent-avatar-wrapper" style={{ border: `2px solid ${activeSpeaker === 'market' || activeSpeaker === 'both' ? '#00F2FE' : 'rgba(70, 69, 84, 0.5)'}` }}>
                                    <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk_nY__9icBAQdCckdv-oT8bt1Qqv7zjOhmRRy9H17lRJqkqUkkXpQz3SY5jiXdzPIuWWfDEluOhaAnIXjhs8xCHn-52YCkoetuRPyb_n9rea-yKIgT6-rAHXgf4qmGjLqPLqICCaGawznEiRYdcpLRhwKxiz6z5ke2okDYujePzakZSpsjtH0FG2k5zHAR0IsMfWiKwkwA_Xwq0w7AEu0HRgRuVBcW96m1y-W-t3OfjKL5Lsjhs1EcYfVzUER0BQUdLOyyOmdO2eQ" alt="Market Analyst" />
                                </div>
                                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', fontWeight: 600, color: '#e4e1ed', zIndex: 10, textAlign: 'center' }}>Market Intel</span>
                                {(activeSpeaker === 'market' || activeSpeaker === 'both') ? (
                                    <div style={{ position: 'absolute', top: '0.65rem', right: '0.65rem', display: 'flex', height: '0.75rem', alignItems: 'center', zIndex: 10 }}>
                                        <span className="eq-bar"></span><span className="eq-bar"></span><span className="eq-bar"></span>
                                    </div>
                                ) : null}
                                <span style={{ position: 'absolute', bottom: '0.65rem', left: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: activeSpeaker === 'market' || activeSpeaker === 'both' ? 'rgba(0,242,254,0.15)' : '#34343d', color: activeSpeaker === 'market' || activeSpeaker === 'both' ? '#00F2FE' : '#c7c4d7', fontSize: '10px', fontWeight: 700 }}>
                                    {activeSpeaker === 'market' || activeSpeaker === 'both' ? 'Speaking' : 'Listening'}
                                </span>
                            </div>

                            {/* Financial Modeler Agent Card */}
                            <div className={`agent-card ${activeSpeaker === 'finance' ? 'glowing-border-purple' : activeSpeaker === 'both' ? 'glowing-border-green' : 'inner-glow'}`} style={{ backgroundColor: 'rgba(13, 18, 31, 0.65)', backdropFilter: 'blur(8px)' }}>
                                <div className="agent-avatar-wrapper" style={{ border: `2px solid ${activeSpeaker === 'finance' ? '#A78BFA' : activeSpeaker === 'both' ? '#34D399' : 'rgba(255,183,131,0.3)'}` }}>
                                    <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuDleIs6dhFNwep_DS-eAp0VeOM219djpie7YBn9MNh3fv6oCiejB0uHLwTgVR4z6qP61vazNDi6WzP_KSRtiC5YyKUPhGN9YaazalhDMYTqS28hyW5pZwBcJR-D8zNoJduWsVNE--GaWsfgXBfrsSCHMiEWOCzbJBExK7axT6UL9gnocPUykV_mp985oY6h8YhN9DV-5seVsmCUeTko6t17fZiVzfjPRrIuaE5Ix4KoHH1YPj_Iy7Gqj-ZKjmvgYh6lm0bPAmwFHg4z" alt="Financial Modeler" />
                                </div>
                                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', fontWeight: 600, color: '#e4e1ed', zIndex: 10, textAlign: 'center' }}>Financial Modeler</span>
                                {(activeSpeaker === 'finance' || activeSpeaker === 'both') && (
                                    <div style={{ position: 'absolute', top: '0.65rem', right: '0.65rem', display: 'flex', height: '0.75rem', alignItems: 'center', zIndex: 10 }}>
                                        <span className="eq-bar" style={{ backgroundColor: activeSpeaker === 'finance' ? '#A78BFA' : '#34D399' }}></span>
                                        <span className="eq-bar" style={{ backgroundColor: activeSpeaker === 'finance' ? '#A78BFA' : '#34D399' }}></span>
                                        <span className="eq-bar" style={{ backgroundColor: activeSpeaker === 'finance' ? '#A78BFA' : '#34D399' }}></span>
                                    </div>
                                )}
                                <span style={{ position: 'absolute', bottom: '0.65rem', left: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: activeSpeaker === 'finance' ? 'rgba(167,139,250,0.15)' : activeSpeaker === 'both' ? 'rgba(52,211,153,0.15)' : 'rgba(255,183,131,0.15)', color: activeSpeaker === 'finance' ? '#A78BFA' : activeSpeaker === 'both' ? '#34D399' : '#ffb783', fontSize: '10px', fontWeight: 700, border: '1px solid rgba(255,183,131,0.2)' }}>
                                    {activeSpeaker === 'finance' ? 'Speaking' : activeSpeaker === 'both' ? 'Consensus' : 'Auditing'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Chat Stream Container */}
                    <div className="warroom-chat-box">
                        
                        {/* Scrollable Message Stream */}
                        <div ref={streamContainerRef} className="warroom-chat-stream">
                            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
                                {messages.map((msg, i) => (
                                    <div key={i} className="chat-msg-row">
                                        {msg.role === 'market' ? (
                                            <div className="chat-avatar" style={{ border: '1px solid rgba(0, 242, 254, 0.5)' }}>
                                                <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtiiI0LxsiTgU7qMKI82JNFcPq3gUvBMnF4lQIFylL4No0KOIRWMRvYTr1j7UwTmDfN1vS0P5oAeFGFiGkW9jU4VBJu9ATraF97wj_kVzKYuM5DWXn8CKO9G4_O1ZL5L7jS4Rfqe96LcAi74kS8oaXn6jEKC8xNLxEBh2bQKTH-LzgAgSpQkb1WDc5GZ5BZ3BaFIYTP0av9KDk4rZiWQSl-_cXz9SHPs2kqDijG9gVQ0G6qs_yz6I38ML8xW-zC5YJ44a_gRfI_FAC" alt="Market Intel" />
                                            </div>
                                        ) : msg.role === 'finance' ? (
                                            <div className="chat-avatar" style={{ border: '1px solid rgba(167, 139, 250, 0.5)' }}>
                                                <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4snu6T4IDE8PaaYhSoUnUxcRZ8BSkHdlSMpQNYhvH_L_CkywJZCrB7sDa45oZtV4WKCl0Xh8Q9PIQFpIHoursJrwaX8c8ihdkPMLuQVjB4D3yA1dipfFIRxKT-5ztvX1TMA4HR3SEJtnky7zAjhaSrI0IR41KUWVZceOZlRdle7Fov-d1Oz75tKzDead1E7gJrPks6F69Yb0O_ADeNlYLU7yo1yAKcET-Iy0fURzsLFxBWrGmx-2HPoyLj3z9oUr6TB2FKspfreBM" alt="Financial Modeler" />
                                            </div>
                                        ) : (
                                            <div style={{ borderLeft: '2px solid #8083ff', paddingLeft: '0.75rem', flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#e4e1ed' }}>System</span>
                                                    <span style={{ fontSize: '11px', color: '#908fa0' }}>{msg.timestamp || 'Live'}</span>
                                                </div>
                                                <p style={{ fontSize: '14px', lineHeight: '22px', color: '#c7c4d7', margin: 0, wordBreak: 'break-word' }}>{msg.content}</p>
                                            </div>
                                        )}

                                        {msg.role !== 'system' && (
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
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
                                                    <div style={{ marginBottom: '0.5rem', padding: '0.35rem 0.6rem', borderRadius: '0.375rem', backgroundColor: msg.role === 'market' ? 'rgba(0, 242, 254, 0.05)' : 'rgba(167, 139, 250, 0.05)', borderLeft: `2px solid ${msg.role === 'market' ? 'rgba(0, 242, 254, 0.4)' : 'rgba(167, 139, 250, 0.4)'}`, overflowX: 'auto' }}>
                                                        {msg.searched_sites.map((site, sIdx) => (
                                                            <div key={sIdx} style={{ fontSize: '11px', color: 'rgba(199, 196, 215, 0.6)', lineHeight: '18px', fontFamily: '"Plus Jakarta Sans", monospace', display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}>
                                                                <span style={{ color: msg.role === 'market' ? '#00F2FE' : '#A78BFA', fontSize: '10px', flexShrink: 0 }}>⚡</span>
                                                                <span>{msg.role === 'market' ? 'Checked site:' : 'Checked tool:'} {site}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <p style={{ fontSize: '14px', lineHeight: 1.625, color: '#c7c4d7', margin: 0, wordBreak: 'break-word' }}>
                                                    {msg.content}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isThinking && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: activeSpeaker === 'finance' ? '#A78BFA' : '#00F2FE', fontSize: '13px', fontStyle: 'italic', padding: '6px 0', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span className="eq-bar" style={{ backgroundColor: activeSpeaker === 'finance' ? '#A78BFA' : '#00F2FE' }}></span>
                                            <span className="eq-bar" style={{ backgroundColor: activeSpeaker === 'finance' ? '#A78BFA' : '#00F2FE' }}></span>
                                        </div>
                                        <span>{activeSpeaker === 'market' ? 'tool calling......' : 'financial simulation & regulatory tool calling......'}</span>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Bottom Option Box (Appears when graph hits interrupt()) */}
                        {showOptionBox && (
                            <div className="warroom-option-box">
                                <div style={{ maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
                                    <div className="inner-glow" style={{ padding: '1.5rem', borderRadius: '0.75rem', backgroundColor: 'rgba(41, 41, 50, 0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(192, 193, 255, 0.3)' }}>
                                        <h3 style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '17px', lineHeight: '24px', fontWeight: 700, color: '#c0c1ff', margin: '0 0 1rem 0' }}>
                                            ⚡ Consensus Trade-off: Select Primary Strategy
                                        </h3>
                                        <div className="tradeoff-grid">
                                            
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
                                                <div key={opt.id || idx} className={`group ${opt.id === 'option_b' ? 'hover-border-tertiary' : 'hover-border-primary'} transition-all`} style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'rgba(52, 52, 61, 0.5)', border: '1px solid rgba(70, 69, 84, 0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '8px' }}>
                                                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#e4e1ed' }}>{opt.id === 'option_a' ? 'Option A' : 'Option B'}</span>
                                                            <span style={{ fontSize: '11px', color: opt.id === 'option_b' ? '#34D399' : '#c0c1ff', backgroundColor: opt.id === 'option_b' ? 'rgba(52,211,153,0.1)' : 'rgba(192,193,255,0.1)', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>{opt.tag || (opt.id === 'option_b' ? 'Recommended' : 'High Growth')}</span>
                                                        </div>
                                                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#e4e1ed', margin: '0 0 0.25rem 0' }}>{opt.title}</h4>
                                                        <p style={{ fontSize: '14px', lineHeight: '22px', color: '#c7c4d7', margin: '0 0 1rem 0' }}>{opt.description}</p>
                                                    </div>
                                                    <button onClick={() => handleSelectOption(opt.id || 'option_a')} className={opt.id === 'option_b' ? 'hover-btn-surface transition-all' : 'hover-btn-primary transition-all'} style={{ width: '100%', padding: '0.65rem 0', borderRadius: '0.375rem', backgroundColor: opt.id === 'option_b' ? '#34D399' : 'rgba(192, 193, 255, 0.15)', border: opt.id === 'option_b' ? 'none' : '1px solid rgba(192, 193, 255, 0.4)', color: opt.id === 'option_b' ? '#064E3B' : '#c0c1ff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
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
                <div className="proceed-btn-wrapper">
                    <button 
                        onClick={handleProceedBlueprint}
                        disabled={!consensusReached}
                        className="proceed-btn inner-glow" 
                        style={{
                            backgroundImage: consensusReached ? 'linear-gradient(to right, #34D399, #10B981)' : 'linear-gradient(to right, #34343d, #464554)',
                            color: consensusReached ? '#064E3B' : '#908fa0',
                            boxShadow: consensusReached ? '0 0 25px rgba(52, 211, 153, 0.4)' : 'none',
                            cursor: consensusReached ? 'pointer' : 'not-allowed',
                            opacity: consensusReached ? 1 : 0.6
                        }}
                    >
                        {consensusReached ? 'Proceed To Blueprint →' : 'Awaiting Debate Consensus...'}
                    </button>
                </div>
            </div>
        </>
    );
}
