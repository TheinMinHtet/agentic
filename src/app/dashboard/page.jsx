'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkflow } from '../context/WorkflowContext';
import { createClient } from '@/lib/supabase/client';
import MarkdownPreviewer from '../components/MarkdownPreviewer';
import { useLanguage } from '../context/LanguageContext';
import RoadmapCalendar from '../components/RoadmapCalendar';
import { motion, AnimatePresence } from 'framer-motion';
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
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

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
        updateRefinedConceptDirect,
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
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .eq('idea_id', ideaId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    console.error(`Supabase error for table ${table}:`, error);
                    return null;
                }

                return data;
            } catch (err) {
                console.error(`Fetch exception for table ${table}:`, err);
                return null;
            }
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

        let updatedValue = null;
        try {
            if (activeTab === 'overview') {
                const updatedConcept = {
                    ...fallbackConcept,
                    concept: editConcept,
                    key_differentiators: editDifferentiators.split('\n').filter(Boolean)
                };
                await updateRefinedConceptDirect(updatedConcept);
                updatedValue = updatedConcept;
            } else if (activeTab === 'market') {
                const updatedMarket = {
                    ...fallbackMarket,
                    tam: editMarketTam,
                    saturation_level: Number(editMarketSaturation),
                    competitors: editMarketCompetitors,
                    target_personas: editMarketPersonas
                };
                await updateMarketResearchDirect(updatedMarket);
                updatedValue = updatedMarket;
            } else if (activeTab === 'finance') {
                const updatedFinance = {
                    ...fallbackFinance,
                    breakevenMonth: Number(editFinanceBreakeven),
                    revenueForecast: editFinanceForecast,
                    costBreakdown: editFinanceCosts,
                    pricingStrategy: editFinancePricing
                };
                await updateFinanceModelDirect(updatedFinance);
                updatedValue = updatedFinance;
            } else if (activeTab === 'brand') {
                const updatedBrand = {
                    ...fallbackBrand,
                    names: editBrandNames.split(',').map(s => s.trim()).filter(Boolean),
                    tagline: editBrandTagline,
                    voice: editBrandVoice
                };
                await updateBrandPackageDirect(updatedBrand);
                updatedValue = updatedBrand;
            } else if (activeTab === 'digital') {
                const updatedDigital = {
                    ...fallbackDigital,
                    stack: editDigitalStack.split(',').map(s => s.trim()).filter(Boolean),
                    features: editDigitalFeatures.split(',').map(s => s.trim()).filter(Boolean)
                };
                await updateDigitalPresenceDirect(updatedDigital);
                updatedValue = updatedDigital;
            } else if (activeTab === 'growth') {
                const updatedGrowth = {
                    ...fallbackGrowth,
                    channels: editGrowthChannels.split(',').map(s => s.trim()).filter(Boolean),
                    acquisitionPlan: editGrowthPlanText
                };
                await updateGrowthPlanDirect(updatedGrowth);
                updatedValue = updatedGrowth;
            }

            setSteps([
                { label: language === 'en' ? 'Persisting edited values' : 'ပြင်ဆင်ချက်များကို သိမ်းဆည်းနေသည်', status: 'completed' },
                { label: language === 'en' ? 'Re-running dependent agents' : 'ဆက်စပ်အေဂျင့်များကို ပြန်လည်မောင်းနှင်နေသည်', status: 'running' },
                { label: language === 'en' ? 'Regenerating Lean Canvas integrator' : 'လုပ်ငန်းစီမံချက်အကျဉ်းကို ပြန်လည်ဖန်တီးနေသည်', status: 'pending' }
            ]);
            setStatusMessage(language === 'en' ? 'Triggering downstream AI agent re-analysis pipeline...' : 'အခြားဆက်စပ်နေသော AI အေဂျင့်များကို ပြန်လည်စစ်ဆေးခိုင်းနေပါသည်...');
            await new Promise(r => setTimeout(r, 1200));

            // Re-run downstream agents and integrator
            await triggerRediscovery(activeTab, updatedValue);

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
        <section className="perplexity-dashboard-container container">
            {/* Background Spotlights */}
            <div className="perplexity-dashboard-glow-1" />
            <div className="perplexity-dashboard-glow-2" />

            {/* Dashboard Header */}
            <div className="perplexity-dashboard-header">
                <div>
                    <div className="perplexity-dashboard-header-badge">
                        <Sparkles size={12} style={{ color: 'var(--color-accent)' }} />
                        <span>{language === 'en' ? 'SYSTEM BLUEPRINT GENERATED' : 'လုပ်ငန်းစီမံချက် ဖန်တီးပြီးပါပြီ'}</span>
                    </div>
                    <h2 className="perplexity-dashboard-header-title">
                        {fallbackBrand.names[0] || (language === 'en' ? 'Startup Blueprint' : 'လုပ်ငန်းစီမံချက်')}
                    </h2>
                    <p className="perplexity-dashboard-header-subtitle">
                        {fallbackConcept.improved_summary}
                    </p>
                </div>

                <div>
                    <button
                        className="button-secondary"
                        onClick={handleRestart}
                        style={{
                            borderRadius: '12px',
                            padding: '10px 18px',
                            fontSize: '14px',
                            fontWeight: 600,
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#E2E8F0',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
                    >
                        <ArrowLeft size={16} />
                        {t('dashboard.buttonNew')}
                    </button>
                </div>
            </div>

            {/* Main Tabs Layout */}
            <div className="perplexity-dashboard-grid-layout">

                {/* Left Sidebar Navigation */}
                <aside className="perplexity-dashboard-sidebar">
                    {tabsList.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => {
                                setActiveTab(id);
                                setPreviewDoc(false);
                            }}
                            className={`perplexity-dashboard-tab-btn ${activeTab === id ? 'active' : ''}`}
                            style={{ position: 'relative' }}
                        >
                            {activeTab === id && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="perplexity-dashboard-active-pill"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                            <span style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                                <Icon size={18} style={{ color: activeTab === id ? 'var(--color-accent)' : 'inherit', transition: 'color 0.2s' }} />
                                <span style={{ flex: 1 }}>{label}</span>
                            </span>
                        </button>
                    ))}
                </aside>

                {/* Right Tab Panel Content */}
                <main className="perplexity-dashboard-main-card">
                    {/* Glowing Scan Overlay */}
                    <AgentRediscoveryOverlay
                        isVisible={isSaving}
                        statusMessage={statusMessage}
                        steps={steps}
                    />

                    {/* Tab Header Controls */}
                    <div className="perplexity-dashboard-panel-header">
                        <h3 className="perplexity-dashboard-panel-title">
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
                                                fontSize: '13.5px',
                                                fontWeight: 600,
                                                minHeight: '38px',
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                backgroundColor: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                color: '#E2E8F0',
                                                outline: 'none'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                                        >
                                            {language === 'en' ? 'Cancel' : 'မလုပ်တော့ပါ'}
                                        </button>
                                        <button
                                            className="button-primary"
                                            onClick={handleSaveAndRediscover}
                                            style={{
                                                borderRadius: '12px',
                                                fontSize: '13.5px',
                                                fontWeight: 600,
                                                minHeight: '38px',
                                                padding: '8px 16px',
                                                background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                                                color: '#FFFFFF',
                                                cursor: 'pointer',
                                                border: 'none',
                                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)',
                                                outline: 'none'
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
                                            fontSize: '13.5px',
                                            fontWeight: 600,
                                            minHeight: '38px',
                                            padding: '8px 16px',
                                            cursor: 'pointer',
                                            backgroundColor: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            color: '#E2E8F0',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            outline: 'none'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                                    >
                                        <span>✏️</span> {language === 'en' ? 'Edit Config' : 'ပြင်ဆင်ရန်'}
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
                                    fontSize: '13.5px',
                                    fontWeight: 600,
                                    minHeight: '38px',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    backgroundColor: previewDoc ? 'rgba(255,255,255,0.06)' : 'var(--color-primary)',
                                    border: previewDoc ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                    color: '#FFFFFF',
                                    boxShadow: previewDoc ? 'none' : '0 4px 15px rgba(99, 102, 241, 0.25)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    outline: 'none'
                                }}
                            >
                                <FileText size={16} />
                                <span>{previewDoc ? (language === 'en' ? 'Show Dashboard View' : 'ဒက်ရှ်ဘုတ် မြင်ကွင်း ပြရန်') : (language === 'en' ? 'Preview Document (.md)' : 'စာရွက်စာတမ်း ဖတ်ရန် (.md)')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Section: Markdown Document Preview vs Styled UI Layout */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab + (previewDoc ? '-preview' : '-view') + (isEditing ? '-edit' : '-read')}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 1 }}
                        >
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
                                                    <div className="perplexity-dashboard-glass-box-edit">
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>{t('dashboard.concept')}</label>
                                                        <textarea
                                                            value={editConcept}
                                                            onChange={(e) => setEditConcept(e.target.value)}
                                                            className="input-text"
                                                            style={{ width: '100%', minHeight: '140px', outline: 'none' }}
                                                        />
                                                    </div>
                                                    <div className="perplexity-dashboard-glass-box-edit">
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>{t('dashboard.differentiators')} ({language === 'en' ? 'One per line' : 'တစ်ကြောင်းလျှင် တစ်ခု'})</label>
                                                        <textarea
                                                            value={editDifferentiators}
                                                            onChange={(e) => setEditDifferentiators(e.target.value)}
                                                            placeholder={language === 'en' ? 'Line 1\nLine 2...' : 'ပထမအချက်\nဒုတိယအချက်...'}
                                                            className="input-text"
                                                            style={{ width: '100%', minHeight: '120px', outline: 'none' }}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="perplexity-dashboard-glass-box">
                                                        <h4 style={{ fontWeight: 900, fontSize: '18px', color: '#ffffff', marginBottom: '14px', letterSpacing: '-0.01em' }}>{t('dashboard.concept')}</h4>
                                                        <p className="perplexity-dashboard-concept-text">
                                                            {fallbackConcept.concept}
                                                        </p>
                                                    </div>
                                                    <div className="perplexity-dashboard-glass-box">
                                                        <h4 style={{ fontWeight: 900, fontSize: '18px', color: '#ffffff', marginBottom: '20px', letterSpacing: '-0.01em' }}>{t('dashboard.differentiators')}</h4>
                                                        <ul className="perplexity-dashboard-bullet-list">
                                                            {fallbackConcept.key_differentiators.map((diff, idx) => (
                                                                <li key={idx} className="perplexity-dashboard-bullet-item">
                                                                    <span className="perplexity-dashboard-bullet-dot" />
                                                                    <span>{diff}</span>
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
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                            {isEditing ? (
                                                <>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                        <div className="perplexity-dashboard-glass-box-edit">
                                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                                                                {language === 'en' ? 'Total Addressable Market (TAM)' : 'စုစုပေါင်း TAM'}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={editMarketTam}
                                                                onChange={(e) => setEditMarketTam(e.target.value)}
                                                                className="input-text"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>
                                                        <div className="perplexity-dashboard-glass-box-edit">
                                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                                                                {language === 'en' ? 'Market Saturation Index (%)' : 'ဈေးကွက် ပြည့်နှက်မှု အညွှန်းကိန်း (%)'}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={editMarketSaturation}
                                                                onChange={(e) => setEditMarketSaturation(Number(e.target.value))}
                                                                className="input-text"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Competitors List Table */}
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                                            <h4 style={{ fontWeight: 900, margin: 0, color: '#ffffff' }}>{language === 'en' ? 'Competitor Analysis' : 'ပြိုင်ဘက်များ ဆန်းစစ်ချက်'}</h4>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditMarketCompetitors([...editMarketCompetitors, { name: '', url: '', weakness: '' }])}
                                                                style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                                                            >
                                                                <Plus size={14} /> {language === 'en' ? 'Add' : 'ထည့်ရန်'}
                                                            </button>
                                                        </div>
                                                        <div className="perplexity-dashboard-table-container">
                                                            <table className="perplexity-dashboard-table">
                                                                <thead>
                                                                    <tr className="perplexity-dashboard-table-header-row">
                                                                        <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Competitor' : 'ပြိုင်ဘက်'}</th>
                                                                        <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Domain / URL' : 'ဝဘ်လိပ်စာ / URL'}</th>
                                                                        <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Weak Spot' : 'အားနည်းချက်'}</th>
                                                                        <th style={{ padding: '12px 16px', width: '60px' }}></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {editMarketCompetitors.map((comp, idx) => (
                                                                        <tr key={idx} className="perplexity-dashboard-table-row">
                                                                            <td className="perplexity-dashboard-table-cell" style={{ padding: '8px 12px' }}>
                                                                                <input
                                                                                    type="text"
                                                                                    value={comp.name}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...editMarketCompetitors];
                                                                                        updated[idx].name = e.target.value;
                                                                                        setEditMarketCompetitors(updated);
                                                                                    }}
                                                                                    className="input-text"
                                                                                    style={{ width: '100%', padding: '8px 12px' }}
                                                                                />
                                                                            </td>
                                                                            <td className="perplexity-dashboard-table-cell" style={{ padding: '8px 12px' }}>
                                                                                <input
                                                                                    type="text"
                                                                                    value={comp.url}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...editMarketCompetitors];
                                                                                        updated[idx].url = e.target.value;
                                                                                        setEditMarketCompetitors(updated);
                                                                                    }}
                                                                                    className="input-text"
                                                                                    style={{ width: '100%', padding: '8px 12px' }}
                                                                                />
                                                                            </td>
                                                                            <td className="perplexity-dashboard-table-cell" style={{ padding: '8px 12px' }}>
                                                                                <input
                                                                                    type="text"
                                                                                    value={comp.weakness}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...editMarketCompetitors];
                                                                                        updated[idx].weakness = e.target.value;
                                                                                        setEditMarketCompetitors(updated);
                                                                                    }}
                                                                                    className="input-text"
                                                                                    style={{ width: '100%', padding: '8px 12px' }}
                                                                                />
                                                                            </td>
                                                                            <td className="perplexity-dashboard-table-cell" style={{ padding: '8px 12px', textAlign: 'center' }}>
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
                                                        <h4 style={{ fontWeight: 900, marginBottom: '14px', color: '#ffffff' }}>{language === 'en' ? 'Target Customer Personas' : 'ပစ်မှတ် သုံးစွဲသူအမျိုးအစား'}</h4>
                                                        <div className="perplexity-dashboard-persona-grid">
                                                            {editMarketPersonas.map((pers, idx) => (
                                                                <div key={idx} className="perplexity-dashboard-glass-box-edit" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Persona Name"
                                                                        value={pers.name}
                                                                        onChange={(e) => {
                                                                            const updated = [...editMarketPersonas];
                                                                            updated[idx].name = e.target.value;
                                                                            setEditMarketPersonas(updated);
                                                                        }}
                                                                        className="input-text"
                                                                        style={{ width: '100%', padding: '8px 12px', fontSize: '14.5px', fontWeight: 800 }}
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
                                                                        className="input-text"
                                                                        style={{ width: '100%', padding: '8px 12px', fontSize: '12.5px' }}
                                                                    />
                                                                    <div>
                                                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Pain Points (one per line):</label>
                                                                        <textarea
                                                                            value={pers.pain_points.join('\n')}
                                                                            onChange={(e) => {
                                                                                const updated = [...editMarketPersonas];
                                                                                updated[idx].pain_points = e.target.value.split('\n').filter(Boolean);
                                                                                setEditMarketPersonas(updated);
                                                                            }}
                                                                            className="input-text"
                                                                            style={{ width: '100%', fontSize: '13px', minHeight: '68px', fontFamily: 'var(--font-inter)' }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Price Sensitivity / Limit:</label>
                                                                        <input
                                                                            type="text"
                                                                            value={pers.budget_limit}
                                                                            onChange={(e) => {
                                                                                const updated = [...editMarketPersonas];
                                                                                updated[idx].budget_limit = e.target.value;
                                                                                setEditMarketPersonas(updated);
                                                                            }}
                                                                            className="input-text"
                                                                            style={{ width: '100%', fontSize: '13px' }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                        <div className="perplexity-dashboard-stat-card">
                                                            <p className="perplexity-dashboard-stat-label">{language === 'en' ? 'Total Addressable Market' : 'စုစုပေါင်း TAM'}</p>
                                                            <h4 className="perplexity-dashboard-stat-value">{fallbackMarket.tam}</h4>
                                                        </div>
                                                        <div className="perplexity-dashboard-stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                            <p className="perplexity-dashboard-stat-label" style={{ marginBottom: 0 }}>{language === 'en' ? 'Market Saturation Index' : 'ဈေးကွက် ပြည့်နှက်မှု အညွှန်းကိန်း'}</p>
                                                            <div style={{ height: '140px', width: '100%', marginTop: '10px' }}>
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <PieChart>
                                                                        <Pie
                                                                            data={[
                                                                                { name: 'Saturated', value: fallbackMarket.saturation_level },
                                                                                { name: 'Available', value: 100 - fallbackMarket.saturation_level }
                                                                            ]}
                                                                            cx="50%" cy="100%"
                                                                            startAngle={180} endAngle={0}
                                                                            innerRadius={70} outerRadius={90}
                                                                            paddingAngle={2}
                                                                            dataKey="value"
                                                                            stroke="none"
                                                                        >
                                                                            <Cell fill="var(--color-primary)" />
                                                                            <Cell fill="rgba(255,255,255,0.05)" />
                                                                        </Pie>
                                                                    </PieChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                            <h4 className="perplexity-dashboard-stat-value" style={{ marginTop: '-40px' }}>{fallbackMarket.saturation_level}%</h4>
                                                        </div>
                                                    </div>

                                                    {/* Competitors List Table */}
                                                    <div>
                                                        <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '16px', color: '#ffffff' }}>{language === 'en' ? 'Competitor Analysis' : 'ပြိုင်ဘက်များ ဆန်းစစ်ချက်'}</h4>
                                                        <div className="perplexity-dashboard-table-container">
                                                            <table className="perplexity-dashboard-table">
                                                                <thead>
                                                                    <tr className="perplexity-dashboard-table-header-row">
                                                                        <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Competitor' : 'ပြိုင်ဘက်'}</th>
                                                                        <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Domain / URL' : 'ဝဘ်လိပ်စာ / URL'}</th>
                                                                        <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Weak Spot' : 'အားနည်းချက်'}</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {fallbackMarket.competitors.map((comp, idx) => (
                                                                        <tr key={idx} className="perplexity-dashboard-table-row">
                                                                            <td className="perplexity-dashboard-table-cell" style={{ fontWeight: 700, color: '#ffffff' }}>{comp.name}</td>
                                                                            <td className="perplexity-dashboard-table-cell">
                                                                                {comp.url.startsWith('http') ? (
                                                                                    <a href={comp.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-link)', textDecoration: 'underline' }}>
                                                                                        {comp.url} <ExternalLink size={12} />
                                                                                    </a>
                                                                                ) : <span style={{ color: 'var(--color-text-muted)' }}>{comp.url}</span>}
                                                                            </td>
                                                                            <td className="perplexity-dashboard-table-cell" style={{ color: 'var(--color-text-secondary)' }}>{comp.weakness}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    {/* ICP target personas */}
                                                    <div>
                                                        <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '16px', color: '#ffffff' }}>{language === 'en' ? 'Target Customer Personas' : 'ပစ်မှတ် သုံးစွဲသူအမျိုးအစား'}</h4>
                                                        <div className="perplexity-dashboard-persona-grid">
                                                            {fallbackMarket.target_personas.map((pers, idx) => (
                                                                <div key={idx} className="perplexity-dashboard-persona-card">
                                                                    <div>
                                                                        <h5 className="perplexity-dashboard-persona-name">{pers.name}</h5>
                                                                        <span className="perplexity-dashboard-persona-role">{pers.role}</span>
                                                                    </div>
                                                                    <div className="perplexity-dashboard-persona-section">
                                                                        <p className="perplexity-dashboard-persona-section-label">{language === 'en' ? 'Key Pain Points' : 'အဓိက အခက်အခဲများ'}</p>
                                                                        <ul className="perplexity-dashboard-persona-list">
                                                                            {pers.pain_points.map((p, i) => <li key={i}>{p}</li>)}
                                                                        </ul>
                                                                    </div>
                                                                    <div className="perplexity-dashboard-persona-footer">
                                                                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{language === 'en' ? 'Price Sensitivity:' : 'စျေးနှုန်းအပေါ် တုံ့ပြန်မှု:'}</span>
                                                                        <span className="perplexity-dashboard-persona-budget">{pers.budget_limit}</span>
                                                                    </div>
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
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                            {isEditing ? (
                                                <>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                        <div className="perplexity-dashboard-glass-box-edit">
                                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 850, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>{t('dashboard.breakeven')} ({t('dashboard.months')})</label>
                                                            <input
                                                                type="number"
                                                                value={editFinanceBreakeven}
                                                                onChange={(e) => setEditFinanceBreakeven(Number(e.target.value))}
                                                                className="input-text"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>
                                                        <div className="perplexity-dashboard-glass-box-edit">
                                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 850, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>{t('dashboard.monthlyRevenue')}</label>
                                                            <input
                                                                type="text"
                                                                value={editFinanceForecast}
                                                                onChange={(e) => setEditFinanceForecast(e.target.value)}
                                                                className="input-text"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Cost table */}
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                                            <h4 style={{ fontWeight: 900, margin: 0, color: '#ffffff' }}>{t('dashboard.initialCost')}</h4>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditFinanceCosts([...editFinanceCosts, { item: '', cost: 0 }])}
                                                                style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                                                            >
                                                                <Plus size={14} /> {language === 'en' ? 'Add' : 'ထည့်ရန်'}
                                                            </button>
                                                        </div>
                                                        <div className="perplexity-dashboard-table-container">
                                                            <table className="perplexity-dashboard-table">
                                                                <thead>
                                                                    <tr className="perplexity-dashboard-table-header-row">
                                                                        <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Expense Item' : 'အသုံးစရိတ် အမျိုးအစား'}</th>
                                                                        <th className="perplexity-dashboard-table-header-cell" style={{ textAlign: 'right', width: '180px' }}>{language === 'en' ? 'Cost' : 'ကုန်ကျစရိတ်'} (MMK)</th>
                                                                        <th style={{ padding: '12px 16px', width: '60px' }}></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {editFinanceCosts.map((item, idx) => (
                                                                        <tr key={idx} className="perplexity-dashboard-table-row">
                                                                            <td className="perplexity-dashboard-table-cell" style={{ padding: '8px 12px' }}>
                                                                                <input
                                                                                    type="text"
                                                                                    value={item.item}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...editFinanceCosts];
                                                                                        updated[idx].item = e.target.value;
                                                                                        setEditFinanceCosts(updated);
                                                                                    }}
                                                                                    className="input-text"
                                                                                    style={{ width: '100%' }}
                                                                                />
                                                                            </td>
                                                                            <td className="perplexity-dashboard-table-cell" style={{ padding: '8px 12px' }}>
                                                                                <input
                                                                                    type="number"
                                                                                    value={item.cost}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...editFinanceCosts];
                                                                                        updated[idx].cost = Number(e.target.value);
                                                                                        setEditFinanceCosts(updated);
                                                                                    }}
                                                                                    className="input-text"
                                                                                    style={{ width: '100%', textAlign: 'right' }}
                                                                                />
                                                                            </td>
                                                                            <td className="perplexity-dashboard-table-cell" style={{ padding: '8px 12px', textAlign: 'center' }}>
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

                                                    <div className="perplexity-dashboard-glass-box-edit">
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>{language === 'en' ? 'Pricing & Subscription Tiers' : 'စျေးနှုန်းနှင့် လစဉ်ကြေး သတ်မှတ်ချက်များ'}</label>
                                                        <textarea
                                                            value={editFinancePricing}
                                                            onChange={(e) => setEditFinancePricing(e.target.value)}
                                                            className="input-text"
                                                            style={{ width: '100%', minHeight: '90px', fontFamily: 'var(--font-inter)' }}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                        <div className="perplexity-dashboard-stat-card" style={{ gridColumn: 'span 2' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                <div>
                                                                    <p className="perplexity-dashboard-stat-label">{t('dashboard.breakeven')} Timeline</p>
                                                                    <h4 className="perplexity-dashboard-stat-value" style={{ fontSize: '20px' }}>{fallbackFinance.breakevenMonth} {t('dashboard.months')}</h4>
                                                                </div>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <p className="perplexity-dashboard-stat-label">{t('dashboard.monthlyRevenue')}</p>
                                                                    <p style={{ margin: 0, fontSize: '14px', color: '#ffffff', fontWeight: 700 }}>{fallbackFinance.revenueForecast}</p>
                                                                </div>
                                                            </div>
                                                            <div style={{ height: '200px', width: '100%', marginTop: '20px' }}>
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <AreaChart data={Array.from({ length: (Number(fallbackFinance.breakevenMonth) || 12) + 4 }, (_, i) => ({ month: i===0?'Start':`M${i}`, cash: i < (Number(fallbackFinance.breakevenMonth) || 12) ? -2500*((Number(fallbackFinance.breakevenMonth) || 12)-i) : 2500*(i-(Number(fallbackFinance.breakevenMonth) || 12)) }))}>
                                                                        <defs>
                                                                            <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                                                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.6}/>
                                                                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                                                                            </linearGradient>
                                                                        </defs>
                                                                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                                                                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val === 0 ? '0' : val > 0 ? `+${val}` : val} />
                                                                        <RechartsTooltip contentStyle={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-light)', borderRadius: '12px', color: '#fff' }} />
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                                        <Area type="monotone" dataKey="cash" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCash)" />
                                                                    </AreaChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Cost table */}
                                                    <div>
                                                        <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '16px', color: '#ffffff' }}>{t('dashboard.initialCost')}</h4>
                                                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                                            <div style={{ flex: '1 1 300px', height: '300px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px', padding: '20px', border: '1px solid var(--color-border-light)' }}>
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <PieChart>
                                                                        <Pie
                                                                            data={fallbackFinance.costBreakdown.map(i => ({ name: i.item, value: Number(i.cost) || 0 }))}
                                                                            cx="50%" cy="50%"
                                                                            innerRadius={70} outerRadius={95}
                                                                            paddingAngle={4}
                                                                            dataKey="value"
                                                                            stroke="none"
                                                                        >
                                                                            {fallbackFinance.costBreakdown.map((_, index) => (
                                                                                <Cell key={`cell-${index}`} fill={['#6366F1', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#3B82F6'][index % 6]} />
                                                                            ))}
                                                                        </Pie>
                                                                        <RechartsTooltip 
                                                                            contentStyle={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-light)', borderRadius: '12px', color: '#fff' }}
                                                                            itemStyle={{ color: '#fff' }}
                                                                        />
                                                                    </PieChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                            <div className="perplexity-dashboard-table-container" style={{ flex: '2 1 400px' }}>
                                                                <table className="perplexity-dashboard-table">
                                                                <thead>
                                                                    <tr className="perplexity-dashboard-table-header-row">
                                                                        <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Expense Item' : 'အသုံးစရိတ် အမျိုးအစား'}</th>
                                                                        <th className="perplexity-dashboard-table-header-cell" style={{ textAlign: 'right' }}>{language === 'en' ? 'Cost' : 'ကုန်ကျစရိတ်'} ({getCurrencySymbol() === 'MMK' ? 'MMK' : '$'})</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {fallbackFinance.costBreakdown.map((item, idx) => (
                                                                        <tr key={idx} className="perplexity-dashboard-table-row">
                                                                            <td className="perplexity-dashboard-table-cell" style={{ color: 'var(--color-text-secondary)' }}>{item.item}</td>
                                                                            <td className="perplexity-dashboard-table-cell" style={{ textAlign: 'right', fontWeight: 700, color: '#ffffff' }}>{formatCost(item.cost)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="perplexity-dashboard-glass-box">
                                                        <h4 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '12px', color: '#ffffff' }}>{language === 'en' ? 'Pricing & Subscription Tiers' : 'စျေးနှုန်းနှင့် လစဉ်ကြေး သတ်မှတ်ချက်များ'}</h4>
                                                        <p style={{ margin: 0, fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{fallbackFinance.pricingStrategy}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* 4. BRAND PACKAGE TAB */}
                                    {activeTab === 'brand' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                            {isEditing ? (
                                                <>
                                                    {/* Suggested Name badges */}
                                                    <div className="perplexity-dashboard-glass-box-edit">
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>{language === 'en' ? 'Brainstormed Brand Names' : 'အမှတ်တံဆိပ် အမည်များ'}</label>
                                                        <input
                                                            type="text"
                                                            value={editBrandNames}
                                                            onChange={(e) => setEditBrandNames(e.target.value)}
                                                            placeholder="Name 1, Name 2, Name 3"
                                                            className="input-text"
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>

                                                    {/* Tagline & Voice */}
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                        <div className="perplexity-dashboard-glass-box-edit">
                                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{language === 'en' ? 'Marketing Tagline' : 'ဆောင်ပုဒ် (Tagline)'}</label>
                                                            <input
                                                                type="text"
                                                                value={editBrandTagline}
                                                                onChange={(e) => setEditBrandTagline(e.target.value)}
                                                                className="input-text"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>
                                                        <div className="perplexity-dashboard-glass-box-edit">
                                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{language === 'en' ? 'Brand Voice' : 'အမှတ်တံဆိပ် ပြောဆိုပုံ (Brand Voice)'}</label>
                                                            <input
                                                                type="text"
                                                                value={editBrandVoice}
                                                                onChange={(e) => setEditBrandVoice(e.target.value)}
                                                                className="input-text"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Logo Concept */}
                                                    <div className="perplexity-dashboard-glass-box-edit">
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>{language === 'en' ? 'Visual Logo Concept' : 'လိုဂို ပုံရိပ် Concept'}</label>
                                                        <textarea
                                                            value={editBrandVoice}
                                                            onChange={(e) => setEditBrandVoice(e.target.value)}
                                                            className="input-text"
                                                            style={{ width: '100%', minHeight: '90px', fontFamily: 'var(--font-inter)' }}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Suggested Name badges */}
                                                    <div>
                                                        <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '16px', color: '#ffffff' }}>{language === 'en' ? 'Brainstormed Brand Names' : 'အမှတ်တံဆိပ် အမည်များ'}</h4>
                                                        <div className="perplexity-dashboard-names-container">
                                                            {fallbackBrand.names.map((name, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className={`perplexity-dashboard-name-badge ${idx === 0 ? 'primary' : ''}`}
                                                                >
                                                                    {name} {idx === 0 && '✦'}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Tagline & Voice */}
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                        <div className="perplexity-dashboard-glass-box">
                                                            <h4 style={{ fontWeight: 900, marginBottom: '8px', fontSize: '15.5px', color: '#ffffff' }}>{language === 'en' ? 'Marketing Tagline' : 'ဆောင်ပုဒ် (Tagline)'}</h4>
                                                            <p style={{ margin: 0, fontStyle: 'italic', fontSize: '15px', color: 'var(--color-text-secondary)' }}>"{fallbackBrand.tagline}"</p>
                                                        </div>
                                                        <div className="perplexity-dashboard-glass-box">
                                                            <h4 style={{ fontWeight: 900, marginBottom: '8px', fontSize: '15.5px', color: '#ffffff' }}>{language === 'en' ? 'Brand Voice' : 'အမှတ်တံဆိပ် ပြောဆိုပုံ (Brand Voice)'}</h4>
                                                            <p style={{ margin: 0, fontSize: '14.5px', color: 'var(--color-text-secondary)' }}>{fallbackBrand.voice}</p>
                                                        </div>
                                                    </div>

                                                    {/* Color palette */}
                                                    <div className="perplexity-dashboard-glass-box">
                                                        <h4 style={{ fontWeight: 900, marginBottom: '16px', color: '#ffffff' }}>{language === 'en' ? 'Hex Color Palette' : 'အရောင်အသွေး သတ်မှတ်ချက်'}</h4>
                                                        <div className="perplexity-dashboard-color-palette">
                                                            {[
                                                                { label: language === 'en' ? 'Primary Brand Color' : 'အဓိက အရောင်', hex: fallbackBrand.palette.primary },
                                                                { label: language === 'en' ? 'Secondary Accent' : 'တွဲဖက် အရောင်', hex: fallbackBrand.palette.secondary },
                                                                { label: language === 'en' ? 'Canvas Background' : 'နောက်ခံ အရောင်', hex: fallbackBrand.palette.background }
                                                            ].map((color, i) => (
                                                                <div key={i} className="perplexity-dashboard-color-item">
                                                                    <div
                                                                        className="perplexity-dashboard-color-swatch"
                                                                        style={{ backgroundColor: color.hex }}
                                                                    />
                                                                    <div>
                                                                        <p className="perplexity-dashboard-color-label">{color.label}</p>
                                                                        <code className="perplexity-dashboard-color-hex">{color.hex}</code>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Logo Concept */}
                                                    <div className="perplexity-dashboard-glass-box">
                                                        <h4 style={{ fontWeight: 900, marginBottom: '8px', color: '#ffffff', fontSize: '15.5px' }}>{language === 'en' ? 'Visual Logo Concept' : 'လိုဂို ပုံရိပ် Concept'}</h4>
                                                        <p style={{ margin: 0, fontSize: '14.5px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{fallbackBrand.logoConcept}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* 5. DIGITAL PRESENCE TAB */}
                                    {activeTab === 'digital' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                            {isEditing ? (
                                                <div className="perplexity-dashboard-glass-box-edit" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Proposed Tech Stack (comma separated)</label>
                                                        <input
                                                            type="text"
                                                            value={editDigitalStack}
                                                            onChange={(e) => setEditDigitalStack(e.target.value)}
                                                            className="input-text"
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Core Capabilities (comma separated)</label>
                                                        <input
                                                            type="text"
                                                            value={editDigitalFeatures}
                                                            onChange={(e) => setEditDigitalFeatures(e.target.value)}
                                                            className="input-text"
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>

                                                    {/* Wireframe Outline */}
                                                    <div>
                                                        <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '16px', color: '#ffffff' }}>{language === 'en' ? 'Landing Page Wireframe Elements' : 'ဝဘ်ဆိုက် Layout Wireframe အစိတ်အပိုင်းများ'}</h4>
                                                        <div className="perplexity-dashboard-wireframe-grid">
                                                            {fallbackDigital.landingPageOutline.map((sec, idx) => (
                                                                <div key={idx} className="perplexity-dashboard-wireframe-card">
                                                                    <div className="perplexity-dashboard-wireframe-header">
                                                                        <strong className="perplexity-dashboard-wireframe-section-id">{sec.section_id} {language === 'en' ? 'section' : 'အပိုင်း'}</strong>
                                                                        {sec.cta_text && sec.cta_text !== 'None' && (
                                                                            <span className="perplexity-dashboard-wireframe-cta">
                                                                                CTA: {sec.cta_text}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <h5 className="perplexity-dashboard-wireframe-title">{sec.title}</h5>
                                                                    <p className="perplexity-dashboard-wireframe-body">{sec.body}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Capabilities & Stack */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                                        <div className="perplexity-dashboard-glass-box">
                                                            <h4 style={{ fontWeight: 900, marginBottom: '14px', fontSize: '15.5px', color: '#ffffff' }}>Core Capabilities</h4>
                                                            <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--color-text-secondary)', listStyleType: 'circle' }}>
                                                                {fallbackDigital.features.map((feat, i) => <li key={i}>{feat}</li>)}
                                                            </ul>
                                                        </div>
                                                        <div className="perplexity-dashboard-glass-box">
                                                            <h4 style={{ fontWeight: 900, marginBottom: '14px', fontSize: '15.5px', color: '#ffffff' }}>Proposed Tech Stack</h4>
                                                            <div className="perplexity-dashboard-tech-stack-container">
                                                                {fallbackDigital.stack.map((tech, i) => (
                                                                    <span key={i} className="perplexity-dashboard-tech-pill">
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
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                            {isEditing ? (
                                                <div className="perplexity-dashboard-glass-box-edit" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Acquisition Channels (comma separated)</label>
                                                        <input
                                                            type="text"
                                                            value={editGrowthChannels}
                                                            onChange={(e) => setEditGrowthChannels(e.target.value)}
                                                            className="input-text"
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Acquisition Plan</label>
                                                        <textarea
                                                            value={editGrowthPlanText}
                                                            onChange={(e) => setEditGrowthPlanText(e.target.value)}
                                                            className="input-text"
                                                            style={{ width: '100%', minHeight: '130px', fontFamily: 'var(--font-inter)' }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Channels list */}
                                                    <div className="perplexity-dashboard-glass-box">
                                                        <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '14px', color: '#ffffff' }}>Acquisition Channels</h4>
                                                        <div className="perplexity-dashboard-growth-channels">
                                                            {fallbackGrowth.channels.map((chan, idx) => (
                                                                <span key={idx} className="perplexity-dashboard-channel-pill">
                                                                    {chan}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <p style={{ margin: '20px 0 0 0', fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                                                            {fallbackGrowth.acquisitionPlan}
                                                        </p>
                                                    </div>

                                                    {/* 90-day Roadmap list */}
                                                    <div>
                                                        <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px', color: '#ffffff' }}>First 90-Day Execution Roadmap</h4>
                                                        <div className="perplexity-dashboard-timeline">
                                                            {fallbackGrowth.roadmap90Day.map((step, idx) => {
                                                                const phaseTitle = idx === 0 ? 'Month 1' : (idx === 1 ? 'Month 2' : 'Month 3');
                                                                return (
                                                                    <div key={idx} style={{ position: 'relative' }}>
                                                                        {/* Timeline dot */}
                                                                        <div className="perplexity-dashboard-timeline-dot" />
                                                                        <div className="perplexity-dashboard-timeline-card">
                                                                            <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{phaseTitle}</span>
                                                                            <p style={{ margin: '8px 0 0 0', fontSize: '14.5px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
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
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </section>
    );
}
