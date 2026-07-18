'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Play } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import WarRoomNodeGraph from './components/WarRoomNodeGraph';

export default function LandingPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { language, t } = useLanguage();

    const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
    const [isSimulating, setIsSimulating] = useState(false);
    const containerRef = useRef(null);

    // ── Typing animation state ──
    const typingPhrases = language === 'en'
        ? ['WarRoom', 'Blueprint Studio', 'Growth Engine']
        : ['လုပ်ငန်းစီမံချက်', 'စီးပွားရေးဗျူဟာ', 'တိုးတက်မှုအင်ဂျင်'];
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [typedText, setTypedText] = useState('');

    useEffect(() => {
        const currentPhrase = typingPhrases[phraseIndex];

        const speed = isDeleting ? 40 : 70;
        const pauseAtEnd = 2200;
        const pauseAtStart = 400;

        const timer = setTimeout(() => {
            if (!isDeleting) {
                setTypedText(currentPhrase.slice(0, charIndex + 1));
                setCharIndex(prev => prev + 1);

                if (charIndex + 1 === currentPhrase.length) {
                    setTimeout(() => setIsDeleting(true), pauseAtEnd);
                }
            } else {
                setTypedText(currentPhrase.slice(0, charIndex - 1));
                setCharIndex(prev => prev - 1);

                if (charIndex - 1 === 0) {
                    setIsDeleting(false);
                    setTimeout(() => {
                        setPhraseIndex(prev => (prev + 1) % typingPhrases.length);
                    }, pauseAtStart);
                }
            }
        }, speed);

        return () => clearTimeout(timer);
    }, [charIndex, isDeleting, phraseIndex]);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleSimulateClick = () => {
        if (isSimulating) {
            router.push(isAuthenticated ? '/onboarding' : '/login');
            return;
        }
        setIsSimulating(true);
        setTimeout(() => {
            router.push(isAuthenticated ? '/onboarding' : '/login');
        }, 2200);
    };

    return (
        <div
            className="landing-dark-theme-wrapper"
            ref={containerRef}
            onMouseMove={handleMouseMove}
        >
            {/* Mouse Tracking Neon Spotlight */}
            <div
                className="landing-spotlight"
                style={{
                    background: `radial-gradient(680px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 242, 254, 0.15), rgba(99, 102, 241, 0.08) 35%, transparent 75%)`
                }}
            />

            <style jsx>{`
                .landing-spotlight {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 1;
                    transition: background 0.12s ease-out;
                }

                .landing-dark-theme-wrapper {
                    min-height: 100vh;
                    background-color: #080B11;
                    background-image: 
                        radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.18) 0%, rgba(8, 11, 17, 0) 70%),
                        radial-gradient(circle at 85% 30%, rgba(0, 242, 254, 0.08) 0%, rgba(8, 11, 17, 0) 50%),
                        linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
                    background-size: 100% 100%, 100% 100%, 22px 22px, 22px 22px;
                    color: #F8FAFC;
                    font-family: var(--font-inter, 'Inter', system-ui, -apple-system, sans-serif);
                    padding: 100px 24px 60px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    position: relative;
                    overflow: hidden;
                }

                .landing-hero-container {
                    max-width: 1380px;
                    width: 100%;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    position: relative;
                    z-index: 10;
                }

                .landing-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 7px 18px;
                    background: rgba(99, 102, 241, 0.12);
                    border: 1px solid rgba(129, 140, 248, 0.35);
                    border-radius: 999px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #E0E7FF;
                    margin-bottom: 24px;
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.18);
                    letter-spacing: 0.02em;
                }

                .landing-title {
                    font-family: var(--font-jakarta, 'Plus Jakarta Sans', system-ui, sans-serif);
                    font-size: 54px;
                    font-weight: 800;
                    letter-spacing: -0.035em;
                    line-height: 1.12;
                    margin: 0 0 18px 0;
                    color: #FFFFFF;
                }

                .title-gradient-highlight {
                    background: linear-gradient(135deg, #FFFFFF 20%, #A78BFA 60%, #00F2FE 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .typing-cursor {
                    display: inline-block;
                    width: 3px;
                    height: 0.85em;
                    background: #A78BFA;
                    margin-left: 4px;
                    border-radius: 2px;
                    vertical-align: baseline;
                    animation: cursor-blink 0.7s step-end infinite;
                    box-shadow: 0 0 8px rgba(167, 139, 250, 0.6);
                }

                @keyframes cursor-blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }

                .landing-copy {
                    font-size: 18px;
                    color: #94A3B8;
                    max-width: 620px;
                    line-height: 1.6;
                    margin: 0 auto 36px auto;
                    font-weight: 400;
                }

                .cta-buttons-group {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 56px;
                }

                .warroom-primary-cta {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    background: #0D121C;
                    color: #FFFFFF;
                    font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
                    font-size: 16.5px;
                    font-weight: 700;
                    padding: 16px 38px;
                    border-radius: 999px;
                    border: 1.5px solid rgba(0, 242, 254, 0.5);
                    box-shadow: 
                        0 12px 30px rgba(0, 0, 0, 0.8),
                        0 0 25px rgba(0, 242, 254, 0.25),
                        inset 0 1px 1px rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .warroom-primary-cta:hover {
                    background: #131B2A;
                    border-color: #00F2FE;
                    box-shadow: 
                        0 20px 45px rgba(0, 0, 0, 0.9),
                        0 0 40px rgba(0, 242, 254, 0.45),
                        inset 0 1px 2px rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px) scale(1.02);
                }

                .warroom-primary-cta:active {
                    transform: translateY(0) scale(0.98);
                }

                .warroom-secondary-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #94A3B8;
                    font-size: 15px;
                    font-weight: 500;
                    padding: 14px 22px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    cursor: pointer;
                    transition: all 0.25s ease;
                }

                .warroom-secondary-link:hover {
                    color: #F8FAFC;
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.18);
                }

                .landing-split-section {
                    display: grid;
                    grid-template-columns: minmax(0, 1.22fr) minmax(0, 0.9fr);
                    gap: 48px;
                    width: 100%;
                    align-items: flex-start;
                    margin-top: 10px;
                    text-align: left;
                }

                .split-left-panel {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .split-right-panel {
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    max-height: 540px;
                    padding: 8px 12px 16px 20px;
                }

                .pi-style-heading {
                    font-family: var(--font-caveat, 'Comic Sans MS', 'Comic Sans', 'Chalkboard SE', 'Marker Felt', cursive, serif);
                    font-style: italic;
                    font-size: 46px;
                    font-weight: 700;
                    color: #FFFFFF;
                    line-height: 1.15;
                    margin: 0 0 20px 0;
                    letter-spacing: -0.01em;
                    flex-shrink: 0;
                }

                .pi-style-paragraphs {
                    display: flex;
                    flex-direction: column;
                    gap: 22px;
                    overflow-y: auto;
                    max-height: 440px;
                    padding-right: 18px;
                }

                .pi-style-paragraphs::-webkit-scrollbar {
                    width: 6px;
                }

                .pi-style-paragraphs::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.04);
                    border-radius: 999px;
                }

                .pi-style-paragraphs::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.22);
                    border-radius: 999px;
                }

                .pi-style-paragraphs::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 242, 254, 0.55);
                }

                .pi-style-paragraphs p {
                    font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
                    font-size: 17.5px;
                    line-height: 1.75;
                    color: #CBD5E1;
                    margin: 0;
                    font-weight: 400;
                }

                @media (max-width: 1024px) {
                    .landing-split-section {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }
                    .split-right-panel {
                        padding: 0 12px;
                        max-height: 480px;
                    }
                    .pi-style-heading {
                        font-size: 38px;
                    }
                }

                @media (max-width: 768px) {
                    .landing-title {
                        font-size: 36px;
                    }
                    .landing-copy {
                        font-size: 16px;
                        padding: 0 12px;
                    }
                    .cta-buttons-group {
                        flex-direction: column;
                        width: 100%;
                        max-width: 320px;
                    }
                    .warroom-primary-cta, .warroom-secondary-link {
                        width: 100%;
                    }
                }
            `}</style>

            <div className="landing-hero-container">
                {/* TOP HALF: Clean, Bold Headline and Primary Black CTA */}
                <span className="landing-badge">
                    <Sparkles size={16} className="text-purple-400" />
                    <span>{t('landing.heroBadge')}</span>
                </span>

                <h1 className="landing-title">
                    {t('landing.heroTitlePrefix')}{' '}
                    <span className="title-gradient-highlight">{typedText}</span>
                    <span className="typing-cursor" />
                </h1>

                <p className="landing-copy">
                    {t('landing.heroSubtitle')}
                </p>

                <div className="cta-buttons-group">
                    <button
                        type="button"
                        className="warroom-primary-cta"
                        onClick={handleSimulateClick}
                    >
                        <Play size={18} className={isSimulating ? 'text-cyan-400 animate-spin' : 'text-cyan-400 fill-cyan-400'} />
                        <span>{isSimulating ? (language === 'en' ? 'Simulating Data Flow...' : 'စနစ်စမ်းသပ်နေသည်...') : t('landing.simulateTitle')}</span>
                        <ArrowRight size={18} />
                    </button>

                    <button
                        type="button"
                        className="warroom-secondary-link"
                        onClick={() => router.push(isAuthenticated ? '/onboarding' : '/login')}
                    >
                        <span>{t('landing.buttonStart')}</span>
                    </button>
                </div>

                {/* BOTTOM HALF: Two-Column pi.dev Layout (Node Graph Left + Lorem Ipsum Text Right) */}
                <div className="landing-split-section">
                    <div className="split-left-panel">
                        <WarRoomNodeGraph
                            isSimulating={isSimulating}
                            onNodeClick={() => router.push(isAuthenticated ? '/onboarding' : '/login')}
                        />
                    </div>

                    <div className="split-right-panel">
                        <h2 className="pi-style-heading">{t('landing.simulateTitle')}</h2>
                        <div className="pi-style-paragraphs">
                            <p>
                                {t('landing.simulateDesc')}
                            </p>
                            <p>
                                {language === 'en' 
                                  ? "WarRoom ships with powerful defaults for multi-agent startup simulation. Ask your specialized agents to build what you want, or customize the consensus protocol your way."
                                  : "WarRoom တွင် အဆင့်မြင့် AI အေဂျင့်စနစ်များ ပါဝင်ပြီး လုပ်ငန်းသစ်တစ်ခု၏ အစီအစဉ်များကို စမ်းသပ်သရုပ်ပြပေးနိုင်ပါသည်။ စိတ်ကြိုက်အစီအစဉ်များကို AI အေဂျင့်များမှ တည်ဆောက်ပေးမည်ဖြစ်ပါသည်။"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
