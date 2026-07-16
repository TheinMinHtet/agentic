import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function IdeaPromptPage() {
    const navigate = useNavigate();
    const [idea, setIdea] = useState('');

    const handleLaunch = () => {
        if (idea.trim()) {
            navigate('/business-info');
        }
    };

    return (
        <section className="workflow-section section-padding container" style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '16px' }}>Step 1: Idea Understanding</h2>
            <p className="text-secondary" style={{ marginBottom: '28px', fontSize: '18px' }}>
                Tell us about your next big thing. Our NLP models will extract the core concepts and intent.
            </p>

            <div className="card" style={{ width: '100%', maxWidth: '900px', margin: '0 auto', textAlign: 'left', padding: '28px' }}>
                <h3 style={{ marginBottom: '16px' }}>Idea Understanding Agent</h3>
                <textarea
                    placeholder="Example: A mobile app that connects local bakers with nearby customers"
                    className="input-text idea-input"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    rows={3}
                    style={{ width: '100%', marginBottom: '20px' }}
                ></textarea>
                <button
                    className="button-primary"
                    style={{ width: '100%' }}
                    onClick={handleLaunch}
                    disabled={!idea.trim()}
                >
                    Launch AI Workflow
                </button>
            </div>
        </section>
    );
}
