'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflow } from '../context/WorkflowContext';
import { useLanguage } from '../context/LanguageContext';

export default function SpecializedAgentsPage() {
    const router = useRouter();
    const {
        agentProgress,
        agentThinking,
        runParallelSpecializedPlanning,
        setActiveStep
    } = useWorkflow();
    const { language, t } = useLanguage();

    const [error, setError] = useState(null);

    // Trigger parallel multi-agent runner on mount
    useEffect(() => {
        let isCurrent = true;

        async function execute() {
            try {
                const success = await runParallelSpecializedPlanning();
                if (success && isCurrent) {
                    setActiveStep('dashboard');
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 2000);
                } else if (isCurrent) {
                    setError("Specialized orchestration failed. Please verify your Google API Key and try again.");
                }
            } catch (err) {
                console.error(err);
                if (isCurrent) {
                    setError(err.message || "An unexpected error occurred during specialized planning.");
                }
            }
        }

        execute();

        return () => {
            isCurrent = false;
        };
    }, []);

    // Get color for progress statuses
    const getStatusStyles = (status) => {
        switch (status) {
            case 'completed':
                return { label: language === 'en' ? 'COMPLETED' : 'ပြီးစီးသည်', bg: 'rgba(174, 236, 29, 0.15)', color: '#3d6b00' };
            case 'running':
                return { label: language === 'en' ? 'RUNNING' : 'လုပ်ဆောင်နေသည်', bg: 'rgba(56, 189, 248, 0.15)', color: '#0369a1' };
            case 'failed':
                return { label: language === 'en' ? 'FAILED' : 'မအောင်မြင်ပါ', bg: 'rgba(239, 68, 68, 0.15)', color: '#b91c1c' };
            default:
                return { label: language === 'en' ? 'PENDING' : 'စောင့်ဆိုင်းဆဲ', bg: 'var(--color-surface-light)', color: 'var(--color-text-muted)' };
        }
    };

    const agentsList = [
        { key: 'finance', title: language === 'en' ? 'Finance Agent' : 'ဘဏ္ဍာရေး အေဂျင့်', desc: language === 'en' ? 'Sizing capital requirements, operational margins & revenue tiers.' : 'ကနဦးကုန်ကျစရိတ်များ၊ လည်ပတ်မှုစရိတ်များနှင့် ဝင်ငွေပုံစံများကို တွက်ချက်ခြင်း။' },
        { key: 'brand', title: language === 'en' ? 'Brand Agent' : 'အမှတ်တံဆိပ် အေဂျင့်', desc: language === 'en' ? 'Crafting guidelines, taglines, suggested names & visual palette.' : 'အမှတ်တံဆိပ် အမည်များ၊ ဆောင်ပုဒ်များ၊ လိုဂိုနှင့် အရောင်အသွေးများကို ဖန်တီးခြင်း။' },
        { key: 'website', title: language === 'en' ? 'Website Agent' : 'ဝဘ်ဆိုက် အေဂျင့်', desc: language === 'en' ? 'Defining wireframe sections, product capabilities & tech stacks.' : 'ဝဘ်ဆိုက်ပုံစံ (Wireframe Layout)၊ လုပ်ဆောင်ချက်များနှင့် နည်းပညာစနစ်များကို သတ်မှတ်ခြင်း။' },
        { key: 'marketing', title: language === 'en' ? 'Marketing Agent' : 'စျေးကွက် အေဂျင့်', desc: language === 'en' ? 'Formulating acquisition strategies and 90-day launch roadmap.' : 'သုံးစွဲသူရရှိမည့် စျေးကွက်ဗျူဟာများနှင့် ရက်ပေါင်း ၉၀ စီမံကိန်းကို ဖန်တီးခြင်း။' }
    ];

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
                    
                    {/* Top App Bar equivalent */}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button className="hover-text-primary transition-all" style={{ color: '#c7c4d7', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                <span className="material-symbols-outlined">notifications</span>
                            </button>
                            <button className="hover-text-primary transition-all" style={{ color: '#c7c4d7', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                <span className="material-symbols-outlined">share</span>
                            </button>
                            <button className="hover-bg-surface-variant transition-colors" style={{
                                padding: '0.375rem 0.75rem',
                                borderRadius: '0.375rem',
                                border: '1px solid rgba(70, 69, 84, 0.3)',
                                color: '#c7c4d7',
                                fontFamily: '"Inter", sans-serif',
                                fontSize: '11px',
                                lineHeight: '16px',
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
                                backgroundImage: 'linear-gradient(to right, #8083ff, #c0c1ff)',
                                color: '#1000a9',
                                fontFamily: '"Inter", sans-serif',
                                fontSize: '11px',
                                lineHeight: '16px',
                                fontWeight: 600,
                                letterSpacing: '0.05em',
                                border: 'none',
                                cursor: 'pointer'
                            }}>
                                Execute Consensus
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', height: '180px' }}>
                            
                            {/* Speaking Agent */}
                            <div className="glowing-border" style={{ backgroundColor: '#0D121F', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'radial-gradient(ellipse at center, rgba(0,242,254,0.1), transparent)', opacity: 0.5 }}></div>
                                <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', overflow: 'hidden', border: '2px solid #00F2FE', marginBottom: '0.75rem', position: 'relative', zIndex: 10 }}>
                                    <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk_nY__9icBAQdCckdv-oT8bt1Qqv7zjOhmRRy9H17lRJqkqUkkXpQz3SY5jiXdzPIuWWfDEluOhaAnIXjhs8xCHn-52YCkoetuRPyb_n9rea-yKIgT6-rAHXgf4qmGjLqPLqICCaGawznEiRYdcpLRhwKxiz6z5ke2okDYujePzakZSpsjtH0FG2k5zHAR0IsMfWiKwkwA_Xwq0w7AEu0HRgRuVBcW96m1y-W-t3OfjKL5Lsjhs1EcYfVzUER0BQUdLOyyOmdO2eQ" alt="Market Analyst" />
                                </div>
                                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', lineHeight: '18px', fontWeight: 500, letterSpacing: '0.01em', color: '#e4e1ed', zIndex: 10 }}>Market Intel</span>
                                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', height: '0.75rem', alignItems: 'center', zIndex: 10 }}>
                                    <span className="eq-bar"></span><span className="eq-bar"></span><span className="eq-bar"></span>
                                </div>
                                <span style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(0,242,254,0.1)', color: '#00F2FE', fontFamily: '"Inter", sans-serif', fontSize: '11px', lineHeight: '16px', fontWeight: 600, letterSpacing: '0.05em', border: '1px solid rgba(0,242,254,0.2)' }}>Speaking</span>
                            </div>

                            {/* Listening Agent 1 */}
                            <div className="inner-glow hover-opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(13, 18, 31, 0.65)', backdropFilter: 'blur(8px)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: 0.7 }}>
                                <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(70, 69, 84, 0.5)', marginBottom: '0.75rem', filter: 'grayscale(100%)', opacity: 0.8 }}>
                                    <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuC830cscOQ6SMzY0DcqTOUadOxo30_r16zgHrMwHtxYfBvsSvoqnAeb32dxLih3wgAzZskQ2b9p1eKK8GExSK8z8hf--blojps8tYDkJ2OSy7mtt1aaBjdiFLGiciznQAN3aDK4FoWcI0rf8oD4_7xWBWD0aTsS-plesZ4sAAQZoY2ugC-yVtrc0AB7W8Ml3YGPg92qZrgKOhvdJ-bNgrn6Kk7HF2whPYDziK2w3i9KUwuS2rNJNoWmxVKRaDl2h1AiBkl0gRTUl7pw" alt="Tech Architect" />
                                </div>
                                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', lineHeight: '18px', fontWeight: 500, letterSpacing: '0.01em', color: '#e4e1ed' }}>Tech Architect</span>
                                <span style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: '#34343d', color: '#c7c4d7', fontFamily: '"Inter", sans-serif', fontSize: '11px', lineHeight: '16px', fontWeight: 600, letterSpacing: '0.05em' }}>Listening</span>
                            </div>

                            {/* Listening Agent 2 */}
                            <div className="inner-glow hover-opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(13, 18, 31, 0.65)', backdropFilter: 'blur(8px)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: 0.7 }}>
                                <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(70, 69, 84, 0.5)', marginBottom: '0.75rem', filter: 'grayscale(100%)', opacity: 0.8 }}>
                                    <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFO64gtrrWtDLHCVxAyPgFmeMG9lLEQ2WXVs6JBGCwVoOtLOQvXxn7Ju6b0qikcKI8B0vnmfWUU1F_PNibAOOHdKJ6PNJcUcg5VS8JkmXlS-hr2rhnXr9Jtuopd8ZvUlaexBVgzHETV9sVnwKsnnrl_0CtmradHJJkxgwiUphuAqXiZWi5zxi-WsEm6ypswGqC4n9HoVc5d7fYmVQeY0K3_nM7BtFQDUUw0apMQDgyBJKtZKVbdAF-iBEKfhcZ1qsHrGnVjW5JzzOP" alt="Brand Identity" />
                                </div>
                                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', lineHeight: '18px', fontWeight: 500, letterSpacing: '0.01em', color: '#e4e1ed' }}>Brand Identity</span>
                                <span style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: '#34343d', color: '#c7c4d7', fontFamily: '"Inter", sans-serif', fontSize: '11px', lineHeight: '16px', fontWeight: 600, letterSpacing: '0.05em' }}>Listening</span>
                            </div>

                            {/* Listening Agent 3 */}
                            <div className="inner-glow hover-opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(13, 18, 31, 0.65)', backdropFilter: 'blur(8px)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: 0.7 }}>
                                <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(70, 69, 84, 0.5)', marginBottom: '0.75rem', filter: 'grayscale(100%)', opacity: 0.8 }}>
                                    <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuDleIs6dhFNwep_DS-eAp0VeOM219djpie7YBn9MNh3fv6oCiejB0uHLwTgVR4z6qP61vazNDi6WzP_KSRtiC5YyKUPhGN9YaazalhDMYTqS28hyW5pZwBcJR-D8zNoJduWsVNE--GaWsfgXBfrsSCHMiEWOCzbJBExK7axT6UL9gnocPUykV_mp985oY6h8YhN9DV-5seVsmCUeTko6t17fZiVzfjPRrIuaE5Ix4KoHH1YPj_Iy7Gqj-ZKjmvgYh6lm0bPAmwFHg4z" alt="Financial Modeler" />
                                </div>
                                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', lineHeight: '18px', fontWeight: 500, letterSpacing: '0.01em', color: '#e4e1ed' }}>Financial Modeler</span>
                                <span style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(255,183,131,0.1)', color: '#ffb783', fontFamily: '"Inter", sans-serif', fontSize: '11px', lineHeight: '16px', fontWeight: 600, letterSpacing: '0.05em', border: '1px solid rgba(255,183,131,0.2)' }}>Auditing</span>
                            </div>
                        </div>
                    </div>

                    {/* Chat Stream */}
                    <div style={{ flex: 1, minHeight: '520px', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(8, 11, 17, 0.95)', margin: '0 24px 24px 24px', borderRadius: '0.75rem', backdropFilter: 'blur(4px)', border: '1px solid rgba(70, 69, 84, 0.3)', overflow: 'hidden' }}>
                        
                        {/* Upper Scrollable Message Stream */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
                                
                                {/* System Message */}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {/* <div style={{ width: '2rem', height: '2rem', borderRadius: '0.375rem', backgroundColor: '#34343d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.25rem' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#c7c4d7' }}>terminal</span>
                                    </div> */}
                                    <div style={{ flex: 1, borderLeft: '2px solid #8083ff', paddingLeft: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', lineHeight: '18px', fontWeight: 700, letterSpacing: '0.01em', color: '#e4e1ed' }}>System</span>
                                            <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '11px', lineHeight: '16px', fontWeight: 600, letterSpacing: '0.05em', color: '#908fa0' }}>10:42 AM</span>
                                        </div>
                                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '14px', lineHeight: '22px', fontWeight: 400, color: '#c7c4d7', margin: 0 }}>WarRoom initialized. Topic: Q3 Expansion Strategy. 4 Agents active.</p>
                                    </div>
                                </div>

                                {/* Agent Message */}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.375rem', overflow: 'hidden', flexShrink: 0, marginTop: '0.25rem', border: '1px solid rgba(192, 193, 255, 0.3)' }}>
                                        <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtiiI0LxsiTgU7qMKI82JNFcPq3gUvBMnF4lQIFylL4No0KOIRWMRvYTr1j7UwTmDfN1vS0P5oAeFGFiGkW9jU4VBJu9ATraF97wj_kVzKYuM5DWXn8CKO9G4_O1ZL5L7jS4Rfqe96LcAi74kS8oaXn6jEKC8xNLxEBh2bQKTH-LzgAgSpQkb1WDc5GZ5BZ3BaFIYTP0av9KDk4rZiWQSl-_cXz9SHPs2kqDijG9gVQ0G6qs_yz6I38ML8xW-zC5YJ44a_gRfI_FAC" alt="Market Intel" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', lineHeight: '18px', fontWeight: 700, letterSpacing: '0.01em', color: '#e4e1ed' }}>Market Intel</span>
                                            <span style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(0,242,254,0.1)', color: '#00F2FE', fontFamily: '"Inter", sans-serif', fontSize: '11px', lineHeight: '16px', fontWeight: 600, letterSpacing: '0.05em', border: '1px solid rgba(0,242,254,0.2)' }}>Active Analysis</span>
                                            <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '11px', lineHeight: '16px', fontWeight: 600, letterSpacing: '0.05em', color: '#908fa0' }}>10:43 AM</span>
                                        </div>
                                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '14px', lineHeight: 1.625, fontWeight: 400, color: '#c7c4d7', margin: 0 }}>
                                            Based on initial scans, the Target Addressable Market (TAM) in the APAC region has expanded to roughly <span style={{ color: '#e4e1ed', fontFamily: 'monospace' }}>$4.2B</span>. However, to penetrate effectively, we need to ensure our Customer Acquisition Cost (CAC) model holds up.
                                        </p>
                                    </div>
                                </div>

                                {/* Agent Message 2 */}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.375rem', overflow: 'hidden', flexShrink: 0, marginTop: '0.25rem', border: '1px solid rgba(255, 183, 131, 0.3)' }}>
                                        <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4snu6T4IDE8PaaYhSoUnUxcRZ8BSkHdlSMpQNYhvH_L_CkywJZCrB7sDa45oZtV4WKCl0Xh8Q9PIQFpIHoursJrwaX8c8ihdkPMLuQVjB4D3yA1dipfFIRxKT-5ztvX1TMA4HR3SEJtnky7zAjhaSrI0IR41KUWVZceOZlRdle7Fov-d1Oz75tKzDead1E7gJrPks6F69Yb0O_ADeNlYLU7yo1yAKcET-Iy0fURzsLFxBWrGmx-2HPoyLj3z9oUr6TB2FKspfreBM" alt="Financial Modeler" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', lineHeight: '18px', fontWeight: 700, letterSpacing: '0.01em', color: '#e4e1ed' }}>Financial Modeler</span>
                                            <span style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(255,183,131,0.1)', color: '#ffb783', fontFamily: '"Inter", sans-serif', fontSize: '11px', lineHeight: '16px', fontWeight: 600, letterSpacing: '0.05em', border: '1px solid rgba(255,183,131,0.2)' }}>Auditor</span>
                                            <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '11px', lineHeight: '16px', fontWeight: 600, letterSpacing: '0.05em', color: '#908fa0' }}>10:44 AM</span>
                                        </div>
                                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '14px', lineHeight: 1.625, fontWeight: 400, color: '#c7c4d7', margin: 0 }}>
                                            I am running Monte Carlo simulations on the proposed ad spend. Maintaining a CAC of <span style={{ color: '#e4e1ed', fontFamily: 'monospace' }}>$12</span> is aggressive but achievable if we optimize funnel conversion by 15%. This preserves our Gross Margin target of <span style={{ color: '#c0c1ff', fontFamily: 'monospace' }}>82%</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Fixed Option Box */}
                        <div style={{ flexShrink: 0, padding: '0 24px 24px 24px', borderTop: '1px solid rgba(70, 69, 84, 0.2)', paddingTop: '1.5rem', backgroundColor: 'rgba(8, 11, 17, 0.4)' }}>
                            <div style={{ maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
                                {/* Consensus Block */}
                                <div className="inner-glow" style={{ padding: '1.5rem', borderRadius: '0.75rem', backgroundColor: 'rgba(41, 41, 50, 0.5)', backdropFilter: 'blur(4px)', border: '1px solid rgba(192, 193, 255, 0.2)' }}>
                                    <h3 style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '18px', lineHeight: '24px', fontWeight: 600, color: '#c0c1ff', margin: '0 0 1rem 0' }}>Consensus Reached: Select Primary Strategy</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                                        
                                        {/* Option A */}
                                        <div className="group hover-border-primary transition-all" style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'rgba(52, 52, 61, 0.4)', border: '1px solid rgba(70, 69, 84, 0.3)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', lineHeight: '18px', fontWeight: 700, letterSpacing: '0.01em', color: '#e4e1ed' }}>Option A</span>
                                                <span className="material-symbols-outlined group-hover-opacity-100 transition-opacity" style={{ color: '#c0c1ff', opacity: 0 }}>rocket_launch</span>
                                            </div>
                                            <h4 style={{ fontFamily: '"Inter", sans-serif', fontSize: '16px', lineHeight: '26px', fontWeight: 700, color: '#e4e1ed', margin: '0 0 0.25rem 0' }}>Aggressive Expansion (APAC Focus)</h4>
                                            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '14px', lineHeight: '22px', fontWeight: 400, color: '#c7c4d7', margin: '0 0 1rem 0' }}>Prioritizes market share with a $12 CAC target and 15% funnel optimization.</p>
                                            <button className="hover-btn-primary transition-all" style={{ width: '100%', padding: '0.5rem 0', borderRadius: '0.375rem', backgroundColor: 'rgba(192, 193, 255, 0.1)', border: '1px solid rgba(192, 193, 255, 0.3)', color: '#c0c1ff', fontFamily: '"Inter", sans-serif', fontSize: '11px', lineHeight: '16px', fontWeight: 600, letterSpacing: '0.05em', cursor: 'pointer' }}>
                                                Select This Option
                                            </button>
                                        </div>

                                        {/* Option B */}
                                        <div className="group hover-border-tertiary transition-all" style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'rgba(52, 52, 61, 0.4)', border: '1px solid rgba(70, 69, 84, 0.3)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', lineHeight: '18px', fontWeight: 700, letterSpacing: '0.01em', color: '#e4e1ed' }}>Option B</span>
                                                <span className="material-symbols-outlined group-hover-opacity-100 transition-opacity" style={{ color: '#ffb783', opacity: 0 }}>shield</span>
                                            </div>
                                            <h4 style={{ fontFamily: '"Inter", sans-serif', fontSize: '16px', lineHeight: '26px', fontWeight: 700, color: '#e4e1ed', margin: '0 0 0.25rem 0' }}>Conservative Growth (Margin Preservation)</h4>
                                            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '14px', lineHeight: '22px', fontWeight: 400, color: '#c7c4d7', margin: '0 0 1rem 0' }}>Focuses on risk mitigation and maintaining 85%+ gross margins via organic growth.</p>
                                            <button className="hover-btn-surface transition-all" style={{ width: '100%', padding: '0.5rem 0', borderRadius: '0.375rem', backgroundColor: '#34343d', border: '1px solid rgba(70, 69, 84, 0.3)', color: '#c7c4d7', fontFamily: '"Inter", sans-serif', fontSize: '11px', lineHeight: '16px', fontWeight: 600, letterSpacing: '0.05em', cursor: 'pointer' }}>
                                                Select This Option
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </main>

                {/* Proceed Blueprint Button outside below main tag */}
                <div style={{ width: '100%', maxWidth: '1100px', flexShrink: 0 }}>
                    <button onClick={() => { setActiveStep('dashboard'); router.push('/dashboard'); }} className="inner-glow hover-opacity-90 transition-all" style={{
                        width: '100%',
                        padding: '1rem 0',
                        borderRadius: '0.75rem',
                        backgroundImage: 'linear-gradient(to right, #8083ff, #c0c1ff)',
                        color: '#1000a9',
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        fontSize: '18px',
                        lineHeight: '24px',
                        fontWeight: 600,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        border: 'none',
                        cursor: 'pointer'
                    }}>
                        Proceed Blueprint
                    </button>
                </div>
            </div>
        </>
    );
}
