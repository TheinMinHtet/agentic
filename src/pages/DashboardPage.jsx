import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChartNoAxesColumnIncreasing, DollarSign, Layers3, Target } from 'lucide-react';

const summaryCards = [
    {
        icon: Target,
        label: 'Market signal',
        value: '$4.2B TAM',
        detail: '3 major competitors mapped',
        tone: 'accent',
    },
    {
        icon: DollarSign,
        label: 'Financial path',
        value: 'Month 14',
        detail: 'Estimated breakeven point',
        tone: 'primary',
    },
    {
        icon: ChartNoAxesColumnIncreasing,
        label: 'Launch readiness',
        value: '68%',
        detail: 'Strong early planning score',
        tone: 'teal',
    },
];

export default function DashboardPage() {
    const navigate = useNavigate();

    return (
        <section className="dashboard-section container">
            <div className="dashboard-header">
                <div>
                    <span className="badge-accent dashboard-badge">Generated in 45s</span>
                    <h2>Startup Blueprint</h2>
                    <p className="text-muted">A focused snapshot of your market, finance, and technical direction.</p>
                </div>
                <button className="button-primary" onClick={() => navigate('/dashboard/refinement')}>
                    Refine plan
                    <ArrowRight size={18} />
                </button>
            </div>

            <div className="dashboard-grid">
                {summaryCards.map(({ icon: Icon, label, value, detail, tone }) => (
                    <article className="metric-card card" key={label}>
                        <div className={`metric-icon ${tone}`}>
                            <Icon size={20} />
                        </div>
                        <div>
                            <p className="metric-label">{label}</p>
                            <h3>{value}</h3>
                            <p className="text-muted">{detail}</p>
                        </div>
                    </article>
                ))}
            </div>

            <div className="dashboard-main">
                <article className="architecture-card card">
                    <div className="architecture-heading">
                        <div className="metric-icon primary">
                            <Layers3 size={20} />
                        </div>
                        <div>
                            <p className="metric-label">Recommended architecture</p>
                            <h3>React Native, Node.js, PostgreSQL</h3>
                        </div>
                    </div>
                    <p className="text-muted">
                        A practical stack for a mobile-first MVP with a reliable API layer and structured customer, order, and analytics data.
                    </p>
                    <div className="stack-list">
                        <span>Mobile app</span>
                        <span>API backend</span>
                        <span>Relational data</span>
                    </div>
                </article>

                <aside className="next-step-card card">
                    <p className="metric-label">Next best step</p>
                    <h3>Review the blueprint with the refinement agent.</h3>
                    <p className="text-muted">Tune the audience, stack, cost model, or launch assumptions before moving forward.</p>
                    <button className="button-secondary" onClick={() => navigate('/dashboard/refinement')}>
                        Open refinement
                        <ArrowRight size={18} />
                    </button>
                </aside>
            </div>
        </section>
    );
}
