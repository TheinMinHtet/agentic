'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkflow } from '../context/WorkflowContext';
import { createClient } from '@/lib/supabase/client';
import MarkdownPreviewer from '../components/MarkdownPreviewer';
import { useLanguage } from '../context/LanguageContext';
import RoadmapCalendar from '../components/RoadmapCalendar';
import {
    ArrowLeft,
    FileText,
    Briefcase,
    TrendingUp,
    DollarSign,
    Sparkles,
    Globe,
    Megaphone,
    CheckCircle,
    ExternalLink,
    Calendar as CalendarIcon,
    RefreshCw,
    Plus,
    Trash2
} from 'lucide-react';
import AgentRediscoveryOverlay from '../components/AgentRediscoveryOverlay';

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { language, t } = useLanguage();
    const ideaId = searchParams.get('ideaId');
    const supabase = useMemo(() => createClient(), []);
    const {
        businessInfo,
        refinedConcept,
        marketResearch,
        financeModel,
        brandPackage,
        digitalPresence,
        growthPlan,
        businessPlan,
        setRefinedConcept,
        setMarketResearch,
        setFinanceModel,
        setBrandPackage,
        setDigitalPresence,
        setGrowthPlan,
        setBusinessPlan,
        updateCurrentIdeaId,
        resetWorkflow,
        currentIdeaId,
        updateFinanceModelDirect,
        updateMarketResearchDirect,
        updateBrandPackageDirect,
        updateDigitalPresenceDirect,
        updateGrowthPlanDirect,
        triggerRediscovery
    } = useWorkflow();

    // Editing & Rediscovery States
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [steps, setSteps] = useState([]);

    // Temporary editing form states
    const [editConcept, setEditConcept] = useState('');
    const [editDifferentiators, setEditDifferentiators] = useState('');
    const [editMarketTam, setEditMarketTam] = useState('');
    const [editMarketSaturation, setEditMarketSaturation] = useState(0);
    const [editMarketCompetitors, setEditMarketCompetitors] = useState([]);
    const [editMarketPersonas, setEditMarketPersonas] = useState([]);
    const [editFinanceBreakeven, setEditFinanceBreakeven] = useState(0);
    const [editFinanceForecast, setEditFinanceForecast] = useState('');
    const [editFinanceCosts, setEditFinanceCosts] = useState([]);
    const [editFinancePricing, setEditFinancePricing] = useState('');
    const [editBrandNames, setEditBrandNames] = useState('');
    const [editBrandTagline, setEditBrandTagline] = useState('');
    const [editBrandVoice, setEditBrandVoice] = useState('');
    const [editDigitalStack, setEditDigitalStack] = useState('');
    const [editDigitalFeatures, setEditDigitalFeatures] = useState('');
    const [editGrowthChannels, setEditGrowthChannels] = useState('');
    const [editGrowthPlanText, setEditGrowthPlanText] = useState('');

    const getCurrencySymbol = () => {
        return 'MMK';
    };

    const formatCost = (cost) => {
        return `${Math.round(cost).toLocaleString()} MMK`;
    };

    const [activeTab, setActiveTab] = useState('overview');
    const [previewDoc, setPreviewDoc] = useState(false);
    const [historyLoadError, setHistoryLoadError] = useState('');

    useEffect(() => {
        let mounted = true;

        const fetchSingle = async (table) => {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('idea_id', ideaId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                throw error;
            }

            return data;
        };

        const loadHistoryDashboard = async () => {
            if (!ideaId) return;

            setHistoryLoadError('');
            updateCurrentIdeaId(ideaId);

            try {
                const [refinement, market, finance, brand, digital, growth, business] = await Promise.all([
                    fetchSingle('agent_refinements'),
                    fetchSingle('agent_market_research'),
                    fetchSingle('agent_finance_models'),
                    fetchSingle('agent_brand_packages'),
                    fetchSingle('agent_digital_presence'),
                    fetchSingle('agent_growth_plans'),
                    fetchSingle('agent_business_plans')
                ]);

                if (!mounted) return;

                if (refinement) {
                    setRefinedConcept(refinement.raw_output || {
                        thinking: refinement.thinking,
                        concept: refinement.concept,
                        improved_summary: refinement.improved_summary,
                        key_differentiators: refinement.key_differentiators || [],
                        target_audience_refined: refinement.target_audience_refined
                    });
                }

                if (market) {
                    setMarketResearch(market.raw_output || {
                        thinking: market.thinking,
                        markdown_deliverable: market.markdown_deliverable,
                        tam: market.tam,
                        competitors: market.competitors || [],
                        opportunities: market.opportunities || [],
                        saturation_level: market.saturation_level,
                        target_personas: market.target_personas || []
                    });
                }

                if (finance) {
                    setFinanceModel(finance.raw_output || {
                        thinking: finance.thinking,
                        markdown_deliverable: finance.markdown_deliverable,
                        costBreakdown: finance.cost_breakdown || [],
                        revenueForecast: finance.revenue_forecast,
                        pricingStrategy: finance.pricing_strategy,
                        breakevenMonth: finance.breakeven_month
                    });
                }

                if (brand) {
                    setBrandPackage(brand.raw_output || {
                        thinking: brand.thinking,
                        markdown_deliverable: brand.markdown_deliverable,
                        names: brand.names || [],
                        tagline: brand.tagline,
                        voice: brand.voice,
                        palette: brand.palette || {},
                        logoConcept: brand.logo_concept
                    });
                }

                if (digital) {
                    setDigitalPresence(digital.raw_output || {
                        thinking: digital.thinking,
                        markdown_deliverable: digital.markdown_deliverable,
                        landingPageOutline: digital.landing_page_outline || [],
                        features: digital.features || [],
                        stack: digital.stack || []
                    });
                }

                if (growth) {
                    setGrowthPlan(growth.raw_output || {
                        thinking: growth.thinking,
                        markdown_deliverable: growth.markdown_deliverable,
                        channels: growth.channels || [],
                        acquisitionPlan: growth.acquisition_plan,
                        roadmap90Day: growth.roadmap_90_day || []
                    });
                }

                if (business) {
                    setBusinessPlan(business.raw_output || {
                        thinking: business.thinking,
                        lean_canvas_markdown: business.lean_canvas_markdown
                    });
                }
            } catch (error) {
                console.error('Failed to load saved dashboard:', error);
                if (mounted) {
                    setHistoryLoadError(error.message || 'Unable to load saved dashboard.');
                }
            }
        };

        loadHistoryDashboard();

        return () => {
            mounted = false;
        };
    }, [
        ideaId,
        supabase,
        setRefinedConcept,
        setMarketResearch,
        setFinanceModel,
        setBrandPackage,
        setDigitalPresence,
        setGrowthPlan,
        setBusinessPlan,
        updateCurrentIdeaId
    ]);

    // Fallback data in case the user visits dashboard directly without executing agents
    const fallbackConcept = refinedConcept || {
        concept: "GrantFlow AI is a specialized Software-as-a-Service (SaaS) platform that streamlines the entire grant acquisition process. Users upload their organization's historical impact data, financial needs, and project goals. The platform then automatically drafts highly tailored, compelling, and fully compliant grant proposals.",
        improved_summary: "Tailored grant proposals drafted in minutes for non-profits.",
        key_differentiators: [
            "NLP matching engines checking compliance criteria against strict grant guidelines.",
            "Historical narrative compiler mapping past impact benchmarks into structured paragraphs.",
            "Budget-to-proposal compiler automatically formatting cost tables to grant specifications."
        ],
        target_audience_refined: "Small-to-medium non-profits (NPOs), academic researchers, and social impact startups without full-time grant writers."
    };

    const fallbackMarket = marketResearch || {
        tam: "$1.8B TAM",
        saturation_level: 25,
        competitors: [
            { name: "GrantWriter Pro", url: "https://grantwriterpro.com", weakness: "High subscription price points and manual templates." },
            { name: "ProposalAI", url: "https://proposalai.io", weakness: "Generic NLP outputs lacking compliance-specific narratives." },
            { name: "FundraisingHub", url: "Not Publicly Available", weakness: "Focuses on CRM donation pipelines rather than grant writing." }
        ],
        opportunities: [
            "Expanding philanthropic government grants globally.",
            "NPOs seeking digitized automation solutions post-inflation budget squeezes.",
            "Higher academic institutions demanding faster micro-grant writing automation tools."
        ],
        target_personas: [
            { name: "Executive Director Emily", role: "NPO Director", pain_points: ["Spends 20+ hours per grant proposal", "Lacks writing budget"], budget_limit: "300,000 MMK/mo max" },
            { name: "Researcher Roger", role: "University Grant Applicant", pain_points: ["Compliance checklist overload", "Missed submission deadlines"], budget_limit: "450,000 MMK/mo research budget" }
        ],
        markdown_deliverable: `# Market Intelligence Report: GrantFlow AI\n\n## Target Market & Personas\nGrantFlow AI targets small-to-medium non-profits, academic researchers, and social impact startups.\n\n### Ideal Customer Personas (ICPs)\n- **Executive Director Emily**: Manages a local community service non-profit. Spends 20+ hours per grant and has zero writing budget.\n- **Researcher Roger**: University researcher who deals with complex compliance requirements.\n\n## Competitor Mapping\n| Competitor | URL | Weakness |\n|---|---|---|\n| GrantWriter Pro | https://grantwriterpro.com | High pricing & templates only |\n| ProposalAI | https://proposalai.io | Generic copy, low compliance checks |\n| FundraisingHub | Not Publicly Available | Focuses on donation CRMs, not writing |\n\n## Market Trends & Opportunities\n- Growth in government micro-grants.\n- Increasing demand for low-cost automated proposal writers.\n- Saturation Level: **25%** (Low-medium market penetration).`
    };

    const fallbackFinance = financeModel || {
        costBreakdown: [
            { item: "Gemini API token costs", cost: 360000 },
            { item: "Hosting & Server infrastructure", cost: 240000 },
            { item: "Domain & SSL registration", cost: 45000 },
            { item: "Customer support software license", cost: 105000 },
            { item: "Basic marketing and ads", cost: 750000 }
        ],
        revenueForecast: "15,000,000 MMK monthly recurring revenue (MRR) projected in Month 6.",
        pricingStrategy: "Tiered subscription model: Standard (150,000 MMK/mo) and Premium (300,000 MMK/mo) with credits-based drafting caps.",
        breakevenMonth: 4,
        markdown_deliverable: `# Financial Model & Projections: GrantFlow AI\n\n## Startup Capital Allocation\nBelow is the itemized budget allocation mapping back to our 3,000,000 MMK setup limit:\n\n| Expense Item | Monthly Cost (MMK) |\n|---|---|\n| Gemini API token costs | 360,000 MMK |\n| Hosting & Server infrastructure | 240,000 MMK |\n| Domain & SSL registration | 45,000 MMK |\n| Customer support software | 105,000 MMK |\n| Marketing campaigns | 750,000 MMK |\n| **Total Estimated Run-rate** | **1,500,000 MMK/mo** |\n\n## Revenue Forecast\n- Projecting **Month 4 Breakeven**.\n- Targeting 100 active non-profit subscribers by Month 6 (15,000,000 MMK MRR).\n\n## Pricing Strategy\n- **Standard Plan**: 150,000 MMK/mo (up to 3 proposals monthly)\n- **Premium Plan**: 300,000 MMK/mo (unlimited proposals & compliance checking)`
    };

    const fallbackBrand = brandPackage || {
        names: ["GrantFlow AI", "ProposalLift", "FundForge", "BidDraft", "NarrateGrant"],
        tagline: "Tailored grant proposals drafted in minutes.",
        voice: "Empathetic, structured, professional, and compliant.",
        palette: { primary: "#1b0624", secondary: "#aeec1d", background: "#ffffff" },
        logoConcept: "A stylized feather quill that transitions into a rising network bar graph, representing written proposals leading to business growth.",
        markdown_deliverable: `# Brand Identity & Style Guide: GrantFlow AI\n\n## Brand Naming Suggestions\n1. **GrantFlow AI** (Primary suggestion)\n2. **ProposalLift**\n3. **FundForge**\n4. **BidDraft**\n5. **NarrateGrant**\n\n## Brand Voice Guidelines\n- **Empathetic**: Recognizing NPOs' lack of resources.\n- **Structured & Compliant**: Focused on precision and guidelines compliance.\n\n## Visual Guidelines\n- **Primary Color**: \`#1b0624\` (Minimalist dark purple)\n- **Secondary Accent**: \`#aeec1d\` (Neon lime green)\n- **Background**: \`#ffffff\` (Pure white)\n- **Typography**: Display headings in sans-serif, body copy in Inter.\n\n## Logo Concept\nA minimalist quill combined with an upward-trending bar graph icon.`
    };

    const fallbackDigital = digitalPresence || {
        landingPageOutline: [
            { section_id: "hero", title: "Write winning grants in minutes, not weeks.", body: "Leverage automated narrative compilers trained on compliance criteria to draft compelling grant proposals instantly.", cta_text: "Get Started Free" },
            { section_id: "features", title: "Compliance-First Drafting Engine", body: "Upload past reports and grant requirements. Our system checks against 100+ compliance rules to prevent simple format rejections.", cta_text: "See How It Works" },
            { section_id: "pricing", title: "Affordable plans for non-profits", body: "Choose a tier that grows with your fundraising needs. No upfront agency fees required.", cta_text: "View Plans" }
        ],
        features: [
            "compliance Narrative Compiler",
            "Past Impact Narrative Mapper",
            "Automatic Budget Table Formatter"
        ],
        stack: ["React Next.js", "Gemini API", "Zustand State", "Tailwind CSS", "Vercel"],
        markdown_deliverable: `# Digital Presence Specification: GrantFlow AI\n\n## Website Landing Page Layout\n\n### 1. Hero Section\n- **Heading**: Write winning grants in minutes, not weeks.\n- **Subheading**: Leverage automated narrative compilers trained on compliance criteria to draft compelling grant proposals instantly.\n- **CTA**: Get Started Free\n\n### 2. Features Grid\n- **Heading**: Compliance-First Drafting Engine\n- **Copy**: Upload past reports and grant requirements. Our system checks against 100+ compliance rules.\n\n## Key App Capabilities\n- Compliance Narrative Compiler\n- Past Impact Narrative Mapper\n- Automatic Budget Table Formatter\n\n## Recommended Technical Stack\n- Frontend: React Next.js\n- API & Orchestration: Node.js (deepagents)\n- Hosting: Vercel`
    };

    const fallbackGrowth = growthPlan || {
        channels: ["Organic Search / SEO", "B2B Non-Profit Partnerships", "Strategic Cold Outreach"],
        acquisitionPlan: "Optimize SEO around keywords like 'nonprofit grant writer' and 'write microgrant proposal'. Partner directly with non-profit incubators and research labs to offer early pilot credits.",
        roadmap90Day: [
            "Days 1-30: Launch MVP and secure 5 non-profit alpha testers to build case studies.",
            "Days 31-60: Index blog posts for search traffic and run email campaigns targeting local foundations.",
            "Days 61-90: Scale platform to premium subscription pricing and recruit affiliate partners."
        ],
        markdown_deliverable: `# Growth & Marketing Plan: GrantFlow AI\n\n## Acquisition Channels\n1. **Organic Search / SEO**: Target keywords targeting non-profit grant writing tips.\n2. **NPO Partnerships**: Partner with incubator programs.\n3. **Direct Email Outreach**: Target directors of foundation portals.\n\n## Launch Roadmap (First 90 Days)\n- **Phase 1 (Days 1-30)**: Alpha launch with 5 test non-profits. Collect compliance case studies.\n- **Phase 2 (Days 31-60)**: Push organic content articles. Run outreach sequences.\n- **Phase 3 (Days 61-90)**: Open paid tiers. Scale via partner affiliates.`
    };

    const fallbackBusiness = businessPlan || {
        lean_canvas_markdown: `# Business Overview: Lean Canvas (GrantFlow AI)

| PROBLEM | SOLUTION | UNIQUE VALUE PROP | UNFAIR ADVANTAGE | CUSTOMER SEGMENTS |
|---|---|---|---|---|
| • NPOs spend hundreds of hours researching grants.<br/>• High compliance rejection rates.<br/>• Lacks budget for professional grant writers. | • Tailored, automated grant proposal drafting SaaS.<br/>• High-precision compliance checking tools. | • Winning proposal narratives compiled in minutes instead of weeks at a fraction of agency costs. | • Compliance matching algorithm checking rules in real-time. | • Small-to-medium non-profits (NPOs).<br/>• Higher academic independent researchers. |

| KEY METRICS | CHANNELS | COST STRUCTURE | REVENUE STREAMS |
|---|---|---|---|
| • Proposal compilation count.<br/>• Success rate ratio.<br/>• Monthly recurring revenue (MRR). | • Organic Search / SEO.<br/>• Direct NPO Partnerships.<br/>• Referral programs. | • LLM Token API consumption.<br/>• Cloud servers infrastructure.<br/>• Ads & basic marketing. | • Subscription plans ($49/mo & $99/mo).<br/>• Customized extra proposal generation credits. |`
    };

    const handleRestart = () => {
        resetWorkflow();
        router.push('/onboarding');
    };

    const handleStartEdit = () => {
        setIsEditing(true);
        setEditConcept(fallbackConcept.concept);
        setEditDifferentiators(fallbackConcept.key_differentiators.join('\n'));
        setEditMarketTam(fallbackMarket.tam);
        setEditMarketSaturation(fallbackMarket.saturation_level);
        setEditMarketCompetitors([...fallbackMarket.competitors]);
        setEditMarketPersonas([...fallbackMarket.target_personas]);
        setEditFinanceBreakeven(fallbackFinance.breakevenMonth);
        setEditFinanceForecast(fallbackFinance.revenueForecast);
        setEditFinanceCosts([...fallbackFinance.costBreakdown]);
        setEditFinancePricing(fallbackFinance.pricingStrategy);
        setEditBrandNames(fallbackBrand.names.join(', '));
        setEditBrandTagline(fallbackBrand.tagline);
        setEditBrandVoice(fallbackBrand.voice);
        setEditDigitalStack(fallbackDigital.stack.join(', '));
        setEditDigitalFeatures(fallbackDigital.features.join(', '));
        setEditGrowthChannels(fallbackGrowth.channels.join(', '));
        setEditGrowthPlanText(fallbackGrowth.acquisitionPlan);
    };

    const handleSaveAndRediscover = async () => {
        setIsSaving(true);
        setSteps([
            { label: language === 'en' ? 'Persisting edited values' : 'ပြင်ဆင်ချက်များကို သိမ်းဆည်းနေသည်', status: 'running' },
            { label: language === 'en' ? 'Re-running dependent agents' : 'ဆက်စပ်အေဂျင့်များကို ပြန်လည်မောင်းနှင်နေသည်', status: 'pending' },
            { label: language === 'en' ? 'Regenerating Lean Canvas integrator' : 'လုပ်ငန်းစီမံချက်အကျဉ်းကို ပြန်လည်ဖန်တီးနေသည်', status: 'pending' }
        ]);
        setStatusMessage(language === 'en' ? 'Saving edited details to your cloud configuration...' : 'ပြင်ဆင်ချက်များကို ဒေတာဘေ့စ်တွင် သိမ်းဆည်းနေပါသည်...');
        await new Promise(r => setTimeout(r, 1000));

        try {
            if (activeTab === 'overview') {
                const updatedConcept = {
                    ...fallbackConcept,
                    concept: editConcept,
                    key_differentiators: editDifferentiators.split('\n').filter(Boolean)
                };
                setRefinedConcept(updatedConcept);
                await persistAgentOutput('agent_refinements', updatedConcept, (output) => ({
                    thinking: output.thinking || '',
                    concept: output.concept,
                    improved_summary: output.improved_summary,
                    key_differentiators: output.key_differentiators,
                    target_audience_refined: output.target_audience_refined
                }));
            } else if (activeTab === 'market') {
                const updatedMarket = {
                    ...fallbackMarket,
                    tam: editMarketTam,
                    saturation_level: Number(editMarketSaturation),
                    competitors: editMarketCompetitors,
                    target_personas: editMarketPersonas
                };
                await updateMarketResearchDirect(updatedMarket);
            } else if (activeTab === 'finance') {
                const updatedFinance = {
                    ...fallbackFinance,
                    breakevenMonth: Number(editFinanceBreakeven),
                    revenueForecast: editFinanceForecast,
                    costBreakdown: editFinanceCosts,
                    pricingStrategy: editFinancePricing
                };
                await updateFinanceModelDirect(updatedFinance);
            } else if (activeTab === 'brand') {
                const updatedBrand = {
                    ...fallbackBrand,
                    names: editBrandNames.split(',').map(s => s.trim()).filter(Boolean),
                    tagline: editBrandTagline,
                    voice: editBrandVoice
                };
                await updateBrandPackageDirect(updatedBrand);
            } else if (activeTab === 'digital') {
                const updatedDigital = {
                    ...fallbackDigital,
                    stack: editDigitalStack.split(',').map(s => s.trim()).filter(Boolean),
                    features: editDigitalFeatures.split(',').map(s => s.trim()).filter(Boolean)
                };
                await updateDigitalPresenceDirect(updatedDigital);
            } else if (activeTab === 'growth') {
                const updatedGrowth = {
                    ...fallbackGrowth,
                    channels: editGrowthChannels.split(',').map(s => s.trim()).filter(Boolean),
                    acquisitionPlan: editGrowthPlanText
                };
                await updateGrowthPlanDirect(updatedGrowth);
            }

            setSteps([
                { label: language === 'en' ? 'Persisting edited values' : 'ပြင်ဆင်ချက်များကို သိမ်းဆည်းနေသည်', status: 'completed' },
                { label: language === 'en' ? 'Re-running dependent agents' : 'ဆက်စပ်အေဂျင့်များကို ပြန်လည်မောင်းနှင်နေသည်', status: 'running' },
                { label: language === 'en' ? 'Regenerating Lean Canvas integrator' : 'လုပ်ငန်းစီမံချက်အကျဉ်းကို ပြန်လည်ဖန်တီးနေသည်', status: 'pending' }
            ]);
            setStatusMessage(language === 'en' ? 'Triggering downstream AI agent re-analysis pipeline...' : 'အခြားဆက်စပ်နေသော AI အေဂျင့်များကို ပြန်လည်စစ်ဆေးခိုင်းနေပါသည်...');
            await new Promise(r => setTimeout(r, 1200));

            // Re-run downstream agents and integrator
            await triggerRediscovery(activeTab);

            setSteps([
                { label: language === 'en' ? 'Persisting edited values' : 'ပြင်ဆင်ချက်များကို သိမ်းဆည်းနေသည်', status: 'completed' },
                { label: language === 'en' ? 'Re-running dependent agents' : 'ဆက်စပ်အေဂျင့်များကို ပြန်လည်မောင်းနှင်နေသည်', status: 'completed' },
                { label: language === 'en' ? 'Regenerating Lean Canvas integrator' : 'လုပ်ငန်းစီမံချက်အကျဉ်းကို ပြန်လည်ဖန်တီးနေသည်', status: 'completed' }
            ]);
            setStatusMessage(language === 'en' ? 'Sync complete! Blueprint successfully rediscovered.' : 'လုပ်ငန်းစီမံချက်ကို အောင်မြင်စွာ ပြန်လည်ဆန်းစစ်ပြီးပါပြီ।');
            await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
            console.error("Save & Rediscover failed:", err);
            setStatusMessage(`Error: ${err.message}`);
            await new Promise(r => setTimeout(r, 2000));
        } finally {
            setIsSaving(false);
            setIsEditing(false);
        }
    };

    const tabsList = [
        { id: 'overview', label: t('dashboard.tabOverview'), icon: Briefcase, deliverable: fallbackBusiness.lean_canvas_markdown, filename: 'business_overview.md' },
        { id: 'market', label: t('dashboard.tabMarket'), icon: TrendingUp, deliverable: fallbackMarket.markdown_deliverable, filename: 'market_intelligence.md' },
        { id: 'finance', label: t('dashboard.tabFinance'), icon: DollarSign, deliverable: fallbackFinance.markdown_deliverable, filename: 'financial_model.md' },
        { id: 'brand', label: t('dashboard.tabBrand'), icon: Sparkles, deliverable: fallbackBrand.markdown_deliverable, filename: 'brand_package.md' },
        { id: 'digital', label: t('dashboard.tabDigital'), icon: Globe, deliverable: fallbackDigital.markdown_deliverable, filename: 'digital_presence.md' },
        { id: 'growth', label: t('dashboard.tabGrowth'), icon: Megaphone, deliverable: fallbackGrowth.markdown_deliverable, filename: 'growth_plan.md' },
        { id: 'calendar', label: language === 'en' ? 'Roadmap Calendar' : 'တိုးတက်မှု ပြက္ခဒိန်', icon: CalendarIcon, deliverable: '', filename: '' }
    ];

    const currentTabInfo = tabsList.find(t => t.id === activeTab);

    return (
        <section className="dashboard-section container" style={{ minHeight: 'calc(100vh - 56px)' }}>

            {/* Dashboard Header */}
            <div className="dashboard-header" style={{
                borderBottom: '1px solid var(--color-border-light)',
                paddingBottom: '24px',
                marginBottom: '32px'
            }}>
                <div>
                    <span className="badge-accent dashboard-badge" style={{ fontWeight: 800 }}>{language === 'en' ? '✦ SYSTEM BLUEPRINT GENERATED' : '✦ လုပ်ငန်းစီမံချက် ဖန်တီးပြီးပါပြီ'}</span>
                    <h2 style={{ fontSize: '36px', fontWeight: 900, marginTop: '8px', fontFamily: 'var(--typography-heading-family)' }}>
                        {fallbackBrand.names[0] || (language === 'en' ? 'Startup Blueprint' : 'လုပ်ငန်းစီမံချက်')}
                    </h2>
                    <p className="text-secondary" style={{ fontSize: '15px', marginTop: '4px', maxWidth: '680px' }}>
                        {fallbackConcept.improved_summary}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button className="button-secondary" onClick={handleRestart} style={{ borderRadius: '12px' }}>
                        <ArrowLeft size={16} />
                        {t('dashboard.buttonNew')}
                    </button>
                </div>
            </div>

            {/* Main Tabs Layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 260px) minmax(0, 1fr)',
                gap: '40px',
                alignItems: 'start'
            }}>

                {/* Left Sidebar Navigation */}
                <aside style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    position: 'sticky',
                    top: '80px'
                }}>
                    {tabsList.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => {
                                setActiveTab(id);
                                setPreviewDoc(false);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 20px',
                                borderRadius: '16px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: 700,
                                textAlign: 'left',
                                backgroundColor: activeTab === id ? 'var(--color-primary)' : 'transparent',
                                color: activeTab === id ? 'white' : 'var(--color-text-secondary)',
                                transition: 'all 0.2s ease-in-out'
                            }}
                            className="dashboard-tab-btn"
                        >
                            <Icon size={18} />
                            {label}
                        </button>
                    ))}
                </aside>

                {/* Right Tab Panel Content */}
                <main className="card" style={{
                    position: 'relative',
                    borderRadius: '32px',
                    padding: '40px',
                    backgroundColor: 'var(--color-surface-medium)',
                    boxShadow: 'var(--elevation-card)',
                    minHeight: '520px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Glowing Scan and Loading Overlay */}
                    <AgentRediscoveryOverlay
                        isVisible={isSaving}
                        statusMessage={statusMessage}
                        steps={steps}
                    />

                    {/* Tab Header Controls */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid var(--color-border-light)',
                        paddingBottom: '16px',
                        marginBottom: '32px'
                    }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--typography-heading-family)' }}>
                            {currentTabInfo.label}
                        </h3>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            {!previewDoc && activeTab !== 'calendar' && (
                                isEditing ? (
                                    <>
                                        <button
                                            className="button-secondary"
                                            onClick={() => setIsEditing(false)}
                                            style={{
                                                borderRadius: '12px',
                                                fontSize: '13px',
                                                minHeight: '38px',
                                                padding: '8px 16px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {language === 'en' ? 'Cancel' : 'မလုပ်တော့ပါ'}
                                        </button>
                                        <button
                                            className="button-primary"
                                            onClick={handleSaveAndRediscover}
                                            style={{
                                                borderRadius: '12px',
                                                fontSize: '13px',
                                                minHeight: '38px',
                                                padding: '8px 16px',
                                                background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                                                color: '#FFFFFF',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {language === 'en' ? 'Save & Rediscover' : 'ပြင်ဆင်ချက်သိမ်းပြီး ပြန်လည်မောင်းနှင်ရန်'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className="button-secondary"
                                        onClick={handleStartEdit}
                                        style={{
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            minHeight: '38px',
                                            padding: '8px 16px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {language === 'en' ? '✏️ Edit Config' : '✏️ ပြင်ဆင်ရန်'}
                                    </button>
                                )
                            )}
                            <button
                                className="button-primary"
                                onClick={() => {
                                    setPreviewDoc(!previewDoc);
                                    setIsEditing(false);
                                }}
                                style={{
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    minHeight: '38px',
                                    padding: '8px 16px',
                                    cursor: 'pointer'
                                }}
                            >
                                <FileText size={16} />
                                {previewDoc ? (language === 'en' ? 'Show Dashboard View' : 'ဒက်ရှ်ဘုတ် မြင်ကွင်း ပြရန်') : (language === 'en' ? 'Preview Document (.md)' : 'စာရွက်စာတမ်း ဖတ်ရန် (.md)')}
                            </button>
                        </div>
                    </div>

                    {/* Content Section: Markdown Document Preview vs Styled UI Layout */}
                    {previewDoc ? (
                        <MarkdownPreviewer
                            markdown={currentTabInfo.deliverable}
                            filename={currentTabInfo.filename}
                        />
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                            {/* 1. BUSINESS OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {isEditing ? (
                                        <>
                                            <div style={{ backgroundColor: 'var(--color-background)', padding: '24px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                <h4 style={{ fontWeight: 900, marginBottom: '12px' }}>{t('dashboard.concept')}</h4>
                                                <textarea
                                                    value={editConcept}
                                                    onChange={(e) => setEditConcept(e.target.value)}
                                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', fontSize: '15px', lineHeight: '1.6', fontFamily: 'var(--font-inter)', minHeight: '120px', outline: 'none' }}
                                                />
                                            </div>
                                            <div style={{ backgroundColor: 'var(--color-background)', padding: '24px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                <h4 style={{ fontWeight: 900, marginBottom: '12px' }}>{t('dashboard.differentiators')} ({language === 'en' ? 'One per line' : 'တစ်ကြောင်းလျှင် တစ်ခု'})</h4>
                                                <textarea
                                                    value={editDifferentiators}
                                                    onChange={(e) => setEditDifferentiators(e.target.value)}
                                                    placeholder={language === 'en' ? 'Line 1\nLine 2...' : 'ပထမအချက်\nဒုတိယအချက်...'}
                                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', fontSize: '15px', lineHeight: '1.6', fontFamily: 'var(--font-inter)', minHeight: '120px', outline: 'none' }}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ backgroundColor: 'var(--color-background)', padding: '24px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                <h4 style={{ fontWeight: 900, marginBottom: '8px' }}>{t('dashboard.concept')}</h4>
                                                <p style={{ margin: 0, fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                                                    {fallbackConcept.concept}
                                                </p>
                                            </div>
                                            <div style={{ backgroundColor: 'var(--color-background)', padding: '24px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                <h4 style={{ fontWeight: 900, marginBottom: '16px' }}>{t('dashboard.differentiators')}</h4>
                                                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {fallbackConcept.key_differentiators.map((diff, idx) => (
                                                        <li key={idx} style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                                                            {diff}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 2. MARKET INTELLIGENCE TAB */}
                            {activeTab === 'market' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                                    {isEditing ? (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                        {language === 'en' ? 'Total Addressable Market (TAM)' : 'စုစုပေါင်း TAM'}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editMarketTam}
                                                        onChange={(e) => setEditMarketTam(e.target.value)}
                                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', fontSize: '15px', outline: 'none' }}
                                                    />
                                                </div>
                                                <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                                        {language === 'en' ? 'Market Saturation Index (%)' : 'ဈေးကွက် ပြည့်နှက်မှု အညွှန်းကိန်း (%)'}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={editMarketSaturation}
                                                        onChange={(e) => setEditMarketSaturation(Number(e.target.value))}
                                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', fontSize: '15px', outline: 'none' }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Competitors List Table */}
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                    <h4 style={{ fontWeight: 900, margin: 0 }}>{language === 'en' ? 'Competitor Analysis' : 'ပြိုင်ဘက်များ ဆန်းစစ်ချက်'}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditMarketCompetitors([...editMarketCompetitors, { name: '', url: '', weakness: '' }])}
                                                        style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <Plus size={14} /> {language === 'en' ? 'Add' : 'ထည့်ရန်'}
                                                    </button>
                                                </div>
                                                <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--color-border-light)' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', backgroundColor: 'var(--color-background)' }}>
                                                        <thead>
                                                            <tr style={{ backgroundColor: 'var(--color-surface-light)', borderBottom: '2px solid var(--color-border-light)' }}>
                                                                <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'left' }}>{language === 'en' ? 'Competitor' : 'ပြိုင်ဘက်'}</th>
                                                                <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'left' }}>{language === 'en' ? 'Domain / URL' : 'ဝဘ်လိပ်စာ / URL'}</th>
                                                                <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'left' }}>{language === 'en' ? 'Weak Spot' : 'အားနည်းချက်'}</th>
                                                                <th style={{ padding: '12px 16px', width: '60px' }}></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {editMarketCompetitors.map((comp, idx) => (
                                                                <tr key={idx} style={{ borderBottom: idx === editMarketCompetitors.length - 1 ? 'none' : '1px solid var(--color-border-light)' }}>
                                                                    <td style={{ padding: '8px 12px' }}>
                                                                        <input
                                                                            type="text"
                                                                            value={comp.name}
                                                                            onChange={(e) => {
                                                                                const updated = [...editMarketCompetitors];
                                                                                updated[idx].name = e.target.value;
                                                                                setEditMarketCompetitors(updated);
                                                                            }}
                                                                            style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', outline: 'none' }}
                                                                        />
                                                                    </td>
                                                                    <td style={{ padding: '8px 12px' }}>
                                                                        <input
                                                                            type="text"
                                                                            value={comp.url}
                                                                            onChange={(e) => {
                                                                                const updated = [...editMarketCompetitors];
                                                                                updated[idx].url = e.target.value;
                                                                                setEditMarketCompetitors(updated);
                                                                            }}
                                                                            style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', outline: 'none' }}
                                                                        />
                                                                    </td>
                                                                    <td style={{ padding: '8px 12px' }}>
                                                                        <input
                                                                            type="text"
                                                                            value={comp.weakness}
                                                                            onChange={(e) => {
                                                                                const updated = [...editMarketCompetitors];
                                                                                updated[idx].weakness = e.target.value;
                                                                                setEditMarketCompetitors(updated);
                                                                            }}
                                                                            style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', outline: 'none' }}
                                                                        />
                                                                    </td>
                                                                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditMarketCompetitors(editMarketCompetitors.filter((_, i) => i !== idx))}
                                                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* ICP target personas */}
                                            <div>
                                                <h4 style={{ fontWeight: 900, marginBottom: '12px' }}>{language === 'en' ? 'Target Customer Personas' : 'ပစ်မှတ် သုံးစွဲသူအမျိုးအစား'}</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                    {editMarketPersonas.map((pers, idx) => (
                                                        <div key={idx} style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Persona Name"
                                                                    value={pers.name}
                                                                    onChange={(e) => {
                                                                        const updated = [...editMarketPersonas];
                                                                        updated[idx].name = e.target.value;
                                                                        setEditMarketPersonas(updated);
                                                                    }}
                                                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', fontSize: '14px', fontWeight: 800, outline: 'none' }}
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Role/Job"
                                                                    value={pers.role}
                                                                    onChange={(e) => {
                                                                        const updated = [...editMarketPersonas];
                                                                        updated[idx].role = e.target.value;
                                                                        setEditMarketPersonas(updated);
                                                                    }}
                                                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', fontSize: '12px', outline: 'none' }}
                                                                />
                                                                <div>
                                                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>Pain Points (one per line):</label>
                                                                    <textarea
                                                                        value={pers.pain_points.join('\n')}
                                                                        onChange={(e) => {
                                                                            const updated = [...editMarketPersonas];
                                                                            updated[idx].pain_points = e.target.value.split('\n').filter(Boolean);
                                                                            setEditMarketPersonas(updated);
                                                                        }}
                                                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', fontSize: '13px', minHeight: '60px', outline: 'none', fontFamily: 'var(--font-inter)' }}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>Price Sensitivity / Limit:</label>
                                                                    <input
                                                                        type="text"
                                                                        value={pers.budget_limit}
                                                                        onChange={(e) => {
                                                                            const updated = [...editMarketPersonas];
                                                                            updated[idx].budget_limit = e.target.value;
                                                                            setEditMarketPersonas(updated);
                                                                        }}
                                                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', fontSize: '12px', outline: 'none' }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)', textAlign: 'center' }}>
                                                    <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{language === 'en' ? 'Total Addressable Market' : 'စုစုပေါင်း ဆွဲဆောင်နိုင်သည့် ဈေးကွက် TAM'}</p>
                                                    <h4 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: 'var(--color-primary)' }}>{fallbackMarket.tam}</h4>
                                                </div>
                                                <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)', textAlign: 'center' }}>
                                                    <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{language === 'en' ? 'Market Saturation Index' : 'ဈေးကွက် ပြည့်နှက်မှု အညွှန်းကိန်း'}</p>
                                                    <h4 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: 'var(--color-primary)' }}>{fallbackMarket.saturation_level}%</h4>
                                                </div>
                                            </div>

                                            {/* Competitors List Table */}
                                            <div>
                                                <h4 style={{ fontWeight: 900, marginBottom: '12px' }}>{language === 'en' ? 'Competitor Analysis' : 'ပြိုင်ဘက်များ ဆန်းစစ်ချက်'}</h4>
                                                <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--color-border-light)' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', backgroundColor: 'var(--color-background)' }}>
                                                        <thead>
                                                            <tr style={{ backgroundColor: 'var(--color-surface-light)', borderBottom: '2px solid var(--color-border-light)' }}>
                                                                <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'left' }}>{language === 'en' ? 'Competitor' : 'ပြိုင်ဘက်'}</th>
                                                                <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'left' }}>{language === 'en' ? 'Domain / URL' : 'ဝဘ်လိပ်စာ / URL'}</th>
                                                                <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'left' }}>{language === 'en' ? 'Weak Spot' : 'အားနည်းချက်'}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {fallbackMarket.competitors.map((comp, idx) => (
                                                                <tr key={idx} style={{ borderBottom: idx === fallbackMarket.competitors.length - 1 ? 'none' : '1px solid var(--color-border-light)' }}>
                                                                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>{comp.name}</td>
                                                                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>
                                                                        {comp.url.startsWith('http') ? (
                                                                            <a href={comp.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-link)', textDecoration: 'underline' }}>
                                                                                {comp.url} <ExternalLink size={12} />
                                                                            </a>
                                                                        ) : comp.url}
                                                                    </td>
                                                                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{comp.weakness}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* ICP target personas */}
                                            <div>
                                                <h4 style={{ fontWeight: 900, marginBottom: '12px' }}>{language === 'en' ? 'Target Customer Personas' : 'ပစ်မှတ် သုံးစွဲသူအမျိုးအစား'}</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                    {fallbackMarket.target_personas.map((pers, idx) => (
                                                        <div key={idx} style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                            <h5 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 900 }}>{pers.name}</h5>
                                                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{pers.role}</span>
                                                            <div style={{ marginTop: '12px' }}>
                                                                <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{language === 'en' ? 'Key Pain Points:' : 'အဓิက အခက်အခဲများ -'}</p>
                                                                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                                                    {pers.pain_points.map((p, i) => <li key={i}>{p}</li>)}
                                                                </ul>
                                                            </div>
                                                            <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                                                <strong>{language === 'en' ? 'Price Sensitivity:' : 'စျေးနှုန်းအပေါ် တုံ့ပြန်လွယ်မှု -'}</strong> {pers.budget_limit}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 3. FINANCIAL MODEL TAB */}
                            {activeTab === 'finance' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {isEditing ? (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px' }}>{t('dashboard.breakeven')} ({t('dashboard.months')})</label>
                                                    <input
                                                        type="number"
                                                        value={editFinanceBreakeven}
                                                        onChange={(e) => setEditFinanceBreakeven(Number(e.target.value))}
                                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', outline: 'none' }}
                                                    />
                                                </div>
                                                <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px' }}>{t('dashboard.monthlyRevenue')}</label>
                                                    <input
                                                        type="text"
                                                        value={editFinanceForecast}
                                                        onChange={(e) => setEditFinanceForecast(e.target.value)}
                                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', outline: 'none' }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Cost table */}
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                    <h4 style={{ fontWeight: 900, margin: 0 }}>{t('dashboard.initialCost')}</h4>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditFinanceCosts([...editFinanceCosts, { item: '', cost: 0 }])}
                                                        style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <Plus size={14} /> {language === 'en' ? 'Add' : 'ထည့်ရန်'}
                                                    </button>
                                                </div>
                                                <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--color-border-light)' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', backgroundColor: 'var(--color-background)' }}>
                                                        <thead>
                                                            <tr style={{ backgroundColor: 'var(--color-surface-light)', borderBottom: '2px solid var(--color-border-light)' }}>
                                                                <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'left' }}>{language === 'en' ? 'Expense Item' : 'အသုံးစရိတ် အမျိုးအစား'}</th>
                                                                <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right', width: '180px' }}>{language === 'en' ? 'Cost' : 'ကုန်ကျစရိတ်'} (MMK)</th>
                                                                <th style={{ padding: '12px 16px', width: '60px' }}></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {editFinanceCosts.map((item, idx) => (
                                                                <tr key={idx} style={{ borderBottom: idx === editFinanceCosts.length - 1 ? 'none' : '1px solid var(--color-border-light)' }}>
                                                                    <td style={{ padding: '8px 12px' }}>
                                                                        <input
                                                                            type="text"
                                                                            value={item.item}
                                                                            onChange={(e) => {
                                                                                const updated = [...editFinanceCosts];
                                                                                updated[idx].item = e.target.value;
                                                                                setEditFinanceCosts(updated);
                                                                            }}
                                                                            style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', outline: 'none' }}
                                                                        />
                                                                    </td>
                                                                    <td style={{ padding: '8px 12px' }}>
                                                                        <input
                                                                            type="number"
                                                                            value={item.cost}
                                                                            onChange={(e) => {
                                                                                const updated = [...editFinanceCosts];
                                                                                updated[idx].cost = Number(e.target.value);
                                                                                setEditFinanceCosts(updated);
                                                                            }}
                                                                            style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', textAlign: 'right', outline: 'none' }}
                                                                        />
                                                                    </td>
                                                                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditFinanceCosts(editFinanceCosts.filter((_, i) => i !== idx))}
                                                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                <h4 style={{ fontWeight: 900, marginBottom: '8px' }}>{language === 'en' ? 'Pricing & Subscription Tiers' : 'စျေးနှုန်းနှင့် လစဉ်ကြေး သတ်မှတ်ချက်များ'}</h4>
                                                <textarea
                                                    value={editFinancePricing}
                                                    onChange={(e) => setEditFinancePricing(e.target.value)}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', fontSize: '14px', lineHeight: '1.5', minHeight: '80px', outline: 'none', fontFamily: 'var(--font-inter)' }}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{t('dashboard.breakeven')}</p>
                                                    <h4 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>{fallbackFinance.breakevenMonth} {t('dashboard.months')}</h4>
                                                </div>
                                                <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{t('dashboard.monthlyRevenue')}</p>
                                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>{fallbackFinance.revenueForecast}</p>
                                                </div>
                                            </div>

                                            {/* Cost table */}
                                            <div>
                                                <h4 style={{ fontWeight: 900, marginBottom: '12px' }}>{t('dashboard.initialCost')}</h4>
                                                <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--color-border-light)' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', backgroundColor: 'var(--color-background)' }}>
                                                        <thead>
                                                            <tr style={{ backgroundColor: 'var(--color-surface-light)', borderBottom: '2px solid var(--color-border-light)' }}>
                                                                <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'left' }}>{language === 'en' ? 'Expense Item' : 'အသုံးစရိတ် အမျိုးအစား'}</th>
                                                                <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>{language === 'en' ? 'Cost' : 'ကုန်ကျစရိတ်'} ({getCurrencySymbol() === 'MMK' ? 'MMK' : '$'})</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {fallbackFinance.costBreakdown.map((item, idx) => (
                                                                <tr key={idx} style={{ borderBottom: idx === fallbackFinance.costBreakdown.length - 1 ? 'none' : '1px solid var(--color-border-light)' }}>
                                                                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{item.item}</td>
                                                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>{formatCost(item.cost)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                <h4 style={{ fontWeight: 900, marginBottom: '8px' }}>{language === 'en' ? 'Pricing & Subscription Tiers' : 'စျေးနှုန်းနှင့် လစဉ်ကြေး သတ်မှတ်ချက်များ'}</h4>
                                                <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{fallbackFinance.pricingStrategy}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 4. BRAND PACKAGE TAB */}
                            {activeTab === 'brand' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {isEditing ? (
                                        <>
                                            {/* Suggested Name badges */}
                                            <div>
                                                <h4 style={{ fontWeight: 900, marginBottom: '8px' }}>{language === 'en' ? 'Brainstormed Brand Names' : 'အမှတ်တံဆိပ် အမည်များ'}</h4>
                                                <input
                                                    type="text"
                                                    value={editBrandNames}
                                                    onChange={(e) => setEditBrandNames(e.target.value)}
                                                    placeholder="Name 1, Name 2, Name 3"
                                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', outline: 'none' }}
                                                />
                                            </div>

                                            {/* Tagline & Voice */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                    <h4 style={{ fontWeight: 900, marginBottom: '8px', fontSize: '16px' }}>{language === 'en' ? 'Marketing Tagline' : 'ဆောင်ပုဒ် (Tagline)'}</h4>
                                                    <input
                                                        type="text"
                                                        value={editBrandTagline}
                                                        onChange={(e) => setEditBrandTagline(e.target.value)}
                                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', outline: 'none' }}
                                                    />
                                                </div>
                                                <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                    <h4 style={{ fontWeight: 900, marginBottom: '8px', fontSize: '16px' }}>{language === 'en' ? 'Brand Voice' : 'အမှတ်တံဆိပ် ပြောဆိုပုံ (Brand Voice)'}</h4>
                                                    <input
                                                        type="text"
                                                        value={editBrandVoice}
                                                        onChange={(e) => setEditBrandVoice(e.target.value)}
                                                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', outline: 'none' }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Logo Concept */}
                                            <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                <h4 style={{ fontWeight: 900, marginBottom: '8px' }}>{language === 'en' ? 'Visual Logo Concept' : 'လိုဂို ပုံရိပ် Concept'}</h4>
                                                <textarea
                                                    value={editBrandVoice}
                                                    onChange={(e) => setEditBrandVoice(e.target.value)}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', fontSize: '14px', lineHeight: '1.5', minHeight: '80px', outline: 'none', fontFamily: 'var(--font-inter)' }}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Suggested Name badges */}
                                            <div>
                                                <h4 style={{ fontWeight: 900, marginBottom: '12px' }}>{language === 'en' ? 'Brainstormed Brand Names' : 'အမှတ်တံဆိပ် အမည်များ'}</h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                                    {fallbackBrand.names.map((name, idx) => (
                                                        <span key={idx} style={{
                                                            fontSize: '16px',
                                                            fontWeight: 900,
                                                            padding: '10px 20px',
                                                            borderRadius: '16px',
                                                            backgroundColor: idx === 0 ? 'var(--color-primary)' : 'var(--color-background)',
                                                            color: idx === 0 ? 'white' : 'var(--color-text-secondary)',
                                                            border: '1px solid var(--color-border-light)',
                                                            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                                                        }}>
                                                            {name} {idx === 0 && '✦'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tagline & Voice */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                    <h4 style={{ fontWeight: 900, marginBottom: '6px', fontSize: '16px' }}>{language === 'en' ? 'Marketing Tagline' : 'ဆောင်ပုဒ် (Tagline)'}</h4>
                                                    <p style={{ margin: 0, fontStyle: 'italic', fontSize: '15px', color: 'var(--color-text-secondary)' }}>"{fallbackBrand.tagline}"</p>
                                                </div>
                                                <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                    <h4 style={{ fontWeight: 900, marginBottom: '6px', fontSize: '16px' }}>{language === 'en' ? 'Brand Voice' : 'အမှတ်တံဆိပ် ပြောဆိုပုံ (Brand Voice)'}</h4>
                                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>{fallbackBrand.voice}</p>
                                                </div>
                                            </div>

                                            {/* Color palette */}
                                            <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                <h4 style={{ fontWeight: 900, marginBottom: '16px' }}>{language === 'en' ? 'Hex Color Palette' : 'အရောင်အသွေး သတ်မှတ်ချက်'}</h4>
                                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                                    {[
                                                        { label: language === 'en' ? 'Primary Brand Color' : 'အဓိက အရောင်', hex: fallbackBrand.palette.primary },
                                                        { label: language === 'en' ? 'Secondary Accent' : 'တွဲဖက် အရောင်', hex: fallbackBrand.palette.secondary },
                                                        { label: language === 'en' ? 'Canvas Background' : 'နောက်ခံ အရောင်', hex: fallbackBrand.palette.background }
                                                    ].map((color, i) => (
                                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                width: '42px', height: '42px',
                                                                borderRadius: '12px',
                                                                backgroundColor: color.hex,
                                                                border: '1px solid var(--color-border-light)'
                                                            }} />
                                                            <div>
                                                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>{color.label}</p>
                                                                <code style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{color.hex}</code>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Logo Concept */}
                                            <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                <h4 style={{ fontWeight: 900, marginBottom: '8px' }}>{language === 'en' ? 'Visual Logo Concept' : 'လိုဂို ပုံရိပ် Concept'}</h4>
                                                <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{fallbackBrand.logoConcept}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 5. DIGITAL PRESENCE TAB */}
                            {activeTab === 'digital' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {isEditing ? (
                                        <div style={{ backgroundColor: 'var(--color-background)', padding: '24px', borderRadius: '20px', border: '1px solid var(--color-border-light)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '8px' }}>Proposed Tech Stack (comma separated)</label>
                                                <input
                                                    type="text"
                                                    value={editDigitalStack}
                                                    onChange={(e) => setEditDigitalStack(e.target.value)}
                                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '8px' }}>Core Capabilities (comma separated)</label>
                                                <input
                                                    type="text"
                                                    value={editDigitalFeatures}
                                                    onChange={(e) => setEditDigitalFeatures(e.target.value)}
                                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', outline: 'none' }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>

                                            {/* Wireframe Outline */}
                                            <div>
                                                <h4 style={{ fontWeight: 900, marginBottom: '12px' }}>{language === 'en' ? 'Landing Page Wireframe Elements' : 'ဝဘ်ဆိုက် Layout Wireframe အစိတ်အပိုင်းများ'}</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    {fallbackDigital.landingPageOutline.map((sec, idx) => (
                                                        <div key={idx} style={{ backgroundColor: 'var(--color-background)', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border-light)' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                                <strong style={{ textTransform: 'uppercase', fontSize: '11px', color: 'var(--color-text-muted)' }}>{sec.section_id} {language === 'en' ? 'section' : 'အပိုင်း'}</strong>
                                                                {sec.cta_text && sec.cta_text !== 'None' && (
                                                                    <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>
                                                                        CTA: {sec.cta_text}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <h5 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 900 }}>{sec.title}</h5>
                                                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>{sec.body}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Capabilities & Stack */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                                <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                    <h4 style={{ fontWeight: 900, marginBottom: '12px', fontSize: '15px' }}>Core Capabilities</h4>
                                                    <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                                        {fallbackDigital.features.map((feat, i) => <li key={i}>{feat}</li>)}
                                                    </ul>
                                                </div>
                                                <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                    <h4 style={{ fontWeight: 900, marginBottom: '12px', fontSize: '15px' }}>Proposed Tech Stack</h4>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                        {fallbackDigital.stack.map((tech, i) => (
                                                            <span key={i} style={{ fontSize: '12px', fontWeight: 700, backgroundColor: 'var(--color-surface-light)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 6. GROWTH & MARKETING TAB */}
                            {activeTab === 'growth' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {isEditing ? (
                                        <div style={{ backgroundColor: 'var(--color-background)', padding: '24px', borderRadius: '20px', border: '1px solid var(--color-border-light)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '8px' }}>Acquisition Channels (comma separated)</label>
                                                <input
                                                    type="text"
                                                    value={editGrowthChannels}
                                                    onChange={(e) => setEditGrowthChannels(e.target.value)}
                                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 900, marginBottom: '8px' }}>Acquisition Plan</label>
                                                <textarea
                                                    value={editGrowthPlanText}
                                                    onChange={(e) => setEditGrowthPlanText(e.target.value)}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border-light)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#F8FAFC', fontSize: '14px', lineHeight: '1.5', minHeight: '120px', outline: 'none', fontFamily: 'var(--font-inter)' }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Channels list */}
                                            <div style={{ backgroundColor: 'var(--color-background)', padding: '20px', borderRadius: '20px', border: '1px solid var(--color-border-light)' }}>
                                                <h4 style={{ fontWeight: 900, marginBottom: '12px' }}>Acquisition Channels</h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                    {fallbackGrowth.channels.map((chan, idx) => (
                                                        <span key={idx} style={{
                                                            fontSize: '14px',
                                                            fontWeight: 900,
                                                            padding: '8px 16px',
                                                            borderRadius: '12px',
                                                            backgroundColor: 'rgba(27, 6, 36, 0.05)',
                                                            color: 'var(--color-primary)',
                                                            border: '1px solid rgba(27, 6, 36, 0.1)'
                                                        }}>
                                                            {chan}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p style={{ margin: '16px 0 0 0', fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                                                    {fallbackGrowth.acquisitionPlan}
                                                </p>
                                            </div>

                                            {/* 90-day Roadmap list */}
                                            <div>
                                                <h4 style={{ fontWeight: 900, marginBottom: '16px' }}>First 90-Day Execution Roadmap</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    {fallbackGrowth.roadmap90Day.map((step, idx) => {
                                                        const phaseTitle = idx === 0 ? 'Month 1' : (idx === 1 ? 'Month 2' : 'Month 3');
                                                        return (
                                                            <div key={idx} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                                                <div style={{
                                                                    fontSize: '11px',
                                                                    fontWeight: 800,
                                                                    padding: '6px 12px',
                                                                    backgroundColor: 'var(--color-primary)',
                                                                    color: 'white',
                                                                    borderRadius: '8px',
                                                                    minWidth: '70px',
                                                                    textAlign: 'center',
                                                                    textTransform: 'uppercase'
                                                                }}>
                                                                    {phaseTitle}
                                                                </div>
                                                                <div style={{ flex: 1, backgroundColor: 'var(--color-background)', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border-light)' }}>
                                                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                                                                        {step}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 7. ROADMAP CALENDAR TAB */}
                            {activeTab === 'calendar' && (
                                <RoadmapCalendar
                                    growthPlan={growthPlan || fallbackGrowth}
                                    businessInfo={businessInfo}
                                    refinedConcept={refinedConcept || fallbackConcept}
                                    ideaId={ideaId || currentIdeaId}
                                />
                            )}

                        </div>
                    )}
                </main>
            </div>
        </section>
    );
}
