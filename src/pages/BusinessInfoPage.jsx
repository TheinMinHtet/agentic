import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BusinessInfoPage() {
    const navigate = useNavigate();

    const handleNext = (e) => {
        e.preventDefault();
        navigate('/planning');
    };

    return (
        <section className="workflow-section section-padding container" style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '16px' }}>Step 2: Business Information Collection</h2>
            <p className="text-secondary" style={{ marginBottom: '48px', fontSize: '18px' }}>
                We need a few more details to synthesize the market size and financial model exactly suited to your vision.
            </p>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left', padding: '32px' }}>
                <h4 style={{ marginBottom: '8px', color: 'var(--color-primary)' }}>Active Agent: Business Intel Gathering</h4>
                <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>Please complete the missing details so we can proceed.</p>

                <form onSubmit={handleNext}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Who is your primary target audience?</label>
                    <input type="text" required className="input-text" style={{ width: '100%', marginBottom: '24px' }} placeholder="e.g., Millennials in urban areas" />

                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>What is your primary revenue stream?</label>
                    <select className="input-text" style={{ width: '100%', appearance: 'none', backgroundColor: 'var(--color-background)', marginBottom: '32px' }}>
                        <option>Subscription</option>
                        <option>One-time purchase</option>
                        <option>Ad-supported</option>
                    </select>

                    <button type="submit" className="button-primary" style={{ width: '100%' }}>Submit Information</button>
                </form>
            </div>
        </section>
    );
}
