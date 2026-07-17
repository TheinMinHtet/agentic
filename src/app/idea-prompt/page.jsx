'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflow } from '../context/WorkflowContext';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import {
    evaluateIdeaAsync,
    getCompositeValidationScore,
    getIdeaRouteDecision,
} from '../../agents/ideaUnderstandingAgent';
import { autoRefineIdeaAsync } from '../../agents/autoRefineAgent';

export default function IdeaPromptPage() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const { user, loading } = useAuth();
    const { rawUserIdea, updateStartupIdea, validationResult, setValidationResult, setActiveStep } = useWorkflow();
    const [idea, setIdea] = useState('');
    const [ideaHistory, setIdeaHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isAutoRefining, setIsAutoRefining] = useState(false);

    const handleAutoRefine = async () => {
        if (!idea.trim() || isAutoRefining || !validationResult?.clarificationQuestions) return;
        
        setIsAutoRefining(true);
        try {
            const refinedText = await autoRefineIdeaAsync(idea, validationResult.clarificationQuestions);
            setIdea(refinedText);
            
            // Re-evaluate automatically to update the score
            const result = await evaluateIdeaAsync(refinedText);
            const compositeScore = getCompositeValidationScore(result);
            setValidationResult({ ...result, compositeScore });
            
        } catch (error) {
            console.error("Failed to auto-refine:", error);
            setToastMessage('Failed to refine idea. Please try again.');
            setTimeout(() => setToastMessage(''), 4000);
        } finally {
            setIsAutoRefining(false);
        }
    };

    useEffect(() => {
        if (rawUserIdea) {
            setIdea(rawUserIdea);
        }
    }, [rawUserIdea]);

    useEffect(() => {
        let mounted = true;

        const loadIdeaHistory = async () => {
            if (loading) return;

            if (!user?.id) {
                setIdeaHistory([]);
                return;
            }

            setIsLoadingHistory(true);
            setHistoryError('');

            const { data, error } = await supabase
                .from('ideas')
                .select('id, title, status, created_at, updated_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(12);

            if (!mounted) return;

            if (error) {
                setHistoryError(error.message || 'Unable to load idea history.');
                setIdeaHistory([]);
            } else {
                setIdeaHistory(data || []);
            }

            setIsLoadingHistory(false);
        };

        loadIdeaHistory();

        return () => {
            mounted = false;
        };
    }, [loading, supabase, user?.id]);

    const handleOpenHistoryIdea = (historyIdea) => {
        if (historyIdea.title) {
            updateStartupIdea(historyIdea.title);
        }

        router.push(`/dashboard?ideaId=${historyIdea.id}`);
    };

    const handleLaunch = async () => {
        if (!idea.trim() || isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await evaluateIdeaAsync(idea);
            const compositeScore = getCompositeValidationScore(result);
            const fullResult = { ...result, compositeScore };
            setValidationResult(fullResult);

            if (getIdeaRouteDecision(result) === 'clarify') {
                setToastMessage(result.constructive_feedback);
                setTimeout(() => setToastMessage(''), 6000);
                router.replace('/idea-prompt');
                return;
            }

            // Save idea to context and localStorage
            updateStartupIdea(idea.trim());
            setActiveStep('business-info');

            router.push('/business-info');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <section className="workflow-section section-padding container" style={{ textAlign: 'center', minHeight: 'calc(100vh - 56px)' }}>
            <div className="idea-prompt-layout">
                <aside className="idea-history-panel">
                    <div className="idea-history-header">
                        <div>
                            <p className="idea-history-kicker">Workspace</p>
                            <h3>Idea History</h3>
                        </div>
                        <span>{ideaHistory.length}</span>
                    </div>

                    {isLoadingHistory && (
                        <p className="idea-history-empty">Loading history...</p>
                    )}

                    {!isLoadingHistory && historyError && (
                        <p className="idea-history-error">{historyError}</p>
                    )}

                    {!isLoadingHistory && !historyError && !user?.id && (
                        <p className="idea-history-empty">Log in to see saved ideas.</p>
                    )}

                    {!isLoadingHistory && !historyError && user?.id && ideaHistory.length === 0 && (
                        <p className="idea-history-empty">No saved ideas yet.</p>
                    )}

                    <div className="idea-history-list">
                        {ideaHistory.map((historyIdea) => (
                            <button
                                key={historyIdea.id}
                                type="button"
                                className="idea-history-card"
                                onClick={() => handleOpenHistoryIdea(historyIdea)}
                            >
                                <span className="idea-history-title">{historyIdea.title || 'Untitled idea'}</span>
                                <span className="idea-history-date">
                                    {new Date(historyIdea.created_at).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                                <span className="idea-history-status">{historyIdea.status || 'saved'}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                <div className="idea-prompt-main">
                    <h2 style={{ marginBottom: '24px', fontWeight: 900, fontFamily: 'var(--typography-heading-family)' }}>Step 1: Idea Understanding</h2>
                    <p className="text-secondary" style={{ marginBottom: '40px', fontSize: '18px', maxWidth: '640px', margin: '0 auto 40px auto' }}>
                        Tell us about your next big thing. Our NLP models will extract the core concepts and intent.
                    </p>

            <div className="card" style={{
                width: '100%',
                maxWidth: '800px',
                margin: '0 auto',
                textAlign: 'left',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: 'var(--elevation-card)',
                transition: 'box-shadow var(--motion-duration-base) var(--motion-easing-standard), transform var(--motion-duration-base) var(--motion-easing-standard)'
            }}>
                <h3 style={{ marginBottom: '20px', fontWeight: 900, fontFamily: 'var(--typography-heading-family)' }}>Idea Understanding Agent</h3>
                <textarea
                    placeholder="Example: A mobile app that connects local bakers with nearby customers"
                    className="input-text idea-input"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    rows={4}
                    style={{
                        width: '100%',
                        marginBottom: '24px',
                        borderRadius: '16px',
                        padding: '16px',
                        fontSize: '16px',
                        lineHeight: '1.6',
                        resize: 'none',
                        height: 'auto'
                    }}
                ></textarea>
                <button
                    className="button-primary"
                    style={{
                        width: '100%',
                        borderRadius: '16px',
                        height: '52px',
                        fontSize: '16px',
                        fontWeight: 700,
                        transition: 'all 0.2s ease-in-out'
                    }}
                    onClick={handleLaunch}
                    disabled={!idea.trim() || isSubmitting}
                >
                    {isSubmitting ? 'Evaluating idea...' : 'Launch AI Workflow'}
                </button>

                {validationResult && (
                    <div className="idea-validation-card" style={{
                        marginTop: '32px',
                        padding: '28px',
                        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid var(--color-border-light)',
                        borderRadius: '16px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                            <p className="idea-validation-title" style={{ margin: 0, fontWeight: 900, fontSize: '14px', letterSpacing: '0.05em' }}>Validation Result</p>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{
                                    padding: '5px 12px',
                                    borderRadius: '999px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    letterSpacing: '0.05em',
                                    backgroundColor: validationResult.evaluatedBy === 'gemini' ? 'var(--color-accent-soft)' : 'var(--color-surface-medium)',
                                    color: validationResult.evaluatedBy === 'gemini' ? 'var(--color-accent-strong)' : 'var(--color-text-muted)',
                                    border: validationResult.evaluatedBy === 'gemini' ? '1px solid #c7d2fe' : '1px solid var(--color-border-light)'
                                }}>
                                    {validationResult.evaluatedBy === 'gemini' ? 'GEMINI AI' : 'LOCAL ENGINE'}
                                </span>
                                <span style={{
                                    padding: '6px 16px',
                                    borderRadius: '999px',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    letterSpacing: '0.05em',
                                    background: validationResult.score >= 50 ? 'linear-gradient(135deg, #0f766e 0%, var(--color-success) 100%)' : 'var(--gradient-ai)',
                                    color: 'var(--color-text-inverse)'
                                }}>
                                    {validationResult.score >= 50 ? 'PASSED' : 'REFINEMENT NEEDED'}
                                </span>
                            </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px', textAlign: 'center' }}>
                            <div style={{ padding: '16px 8px', background: 'var(--color-background)', borderRadius: '16px', border: '1px solid var(--color-border-light)' }}>
                                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clarity</p>
                                <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 900 }}>{validationResult.clarity}%</p>
                            </div>
                            <div style={{ padding: '16px 8px', background: 'var(--color-background)', borderRadius: '16px', border: '1px solid var(--color-border-light)' }}>
                                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actionability</p>
                                <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 900 }}>{validationResult.actionability}%</p>
                            </div>
                            <div style={{ padding: '16px 8px', background: 'var(--color-background)', borderRadius: '16px', border: '1px solid var(--color-border-light)' }}>
                                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Uniqueness</p>
                                <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 900 }}>{validationResult.uniqueness}%</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Composite Score</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ flex: 1, height: '10px', background: 'var(--color-border-light)', borderRadius: '5px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${validationResult.score}%`,
                                        height: '100%',
                                        background: validationResult.score >= 50 ? 'var(--gradient-accent)' : 'var(--gradient-ai)',
                                        borderRadius: '5px',
                                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}></div>
                                </div>
                                <span style={{ fontSize: '18px', fontWeight: 900 }}>{validationResult.score}/100</span>
                            </div>
                        </div>

                        <div style={{ padding: '16px', background: 'var(--color-background)', borderRadius: '16px', border: '1px solid var(--color-border-light)', marginBottom: validationResult.score < 50 ? '24px' : '0' }}>
                            <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Constructive Feedback</p>
                            <p style={{ margin: 0, fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                                {validationResult.constructive_feedback}
                            </p>
                        </div>
                        
                        {validationResult.score < 50 && validationResult.clarificationQuestions && (
                            <div style={{
                                padding: '20px',
                                backgroundColor: 'var(--color-accent-soft)',
                                borderRadius: '16px',
                                borderLeft: '4px solid var(--color-accent)'
                            }}>
                                <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 900, color: 'var(--color-primary)' }}>
                                    Clarifying Questions to Address:
                                </p>
                                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                                    {validationResult.clarificationQuestions.map((q, idx) => (
                                        <li key={idx} style={{ marginBottom: '8px' }}>{q}</li>
                                    ))}
                                </ul>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                                    <button 
                                        className="button-primary"
                                        onClick={handleAutoRefine}
                                        disabled={isAutoRefining}
                                        style={{
                                            padding: '12px 24px',
                                            borderRadius: '12px',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            border: 'none',
                                            cursor: isAutoRefining ? 'not-allowed' : 'pointer',
                                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                            color: 'white',
                                            transition: 'opacity 0.2s'
                                        }}
                                    >
                                        {isAutoRefining ? '✨ Refining Idea...' : '✨ Auto-Refine Idea'}
                                    </button>
                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                                        Or adjust your pitch manually and click "Launch AI Workflow".
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                    </div>
                </div>
            </div>
            {toastMessage && (
                <div className="idea-toast" role="status" aria-live="polite">
                    <p className="idea-toast-title">Clarification Needed (Score {validationResult?.score})</p>
                    <p className="idea-toast-copy">{toastMessage}</p>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .idea-validation-card {
                    animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .idea-toast {
                    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </section>
    );
}
