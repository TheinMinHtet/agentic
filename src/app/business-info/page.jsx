'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BUSINESS_INFO_KEY = 'agentic:businessInfo';

export default function BusinessInfoPage() {
    const router = useRouter();

    // Default form state containing all 8 target fields + 1 original field
    const [formData, setFormData] = useState({
        location: '',
        budget: '',
        target_customers: '',
        business_type: '',
        experience_level: '',
        goal: 'scalable', // Default to scalable startup
        core_painpoint: '',
        launch_timeline: '',
        revenue_stream: 'Subscription'
    });

    // Load initial data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(BUSINESS_INFO_KEY);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error('Error parsing business info from localStorage', e);
            }
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNext = (e) => {
        e.preventDefault();
        // Save the complete state object to localStorage
        localStorage.setItem(BUSINESS_INFO_KEY, JSON.stringify(formData));
        router.push('/planning');
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
                                placeholder="e.g., $10,000" 
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
                        Submit Information & Orchestrate Agents
                    </button>
                </form>
            </div>
        </section>
    );
}
