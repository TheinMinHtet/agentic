'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Globe, 
    BarChart3, 
    Sparkles, 
    Play, 
    Pause, 
    RotateCcw, 
    CheckCircle2, 
    Zap, 
    ShieldAlert, 
    TrendingUp, 
    Activity,
    Cpu,
    Terminal,
    ArrowRightLeft,
    ChevronRight,
    Lock
} from 'lucide-react';

// Audio equalizers for speaking vs listening states
function WaveEqualizer({ color, isSpeaking }) {
    if (!isSpeaking) {
        return (
            <div className="flex items-center gap-[3px] h-[14px]">
                {[0, 1, 2, 3].map((i) => (
                    <span 
                        key={i} 
                        className="w-[2.5px] h-[3px] rounded-full opacity-30"
                        style={{ backgroundColor: color }} 
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-[3px] h-[16px]">
            {[0, 1, 2, 3, 4].map((i) => (
                <motion.span
                    key={i}
                    className="w-[2.5px] rounded-full"
                    style={{ backgroundColor: color }}
                    animate={{
                        height: ['3px', '16px', '5px', '14px', '3px'],
                    }}
                    transition={{
                        duration: 0.5 + i * 0.1,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.07
                    }}
                />
            ))}
        </div>
    );
}

export default function AgentDebateSection() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isTyping, setIsTyping] = useState(true);
    const [displayedText, setDisplayedText] = useState('');

    // 4-Phase Structured Multi-Agent Debate Protocol
    const debatePhases = [
        {
            id: 0,
            phaseNum: '01',
            title: 'Market Opportunity vs Speed',
            subtitle: 'TAM Analysis & Upfront CAC Allocation',
            activeSpeaker: 'market',
            marketAgent: {
                status: 'TRANSMITTING PROPOSAL',
                statusColor: '#00F2FE',
                message: "Our real-time market telemetry indicates a massive $4.2B TAM in autonomous AI workflows with 310% YoY growth velocity. Competitors are scaling rapidly. I propose an immediate $50K budget allocation toward viral B2B team-invite loops to capture dominant market share within Q3 before customer acquisition costs surge.",
                keyMetricLabel: 'Target Market Opportunity',
                keyMetricValue: '$4.2B TAM · 94/100 Opportunity Score'
            },
            financeAgent: {
                status: 'LISTENING & AUDITING',
                statusColor: '#64748B',
                message: "Awaiting complete Market Intelligence transmission. Initial risk check: monitoring CAC payback periods and runway sensitivity across paid channels...",
                keyMetricLabel: 'Current Baseline Runway',
                keyMetricValue: '18 Months · $32K Monthly Burn'
            },
            consensusScore: 38,
            consensusLabel: 'Initial Hypothesis · High Risk Exposure'
        },
        {
            id: 1,
            phaseNum: '02',
            title: 'Financial Stress-Test & Alert',
            subtitle: 'Runway Compression & Margin Thresholds',
            activeSpeaker: 'finance',
            marketAgent: {
                status: 'EVALUATING COUNTER-RISK',
                statusColor: '#64748B',
                message: "Analyzing Financial Modeling risk audit... Re-evaluating paid acquisition channels against projected unit economics and CAC thresholds.",
                keyMetricLabel: 'Proposed Budget Pool',
                keyMetricValue: '$50K Growth Allocation'
            },
            financeAgent: {
                status: 'TRANSMITTING STRESS-TEST ALERT',
                statusColor: '#A78BFA',
                message: "HIGH BURN RISK DETECTED! Uncontrolled $50K upfront CAC on broad channels compresses our runway below 13.5 months if gross margins dip under 75%. We cannot scale unvalidated funnels. We must enforce strict unit economics: payback within <6 months and target CAC under $15 before releasing primary capital.",
                keyMetricLabel: 'Risk Stress-Test Alert',
                keyMetricValue: 'Runway Drop: 13.5 Mo · Max CAC: $15'
            },
            consensusScore: 56,
            consensusLabel: 'Stress-Test Active · Re-aligning Metrics'
        },
        {
            id: 2,
            phaseNum: '03',
            title: 'Product-Led Growth Pivot',
            subtitle: 'Hybrid B2B Viral Loop Synthesis',
            activeSpeaker: 'market',
            marketAgent: {
                status: 'TRANSMITTING REVISED PIVOT',
                statusColor: '#00F2FE',
                message: "Agreed on unit economics protection. We pivot 85% of acquisition budget from paid channels directly into a product-led viral invite loop (Team Workspace Sharing). Our updated network-effect simulation reduces estimated CAC from $45 down to $12 while maintaining a 3.2x viral coefficient.",
                keyMetricLabel: 'Revised CAC Target',
                keyMetricValue: '$12 CAC · 3.2x Viral Coefficient'
            },
            financeAgent: {
                status: 'RUNNING MONTE CARLO SIMULATION',
                statusColor: '#A78BFA',
                message: "Ingesting $12 CAC parameters into 10,000 Monte Carlo simulations... Checking margin stability and 24-month survival probability across worst-case scenarios...",
                keyMetricLabel: 'Simulation Status',
                keyMetricValue: 'Running 10,000 Iterations...'
            },
            consensusScore: 82,
            consensusLabel: 'High Alignment · Verifying Economics'
        },
        {
            id: 3,
            phaseNum: '04',
            title: 'Protocol Consensus Locked',
            subtitle: 'Investor-Ready Blueprint Finalized',
            activeSpeaker: 'both',
            marketAgent: {
                status: 'CONSENSUS AGREEMENT LOCKED',
                statusColor: '#34D399',
                message: "Market strategy locked: Execute Product-Led Team Invite Engine with automated viral triggers. Dominant market capture initiated with zero paid ad waste.",
                keyMetricLabel: 'Growth Engine',
                keyMetricValue: 'Viral Team Invite Mechanics'
            },
            financeAgent: {
                status: 'CONSENSUS AGREEMENT LOCKED',
                statusColor: '#34D399',
                message: "Unit economics verified! Gross margin stabilizes at 82% with a robust 24.2-month runway under the $12 CAC hybrid model. Venture-ready efficiency threshold met.",
                keyMetricLabel: 'Verified Financial Model',
                keyMetricValue: '82% Gross Margin · 24.2 Mo Runway'
            },
            consensusScore: 98,
            consensusLabel: '100% Verified · Investor Blueprint Approved'
        }
    ];

    const currentPhase = debatePhases[currentStep];

    // Typewriter effect handling for the active speaker message
    useEffect(() => {
        let activeMsg = "";
        if (currentPhase.activeSpeaker === 'market') {
            activeMsg = currentPhase.marketAgent.message;
        } else if (currentPhase.activeSpeaker === 'finance') {
            activeMsg = currentPhase.financeAgent.message;
        } else {
            activeMsg = "CONSENSUS ACHIEVED: Both Market Intelligence and Financial Modeling agents have verified and locked the $12 CAC hybrid growth model.";
        }

        setIsTyping(true);
        setDisplayedText('');

        let index = 0;
        const timer = setInterval(() => {
            if (index <= activeMsg.length) {
                setDisplayedText(activeMsg.slice(0, index));
                index += 2; // Fast, responsive terminal speed
            } else {
                clearInterval(timer);
                setIsTyping(false);
            }
        }, 15);

        return () => clearInterval(timer);
    }, [currentStep]);

    // Auto-advance loop when playing
    useEffect(() => {
        if (!isPlaying || isTyping) return;

        const timer = setTimeout(() => {
            if (currentStep < debatePhases.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                setIsPlaying(false); // Pause when consensus is reached
            }
        }, 4000);

        return () => clearTimeout(timer);
    }, [isPlaying, isTyping, currentStep]);

    const handleReset = () => {
        setCurrentStep(0);
        setIsPlaying(true);
    };

    return (
        <section className="w-full max-w-[1380px] mx-auto my-[80px] px-4 relative z-10 font-sans">
            <style jsx>{`
                .debate-container {
                    background: #080B12;
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    border-radius: 28px;
                    box-shadow: 
                        0 30px 100px rgba(0, 0, 0, 0.85),
                        0 0 50px rgba(0, 242, 254, 0.05),
                        inset 0 1px 2px rgba(255, 255, 255, 0.16);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .terminal-header {
                    background: #0D121F;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
                    padding: 16px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .mac-dots {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .mac-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }

                .step-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 16px;
                    padding: 14px 18px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    text-align: left;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .step-card:hover {
                    background: rgba(255, 255, 255, 0.07);
                    border-color: rgba(255, 255, 255, 0.22);
                    transform: translateY(-2px);
                }

                .step-card.active-cyan {
                    background: rgba(0, 242, 254, 0.09);
                    border-color: rgba(0, 242, 254, 0.55);
                    box-shadow: 0 10px 30px rgba(0, 242, 254, 0.15);
                }

                .step-card.active-purple {
                    background: rgba(167, 139, 250, 0.09);
                    border-color: rgba(167, 139, 250, 0.55);
                    box-shadow: 0 10px 30px rgba(167, 139, 250, 0.15);
                }

                .step-card.active-green {
                    background: rgba(52, 211, 153, 0.09);
                    border-color: rgba(52, 211, 153, 0.55);
                    box-shadow: 0 10px 30px rgba(52, 211, 153, 0.15);
                }

                .agent-card-window {
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 20px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    transition: all 0.4s ease;
                }

                .agent-card-window.active-speaker-cyan {
                    background: rgba(15, 23, 42, 0.92);
                    border-color: rgba(0, 242, 254, 0.6);
                    box-shadow: 0 0 45px rgba(0, 242, 254, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.2);
                }

                .agent-card-window.active-speaker-purple {
                    background: rgba(15, 23, 42, 0.92);
                    border-color: rgba(167, 139, 250, 0.6);
                    box-shadow: 0 0 45px rgba(167, 139, 250, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.2);
                }

                .agent-card-window.active-speaker-green {
                    background: rgba(15, 23, 42, 0.92);
                    border-color: rgba(52, 211, 153, 0.6);
                    box-shadow: 0 0 45px rgba(52, 211, 153, 0.18), inset 0 1px 2px rgba(255, 255, 255, 0.2);
                }

                .terminal-bubble {
                    background: #0B0F19;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 20px;
                    margin-top: 16px;
                    min-height: 165px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
                }
            `}</style>

            {/* Section Header */}
            <div className="text-center max-w-[840px] mx-auto mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 text-[13px] font-bold uppercase tracking-wider mb-4 shadow-[0_0_20px_rgba(0,242,254,0.18)]">
                    <Zap size={15} />
                    <span>Cognitive Multi-Agent Collaboration Studio</span>
                </div>
                <h2 className="text-[38px] md:text-[46px] font-extrabold text-white leading-[1.12] tracking-tight m-0 mb-4 font-jakarta">
                    Real-Time Strategic <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] via-[#38BDF8] to-[#A78BFA]">Agent VS Agent</span> Debate
                </h2>
                <p className="text-[#94A3B8] text-[17px] leading-[1.65] m-0">
                    Inspired by state-of-the-art AI studios, watch specialized autonomous agents challenge assumptions, audit financial risks, and converge on high-confidence venture blueprints.
                </p>
            </div>

            {/* World-Class Cyber Terminal Container */}
            <div className="debate-container">
                {/* Terminal Window Header */}
                <div className="terminal-header">
                    <div className="flex items-center gap-4">
                        <div className="mac-dots">
                            <div className="mac-dot bg-[#FF5F56]" />
                            <div className="mac-dot bg-[#FFBD2E]" />
                            <div className="mac-dot bg-[#27C93F]" />
                        </div>
                        <div className="h-[18px] w-[1px] bg-white/15" />
                        <div className="flex items-center gap-2 text-[#CBD5E1] text-[13.5px] font-mono font-bold">
                            <Terminal size={16} className="text-[#00F2FE]" />
                            <span>WARROOM_ORCHESTRATOR // DEBATE_PROTOCOL_v2.6</span>
                        </div>
                    </div>

                    {/* Live Consensus Progress & Play Controls */}
                    <div className="flex items-center gap-5 flex-wrap">
                        <div className="flex items-center gap-3 bg-black/50 border border-white/10 px-4 py-1.5 rounded-full">
                            <Activity size={15} className="text-[#00F2FE] animate-pulse" />
                            <span className="text-[12.5px] font-semibold text-[#CBD5E1]">Protocol Alignment:</span>
                            <span className="text-[14px] font-mono font-extrabold text-[#00F2FE]">
                                {currentPhase.consensusScore}%
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-[13px] border border-white/20 transition-all cursor-pointer"
                            >
                                {isPlaying ? <Pause size={14} className="text-[#00F2FE]" /> : <Play size={14} className="text-[#00F2FE]" />}
                                <span>{isPlaying ? 'Pause Protocol' : 'Resume Protocol'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                title="Restart Debate Sequence"
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
                            >
                                <RotateCcw size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4 Interactive Phase Navigation Cards */}
                <div className="p-6 md:p-8 bg-[#0B0F19]/80 border-b border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {debatePhases.map((phase, idx) => {
                            const isActive = currentStep === idx;
                            let cardStyle = 'step-card';
                            if (isActive) {
                                if (idx === 0) cardStyle = 'step-card active-cyan';
                                else if (idx === 1) cardStyle = 'step-card active-purple';
                                else if (idx === 2) cardStyle = 'step-card active-cyan';
                                else cardStyle = 'step-card active-green';
                            }

                            return (
                                <div
                                    key={phase.id}
                                    onClick={() => {
                                        setCurrentStep(idx);
                                        setIsPlaying(false);
                                    }}
                                    className={cardStyle}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[12px] font-mono font-extrabold px-2.5 py-0.5 rounded bg-white/10 text-[#00F2FE]">
                                            PHASE {phase.phaseNum}
                                        </span>
                                        {isActive && (
                                            <span className="flex h-2 w-2 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-[15px] font-bold text-white m-0 font-jakarta mt-1">
                                        {phase.title}
                                    </h4>
                                    <span className="text-[12.5px] text-[#94A3B8] m-0 line-clamp-1">
                                        {phase.subtitle}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Side-By-Side Dual Agent Arena Window */}
                <div className="p-6 md:p-8 bg-[#080B12]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                        
                        {/* LEFT COLUMN: AGENT 01 (MARKET INTELLIGENCE) */}
                        <div className={`agent-card-window ${
                            currentPhase.activeSpeaker === 'market' 
                                ? 'active-speaker-cyan' 
                                : currentPhase.activeSpeaker === 'both' 
                                    ? 'active-speaker-green' 
                                    : ''
                        }`}>
                            <div>
                                {/* Agent Header Badge */}
                                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-[#00F2FE]/15 border-2 border-[#00F2FE] flex items-center justify-center text-[#00F2FE] shadow-[0_0_20px_rgba(0,242,254,0.3)] shrink-0">
                                            <Globe size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px] font-mono font-bold text-[#00F2FE] uppercase tracking-wider">
                                                    AGENT 01
                                                </span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE]" />
                                                <span className="text-[13px] font-semibold text-[#CBD5E1]">
                                                    Growth & Opportunity Engine
                                                </span>
                                            </div>
                                            <h3 className="text-[18px] font-extrabold text-white m-0 mt-0.5 font-jakarta">
                                                Market Intelligence
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Waveform Equalizer */}
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                                            {currentPhase.marketAgent.status}
                                        </span>
                                        <WaveEqualizer 
                                            color="#00F2FE" 
                                            isSpeaking={currentPhase.activeSpeaker === 'market' || currentPhase.activeSpeaker === 'both'} 
                                        />
                                    </div>
                                </div>

                                {/* Terminal Message Box */}
                                <div className="terminal-bubble" style={{
                                    borderColor: (currentPhase.activeSpeaker === 'market' || currentPhase.activeSpeaker === 'both') ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 255, 255, 0.08)'
                                }}>
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[12px] font-mono text-[#64748B]">
                                        <span>SYSTEM_STREAM: // market_agent_out.log</span>
                                        <span>LATENCY: 14ms</span>
                                    </div>

                                    <div className="text-[#E2E8F0] text-[16px] leading-[1.75] font-sans my-auto py-2">
                                        {(currentPhase.activeSpeaker === 'market' || currentPhase.activeSpeaker === 'both') ? (
                                            <>
                                                <span>{displayedText}</span>
                                                {isTyping && (
                                                    <span className="inline-block w-2 h-4 bg-[#00F2FE] ml-1 animate-pulse align-middle" />
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-[#94A3B8] italic">
                                                {currentPhase.marketAgent.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[12.5px] font-semibold text-[#94A3B8]">
                                            {currentPhase.marketAgent.keyMetricLabel}
                                        </span>
                                        <span className="text-[13.5px] font-mono font-bold text-[#00F2FE] bg-[#00F2FE]/10 px-3 py-1 rounded-full border border-[#00F2FE]/30">
                                            {currentPhase.marketAgent.keyMetricValue}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: AGENT 04 (FINANCIAL MODELING) */}
                        <div className={`agent-card-window ${
                            currentPhase.activeSpeaker === 'finance' 
                                ? 'active-speaker-purple' 
                                : currentPhase.activeSpeaker === 'both' 
                                    ? 'active-speaker-green' 
                                    : ''
                        }`}>
                            <div>
                                {/* Agent Header Badge */}
                                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-[#A78BFA]/15 border-2 border-[#A78BFA] flex items-center justify-center text-[#A78BFA] shadow-[0_0_20px_rgba(167,139,250,0.3)] shrink-0">
                                            <BarChart3 size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px] font-mono font-bold text-[#A78BFA] uppercase tracking-wider">
                                                    AGENT 04
                                                </span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
                                                <span className="text-[13px] font-semibold text-[#CBD5E1]">
                                                    Unit Economics Controller
                                                </span>
                                            </div>
                                            <h3 className="text-[18px] font-extrabold text-white m-0 mt-0.5 font-jakarta">
                                                Financial Modeling
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Waveform Equalizer */}
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                                            {currentPhase.financeAgent.status}
                                        </span>
                                        <WaveEqualizer 
                                            color="#A78BFA" 
                                            isSpeaking={currentPhase.activeSpeaker === 'finance' || currentPhase.activeSpeaker === 'both'} 
                                        />
                                    </div>
                                </div>

                                {/* Terminal Message Box */}
                                <div className="terminal-bubble" style={{
                                    borderColor: (currentPhase.activeSpeaker === 'finance' || currentPhase.activeSpeaker === 'both') ? 'rgba(167, 139, 250, 0.4)' : 'rgba(255, 255, 255, 0.08)'
                                }}>
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[12px] font-mono text-[#64748B]">
                                        <span>SYSTEM_STREAM: // finance_agent_audit.log</span>
                                        <span>LATENCY: 11ms</span>
                                    </div>

                                    <div className="text-[#E2E8F0] text-[16px] leading-[1.75] font-sans my-auto py-2">
                                        {(currentPhase.activeSpeaker === 'finance') ? (
                                            <>
                                                <span>{displayedText}</span>
                                                {isTyping && (
                                                    <span className="inline-block w-2 h-4 bg-[#A78BFA] ml-1 animate-pulse align-middle" />
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-[#94A3B8] italic">
                                                {currentPhase.financeAgent.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[12.5px] font-semibold text-[#94A3B8]">
                                            {currentPhase.financeAgent.keyMetricLabel}
                                        </span>
                                        <span className="text-[13.5px] font-mono font-bold text-[#A78BFA] bg-[#A78BFA]/10 px-3 py-1 rounded-full border border-[#A78BFA]/30">
                                            {currentPhase.financeAgent.keyMetricValue}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Protocol Resolution Bar */}
                    <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-cyan-400">
                                <Lock size={18} />
                            </div>
                            <div>
                                <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#94A3B8] block">
                                    Current Consensus Stage
                                </span>
                                <span className="text-[15px] font-bold text-white block">
                                    {currentPhase.consensusLabel}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {currentStep < debatePhases.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCurrentStep(prev => prev + 1);
                                        setIsPlaying(false);
                                    }}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#00F2FE] to-[#38BDF8] text-black font-extrabold text-[14px] hover:shadow-[0_0_25px_rgba(0,242,254,0.4)] transition-all cursor-pointer"
                                >
                                    <span>Advance To Next Phase ({debatePhases[currentStep + 1].phaseNum})</span>
                                    <ChevronRight size={18} />
                                </button>
                            ) : (
                                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#34D399] text-black font-extrabold text-[14.5px] shadow-[0_0_30px_rgba(52,211,153,0.4)]">
                                    <CheckCircle2 size={18} className="stroke-[2.5]" />
                                    <span>Orchestrator Protocol Locked & Investor-Ready</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
