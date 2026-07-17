'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflow } from '../context/WorkflowContext';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function BusinessInfoPage() {
    const router = useRouter();
    const { businessInfo, updateBusinessInfo, setActiveStep, updateCurrentIdeaId } = useWorkflow();
    const supabase = useMemo(() => createClient(), []);
    const { user, loading } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        location: '',
        budget: '',
        target_customers: '',
        business_type: '',
        experience_level: '',
        goal: 'scalable',
        core_painpoint: '',
        launch_timeline: '',
        revenue_stream: 'Subscription'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    // Sync context values to form on load/update
    useEffect(() => {
        if (businessInfo) {
            setFormData(prev => ({ ...prev, ...businessInfo }));
        }
    }, [businessInfo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNext = async (e) => {
        e.preventDefault();

        if (isSubmitting) {
            return;
        }

        if (!formData.title.trim()) {
            setErrorMessage('Please add a title for your idea.');
            return;
        }

        if (loading) {
            setErrorMessage('Checking your session. Please try again in a moment.');
            return;
        }

        if (!user?.id) {
            setErrorMessage('Please log in before creating an idea.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');
        setIsSaved(false);

        const normalizedBudget = Number(formData.budget.replace(/[^0-9.]/g, ''));
        const ideaPayload = {
            user_id: user.id,
            title: formData.title.trim(),
            location: formData.location.trim(),
            budget: Number.isFinite(normalizedBudget) ? normalizedBudget : null,
            target_customers: formData.target_customers.trim(),
            business_type: formData.business_type.trim(),
            experience_level: formData.experience_level.trim(),
            goal: formData.goal,
            core_painpoint: formData.core_painpoint.trim(),
            launch_timeline: formData.launch_timeline.trim(),
            revenue_stream: formData.revenue_stream,
            status: 'processing'
        };

        const { data: savedIdea, error } = await supabase
            .from('ideas')
            .insert(ideaPayload)
            .select('id')
            .single();

        if (error) {
            setErrorMessage(error.message || 'Unable to save your idea. Please try again.');
            setIsSubmitting(false);
            return;
        }

        updateCurrentIdeaId(savedIdea.id);
        updateBusinessInfo(formData);
        setActiveStep('planning');
        setIsSaved(true);

        setTimeout(() => {
            router.push('/planning');
        }, 700);
    };


    return (
        <section className="workflow-section section-padding container" style={{ textAlign: 'center', minHeight: 'calc(100vh - 56px)' }}>
            <h2 style={{ marginBottom: '24px', fontWeight: 900, fontSize: '36px', fontFamily: 'var(--typography-heading-family)', letterSpacing: 0 }}>
                Step 2: Business Information Collection
            </h2>
            <p className="text-secondary" style={{ marginBottom: '48px', fontSize: '18px', maxWidth: '640px', margin: '0 auto 48px auto', lineHeight: '1.6' }}>
                We need a few more details to synthesize the market size and financial model exactly suited to your vision.
            </p>

            <div className="business-info-card">
                <h4 style={{ marginBottom: '8px', color: 'var(--color-primary)', fontWeight: 900, fontFamily: 'var(--typography-heading-family)' }}>
                    Active Agent: Business Intel Gathering
                </h4>
                <p className="text-muted" style={{ fontSize: '14px', marginBottom: '32px' }}>
                    Please complete the questionnaire details so we can proceed to plan and execute specialized agents.
                </p>

                <form onSubmit={handleNext}>
                    {/* Goal Type radio selection */}
                    <div className="business-goal-group">
                        <label className="business-goal-label">
                            What is your primary startup or business goal?
                        </label>
                        <div className="business-goal-options">
                            {[
                                { val: 'local', label: 'Small local business' },
                                { val: 'scalable', label: 'Scalable startup' },
                                { val: 'online', label: 'Online business' }
                            ].map(item => (
                                <label 
                                    key={item.val} 
                                    className={`business-goal-option ${formData.goal === item.val ? 'active' : ''}`}
                                >
                                    <input 
                                        type="radio" 
                                        name="goal" 
                                        value={item.val} 
                                        checked={formData.goal === item.val} 
                                        onChange={handleChange}
                                    />
                                    {item.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 2-column input layout */}
                    <div className="business-form-grid">
                        <div className="business-field">
                            <label>Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                className="input-text"
                                placeholder="e.g., Neighborhood bakery marketplace"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="business-field">
                            <label>Business Type / Category</label>
                            <input 
                                type="text" 
                                name="business_type" 
                                required 
                                className="input-text" 
                                placeholder="e.g., Bakery, SaaS, E-commerce" 
                                value={formData.business_type}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="business-field">
                            <label>Primary Target Audience</label>
                            <input 
                                type="text" 
                                name="target_customers" 
                                required 
                                className="input-text" 
                                placeholder="e.g., Millennials in urban areas" 
                                value={formData.target_customers}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="business-field">
                            <label>Primary Revenue Stream</label>
                            <select 
                                name="revenue_stream"
                                className="input-text business-select" 
                                value={formData.revenue_stream}
                                onChange={handleChange}
                            >
                                <option>Subscription</option>
                                <option>One-time purchase</option>
                                <option>Ad-supported</option>
                            </select>
                        </div>

                        <div className="business-field">
                            <label>Location Context</label>
                            <input 
                                type="text" 
                                name="location" 
                                required 
                                className="input-text" 
                                placeholder="e.g., San Francisco, CA or Online-Only" 
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="business-field">
                            <label>Startup Capital / Budget</label>
                            <input 
                                type="text" 
                                name="budget" 
                                required 
                                className="input-text" 
                                placeholder="e.g., $10,000 or 15,000,000 MMK" 
                                value={formData.budget}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="business-field">
                            <label>Experience Level</label>
                            <input 
                                type="text" 
                                name="experience_level" 
                                required 
                                className="input-text" 
                                placeholder="e.g., Beginner, 5 years in retail" 
                                value={formData.experience_level}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="business-field">
                            <label>Launch Timeline</label>
                            <input 
                                type="text" 
                                name="launch_timeline" 
                                required 
                                className="input-text" 
                                placeholder="e.g., 3 months" 
                                value={formData.launch_timeline}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Core Painpoint text area (takes full width) */}
                    <div className="business-field" style={{ marginBottom: '40px' }}>
                        <label>Core Painpoint Being Solved</label>
                        <textarea 
                            name="core_painpoint" 
                            required 
                            className="input-text" 
                            rows={3}
                            placeholder="Describe the primary customer problem your business addresses..." 
                            value={formData.core_painpoint}
                            onChange={handleChange}
                            style={{ 
                                resize: 'none', 
                                padding: '12px 16px',
                                minHeight: '80px',
                                height: 'auto',
                                lineHeight: '1.6'
                            }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="button-primary" 
                        disabled={isSubmitting || loading}
                        style={{ 
                            width: '100%',
                            borderRadius: '16px',
                            height: '52px',
                            fontSize: '16px',
                            fontWeight: 700,
                            boxShadow: '0 12px 24px rgba(79, 70, 229, 0.22)',
                            transition: 'all 0.2s ease-in-out'
                            }}
                    >
                        {isSubmitting ? 'Saving idea...' : 'Submit Information & Orchestrate Agents'}
                    </button>

                    {errorMessage && (
                        <p role="alert" style={{ color: '#b42318', margin: '16px 0 0 0', fontWeight: 700 }}>
                            {errorMessage}
                        </p>
                    )}

                    {isSaved && (
                        <p role="status" style={{ color: '#247a32', margin: '16px 0 0 0', fontWeight: 700 }}>
                            Idea saved. Preparing the planning layer...
                        </p>
                    )}
                </form>
            </div>
        </section>
    );
}
