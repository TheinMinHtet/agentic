'use client';

import React, { useState } from 'react';
import { Bot, Mail, Send, Wrench, X, CheckCircle, AlertTriangle, Copy, ExternalLink, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { runEmailDraftingAgent } from '../../agents/emailDraftingAgent';

export default function InvestorEmailModal({ isOpen, onClose, docTitle, docContent, businessName }) {
    const { language } = useLanguage();
    
    const [recipientName, setRecipientName] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [customFocus, setCustomFocus] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [generatedDraft, setGeneratedDraft] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleGenerateDraft = async () => {
        if (!recipientEmail.trim()) return;
        setIsRunning(true);
        setErrorMsg(null);
        setGeneratedDraft(null);

        try {
            const res = await runEmailDraftingAgent({
                recipientName: recipientName.trim() || (language === 'en' ? 'Valued Investor' : 'ရင်းနှီးမြှုပ်နှံသူ'),
                recipientEmail: recipientEmail.trim(),
                customFocus: customFocus.trim(),
                docTitle: docTitle || 'Complete Startup Prospectus',
                docContent: docContent || '',
                businessName: businessName || 'Our Startup',
                language
            });

            if (res.status === 'success') {
                setGeneratedDraft(res);
            } else {
                setErrorMsg(res.message || 'Failed to generate email draft.');
            }
        } catch (err) {
            setErrorMsg(err?.message || 'An unexpected error occurred during email generation.');
        } finally {
            setIsRunning(false);
        }
    };

    const getFullBodyText = (draft) => {
        if (!draft) return '';
        const bullets = (draft.key_bullet_points || []).map(b => `• ${b}`).join('\n');
        return `${draft.greeting}\n\n${draft.executive_summary}\n\nKey Highlights:\n${bullets}\n\n${draft.call_to_action}\n\n[Note: Please find the ${docTitle || 'Prospectus'} PDF attached to this email.]\n\n${draft.closing}`;
    };

    const handleCopy = () => {
        if (!generatedDraft) return;
        const textToCopy = `Subject: ${generatedDraft.subject}\nTo: ${generatedDraft.recipient_name} <${generatedDraft.recipient_email}>\n\n${getFullBodyText(generatedDraft)}`;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const handleOpenMailApp = () => {
        if (!generatedDraft) return;
        const subject = encodeURIComponent(generatedDraft.subject || `Investor Pitch: ${docTitle}`);
        const body = encodeURIComponent(getFullBodyText(generatedDraft));
        window.open(`mailto:${generatedDraft.recipient_email}?subject=${subject}&body=${body}`, '_blank');
    };

    return (
        <div 
            style={{ 
                position: 'fixed', 
                inset: 0, 
                backgroundColor: 'rgba(8, 11, 17, 0.8)', 
                backdropFilter: 'blur(10px)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                zIndex: 1200 
            }}
            onClick={onClose}
        >
            <div 
                className="card" 
                style={{ 
                    width: '640px', 
                    maxWidth: '94%', 
                    maxHeight: '90vh', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    backgroundColor: 'rgba(15, 19, 29, 0.98)', 
                    border: '1px solid rgba(0, 242, 254, 0.3)', 
                    boxShadow: '0 20px 60px rgba(0, 242, 254, 0.15)',
                    borderRadius: '32px',
                    padding: '32px',
                    overflowY: 'auto'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header (Exactly consistent with AI Roadmap Calendar Editor Modal) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid #00F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={22} color="#00F2FE" />
                        </div>
                        <div>
                            <h5 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {language === 'en' ? 'AI Investor Email Drafter' : '🤖 AI ဖြင့် ရင်းနှီးမြှုပ်နှံသူထံ အီးမေးလ်ကြမ်းခင်းစာ ရေးသားရန်'}
                            </h5>
                            <span style={{ fontSize: '11px', color: '#00F2FE', fontWeight: 700 }}>
                                True Tool-Calling ReAct Agent &bull; {docTitle || 'Prospectus Report'}
                            </span>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tool Definition Card (As requested across suite: "ဘာ tool ကိုခေါ်မယ်ဆိုတာ define လုပ်ပေး") */}
                <div style={{
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: '16px',
                    padding: '14px 18px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Wrench size={18} color="#818cf8" />
                        <div>
                            <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#c7d2fe', fontFamily: 'monospace' }}>
                                draft_investor_email_tool
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                                {language === 'en'
                                    ? 'Generates executive-level pitch emails with structured subject, key highlights, and CTA'
                                    : 'အီးမေးလ်ခေါင်းစဉ်၊ ကဏ္ဍအလိုက် Key Highlights နှင့် ရှင်းလင်းသော CTA ပါဝင်သည့် စာအိတ်အဖြစ် ဖန်တီးပေးသည်'}
                            </div>
                        </div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'rgba(129, 140, 248, 0.2)', color: '#a5b4fc', border: '1px solid rgba(129, 140, 248, 0.3)' }}>
                        ReAct Tool
                    </span>
                </div>

                {/* Form Inputs */}
                {!generatedDraft ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                                {language === 'en' ? 'Recipient Name / Title' : 'လက်ခံမည့် ရင်းနှီးမြှုပ်နှံသူ၏ အမည်နှင့် ရာထူး'}
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                value={recipientName}
                                onChange={e => setRecipientName(e.target.value)}
                                placeholder={language === 'en' ? 'e.g. Mr. John, Partner at Apex Venture Capital' : 'ဥပမာ - ဦးအောင်ကျော် (Managing Director, Myanmar Ventures)'}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFF', fontSize: '13.5px', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                                {language === 'en' ? 'Recipient Email Address *' : 'လက်ခံမည့် အီးမေးလ်လိပ်စာ (မဖြစ်မနေထည့်ရန်) *'}
                            </label>
                            <input
                                type="email"
                                className="input-field"
                                value={recipientEmail}
                                onChange={e => setRecipientEmail(e.target.value)}
                                placeholder="e.g. john@apexventures.vc"
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFF', fontSize: '13.5px', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                                {language === 'en' ? 'Custom Highlight / Pitch Angle (Optional)' : 'အထူးပြု Highlight လုပ်လိုသည့် အချက်များ (ရွေးချယ်ရန်)'}
                            </label>
                            <textarea
                                className="input-field"
                                rows={3}
                                value={customFocus}
                                onChange={e => setCustomFocus(e.target.value)}
                                placeholder={language === 'en'
                                    ? 'e.g. Please highlight our 18-month breakeven projection and strong market demand in Yangon.'
                                    : 'ဥပမာ - ကျွန်တော်တို့ရဲ့ ၃-နှစ်စာ ဝင်ငွေခန့်မှန်းချက်နဲ့ Breakeven Point ကို အဓိက Highlight လုပ်ပေးပါ...'}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFF', fontSize: '13.5px', outline: 'none', resize: 'vertical' }}
                            />
                        </div>

                        {errorMsg && (
                            <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', display: 'flex', alignItems: 'center', gap: '10px', color: '#f43f5e', fontSize: '13px' }}>
                                <AlertTriangle size={18} />
                                <span>{errorMsg}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Generated Draft Display Card */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ padding: '20px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(0, 242, 254, 0.2)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject</div>
                                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#00F2FE', marginTop: '2px' }}>{generatedDraft.subject}</div>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px' }}>
                                    To: {generatedDraft.recipient_email}
                                </div>
                            </div>

                            <div style={{ fontSize: '13.5px', color: '#E2E8F0', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                <div style={{ fontWeight: 700, marginBottom: '10px' }}>{generatedDraft.greeting}</div>
                                <div style={{ marginBottom: '14px' }}>{generatedDraft.executive_summary}</div>
                                {generatedDraft.key_bullet_points && generatedDraft.key_bullet_points.length > 0 && (
                                    <div style={{ marginBottom: '14px', paddingLeft: '6px' }}>
                                        <div style={{ fontWeight: 700, color: '#FFF', marginBottom: '6px' }}>Key Highlights:</div>
                                        {generatedDraft.key_bullet_points.map((pt, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                                                <span style={{ color: '#00F2FE' }}>&bull;</span>
                                                <span>{pt}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div style={{ marginBottom: '14px' }}>{generatedDraft.call_to_action}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '14px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                                    📎 Note: Remember to attach downloaded {docTitle || 'prospectus'} PDF when sending.
                                </div>
                                <div style={{ color: 'var(--color-text-secondary)' }}>{generatedDraft.closing}</div>
                            </div>
                        </div>

                        {/* Success message or copy status */}
                        {copied && (
                            <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(20, 184, 166, 0.15)', border: '1px solid #14b8a6', color: '#14b8a6', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontWeight: 600 }}>
                                <CheckCircle size={16} />
                                <span>{language === 'en' ? 'Email draft copied to clipboard!' : 'အီးမေးလ်စာသားတစ်ခုလုံး ကူးယူပြီးပါပြီ!'}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
                    <button
                        type="button"
                        className="button-secondary"
                        onClick={generatedDraft ? () => setGeneratedDraft(null) : onClose}
                        disabled={isRunning}
                        style={{ padding: '10px 18px', borderRadius: '12px', fontSize: '13.5px' }}
                    >
                        {generatedDraft ? (language === 'en' ? 'Back / Edit' : 'ပြန်လည်ပြင်ဆင်ရန်') : (language === 'en' ? 'Close' : 'ပိတ်ရန်')}
                    </button>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        {!generatedDraft ? (
                            <button
                                type="button"
                                className="button-primary"
                                onClick={handleGenerateDraft}
                                disabled={isRunning || !recipientEmail.trim()}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 22px',
                                    borderRadius: '14px',
                                    fontSize: '13.5px',
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: '#FFF',
                                    cursor: isRunning || !recipientEmail.trim() ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                                    opacity: isRunning || !recipientEmail.trim() ? 0.6 : 1
                                }}
                            >
                                {isRunning ? (
                                    <>
                                        <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                        <span>{language === 'en' ? 'Calling Email Drafter...' : 'AI Tool ဖြင့် ရေးသားနေသည်...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        <span>{language === 'en' ? 'Generate Email Draft' : '🤖 AI ဖြင့် ကြမ်းခင်းစာ ထုတ်ရန်'}</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="button-secondary"
                                    onClick={handleCopy}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '10px 18px',
                                        borderRadius: '12px',
                                        fontSize: '13.5px',
                                        fontWeight: 600,
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        color: '#FFF'
                                    }}
                                >
                                    <Copy size={16} />
                                    <span>{language === 'en' ? 'Copy Text' : 'စာသားကူးယူရန်'}</span>
                                </button>

                                <button
                                    type="button"
                                    className="button-primary"
                                    onClick={handleOpenMailApp}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 22px',
                                        borderRadius: '14px',
                                        fontSize: '13.5px',
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: '#FFF',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                                    }}
                                >
                                    <Send size={16} />
                                    <span>{language === 'en' ? 'Open Mail App (mailto:)' : '✉️ အီးမေးလ်ဖြင့် ချက်ချင်းပို့ရန်'}</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
