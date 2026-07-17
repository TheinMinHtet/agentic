import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    evaluateIdeaAsync,
    getCompositeValidationScore,
    getIdeaRouteDecision,
} from '../agents/ideaUnderstandingAgent';

export default function IdeaPromptPage() {
    const navigate = useNavigate();
    const [idea, setIdea] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    const handleLaunch = async () => {
        if (!idea.trim() || isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await evaluateIdeaAsync(idea);
            const compositeScore = getCompositeValidationScore(result);
            setValidationResult({ ...result, compositeScore });

            if (getIdeaRouteDecision(result) === 'clarify') {
                setToastMessage(result.constructive_feedback);
                setTimeout(() => setToastMessage(''), 6000);
                navigate('/idea-prompt', { replace: true });
                return;
            }

            // Save idea to localStorage for subsequent mock pages to use
            localStorage.setItem('agentic:startupIdea', idea.trim());

            navigate('/business-info');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="workflow-section section-padding container" style={{ textAlign: 'center', minHeight: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                borderRadius: '32px',
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
                        backgroundColor: 'var(--color-surface-light)',
                        border: '1px solid var(--color-border-light)',
                        borderRadius: '24px'
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
                                    backgroundColor: validationResult.evaluatedBy === 'gemini' ? 'rgba(174, 236, 29, 0.15)' : 'var(--color-surface-medium)',
                                    color: validationResult.evaluatedBy === 'gemini' ? '#3d6b00' : 'var(--color-text-muted)',
                                    border: validationResult.evaluatedBy === 'gemini' ? '1px solid rgba(174, 236, 29, 0.4)' : '1px solid var(--color-border-light)'
                                }}>
                                    {validationResult.evaluatedBy === 'gemini' ? '✦ GEMINI AI' : '⚙ LOCAL ENGINE'}
                                </span>
                                <span style={{
                                    padding: '6px 16px',
                                    borderRadius: '999px',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    letterSpacing: '0.05em',
                                backgroundColor: validationResult.score >= 50 ? 'var(--color-accent)' : 'var(--color-primary)',
                                color: validationResult.score >= 50 ? 'var(--color-primary)' : 'var(--color-text-inverse)'
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
                                        background: validationResult.score >= 50 ? 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)' : 'var(--color-primary)',
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
                                backgroundColor: 'rgba(27, 6, 36, 0.03)',
                                borderRadius: '20px',
                                borderLeft: '4px solid var(--color-primary)'
                            }}>
                                <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 900, color: 'var(--color-primary)' }}>
                                    💡 Clarifying Questions to Address:
                                </p>
                                <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                                    {validationResult.clarificationQuestions.map((q, idx) => (
                                        <li key={idx} style={{ marginBottom: '8px' }}>{q}</li>
                                    ))}
                                </ul>
                                <p style={{ margin: '14px 0 0 0', fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                                    Adjust your pitch above to address these points, then click "Launch AI Workflow" to re-evaluate.
                                </p>
                            </div>
                        )}
                    </div>
                )}
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
