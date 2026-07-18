'use client';

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from './LanguageContext';
import {
  evaluateIdeaAsync,
  runRefinementAgent,
  runMarketResearchAgent,
  runFinanceAgent,
  runBrandAgent,
  runWebsiteAgent,
  runMarketingAgent,
  runBusinessAgent,
  runRefinementChatAgent,
  runOnboardingAgent
} from '../../agents/orchestrator';

const WorkflowContext = createContext();

const STARTUP_IDEA_KEY = 'agentic:startupIdea';
const BUSINESS_INFO_KEY = 'agentic:businessInfo';
const AUTH_KEY = 'agentic:isAuthenticated';
const CURRENT_IDEA_ID_KEY = 'agentic:currentIdeaId';

const DEFAULT_BUSINESS_INFO = {
  location: "Yangon, Myanmar",
  target_country: "Myanmar",
  budget: "3,000,000 MMK",
  target_customers: "Billionare",
  business_type: "SaaS",
  experience_level: "Beginner",
  goal: "local",
  core_painpoint: "Small to medium-sized non-profit organizations (NPOs) and independent researchers spend hundreds of hours annually searching for and writing grant proposals. They often lack the budget to hire full-time, specialized grant writers, which leads to high rejection rates caused by minor compliance errors, missed deadlines, or poorly structured narratives.",
  launch_timeline: "3 months",
  revenue_stream: "Subscription"
};

const DEFAULT_STARTUP_IDEA = "GrantFlow AI is a specialized Software-as-a-Service (SaaS) platform that streamlines the entire grant acquisition process. Users upload their organization's historical impact data, financial needs, and project goals. The platform then automatically drafts highly tailored, compelling, and fully compliant grant proposals in a fraction of the time.";

const DEFAULT_CONCEPT_FALLBACK = {
  concept: "GrantFlow AI is a specialized Software-as-a-Service (SaaS) platform that streamlines the entire grant acquisition process. Users upload their organization's historical impact data, financial needs, and project goals. The platform then automatically drafts highly tailored, compelling, and fully compliant grant proposals.",
  improved_summary: "Tailored grant proposals drafted in minutes for non-profits.",
  key_differentiators: [
    "NLP matching engines checking compliance criteria against strict grant guidelines.",
    "Historical narrative compiler mapping past impact benchmarks into structured paragraphs.",
    "Budget-to-proposal compiler automatically formatting cost tables to grant specifications."
  ],
  target_audience_refined: "Small-to-medium non-profits (NPOs), academic researchers, and social impact startups without full-time grant writers."
};

const DEFAULT_MARKET_FALLBACK = {
  tam: "5,400,000,000 MMK TAM",
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

const DEFAULT_FINANCE_FALLBACK = {
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

const DEFAULT_BRAND_FALLBACK = {
  names: ["GrantFlow AI", "ProposalLift", "FundForge", "BidDraft", "NarrateGrant"],
  tagline: "Tailored grant proposals drafted in minutes.",
  voice: "Empathetic, structured, professional, and compliant.",
  palette: { primary: "#1b0624", secondary: "#aeec1d", background: "#ffffff" },
  logoConcept: "A stylized feather quill that transitions into a rising network bar graph, representing written proposals leading to business growth.",
  markdown_deliverable: `# Brand Identity & Style Guide: GrantFlow AI\n\n## Brand Naming Suggestions\n1. **GrantFlow AI** (Primary suggestion)\n2. **ProposalLift**\n3. **FundForge**\n4. **BidDraft**\n5. **NarrateGrant**\n\n## Brand Voice Guidelines\n- **Empathetic**: Recognizing NPOs' lack of resources.\n- **Structured & Compliant**: Focused on precision and guidelines compliance.\n\n## Visual Guidelines\n- **Primary Color**: \`#1b0624\` (Minimalist dark purple)\n- **Secondary Accent**: \`#aeec1d\` (Neon lime green)\n- **Background**: \`#ffffff\` (Pure white)\n- **Typography**: Display headings in sans-serif, body copy in Inter.\n\n## Logo Concept\nA minimalist quill combined with an upward-trending bar graph icon.`
};

const DEFAULT_DIGITAL_FALLBACK = {
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

const DEFAULT_MARKETING_FALLBACK = {
  channels: ["Organic Search / SEO", "B2B Non-Profit Partnerships", "Strategic Cold Outreach"],
  acquisitionPlan: "Optimize SEO around keywords like 'nonprofit grant writer' and 'write microgrant proposal'. Partner directly with non-profit incubators and research labs to offer early pilot credits.",
  roadmap90Day: [
    "Days 1-30: Launch MVP and secure 5 non-profit alpha testers to build case studies.",
    "Days 31-60: Index blog posts for search traffic and run email campaigns targeting local foundations.",
    "Days 61-90: Scale platform to premium subscription pricing and recruit affiliate partners."
  ],
  markdown_deliverable: `# Growth & Marketing Plan: GrantFlow AI\n\n## Acquisition Channels\n1. **Organic Search / SEO**: Target keywords targeting non-profit grant writing tips.\n2. **NPO Partnerships**: Partner with incubator programs.\n3. **Direct Email Outreach**: Target directors of foundation portals.\n\n## Launch Roadmap (First 90 Days)\n- **Phase 1 (Days 1-30)**: Alpha launch with 5 test non-profits. Collect compliance case studies.\n- **Phase 2 (Days 31-60)**: Push organic content articles. Run outreach sequences.\n- **Phase 3 (Days 61-90)**: Open paid tiers. Scale via partner affiliates.`
};

export function WorkflowProvider({ children }) {
  const supabase = useMemo(() => createClient(), []);
  const { language } = useLanguage();
  const [rawUserIdea, setRawUserIdea] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(DEFAULT_BUSINESS_INFO);
  const [currentIdeaId, setCurrentIdeaId] = useState(null);
  const [onboardingChatHistory, setOnboardingChatHistory] = useState([]);
  const [onboardingProgress, setOnboardingProgress] = useState(0);
  
  // Agent outputs
  const [refinedConcept, setRefinedConcept] = useState(null);
  const [marketResearch, setMarketResearch] = useState(null);
  const [financeModel, setFinanceModel] = useState(null);
  const [brandPackage, setBrandPackage] = useState(null);
  const [digitalPresence, setDigitalPresence] = useState(null);
  const [growthPlan, setGrowthPlan] = useState(null);
  const [businessPlan, setBusinessPlan] = useState(null);
  const [verifiedBlueprint, setVerifiedBlueprint] = useState(null);

  // Flow statuses
  const [agentProgress, setAgentProgress] = useState({
    refinement: 'idle',
    market: 'idle',
    finance: 'idle',
    brand: 'idle',
    website: 'idle',
    marketing: 'idle',
    business: 'idle'
  });

  const [agentThinking, setAgentThinking] = useState({
    refinement: [],
    market: [],
    finance: [],
    brand: [],
    website: [],
    marketing: [],
    business: []
  });

  const [activeStep, setActiveStep] = useState('idea');

  // Hydrate states from localStorage on mount
  useEffect(() => {
    // Idea concept
    const savedIdea = localStorage.getItem(STARTUP_IDEA_KEY);
    if (savedIdea) {
      setRawUserIdea(savedIdea);
    } else {
      localStorage.setItem(STARTUP_IDEA_KEY, DEFAULT_STARTUP_IDEA);
      setRawUserIdea(DEFAULT_STARTUP_IDEA);
    }

    // Business questionnaire info
    const savedInfo = localStorage.getItem(BUSINESS_INFO_KEY);
    if (savedInfo) {
      try {
        setBusinessInfo(JSON.parse(savedInfo));
      } catch (e) {
        console.error("Error parsing stored businessInfo:", e);
      }
    } else {
      localStorage.setItem(BUSINESS_INFO_KEY, JSON.stringify(DEFAULT_BUSINESS_INFO));
      setBusinessInfo(DEFAULT_BUSINESS_INFO);
    }

    // Verified Blueprint
    const savedBlueprint = localStorage.getItem('agentic:verifiedBlueprint');
    if (savedBlueprint) {
      try {
        setVerifiedBlueprint(JSON.parse(savedBlueprint));
      } catch (e) {
        console.error("Error parsing stored verifiedBlueprint:", e);
      }
    }

    // Force auth active for this agentic workflow
    localStorage.setItem(AUTH_KEY, 'true');

    const savedIdeaId = localStorage.getItem(CURRENT_IDEA_ID_KEY);
    if (savedIdeaId) {
      setCurrentIdeaId(savedIdeaId);
    }
  }, []);

  const updateVerifiedBlueprint = (data) => {
    if (data) {
      localStorage.setItem('agentic:verifiedBlueprint', JSON.stringify(data));
    } else {
      localStorage.removeItem('agentic:verifiedBlueprint');
    }
    setVerifiedBlueprint(data);
  };

  const updateCurrentIdeaId = (ideaId) => {
    if (ideaId) {
      localStorage.setItem(CURRENT_IDEA_ID_KEY, ideaId);
    } else {
      localStorage.removeItem(CURRENT_IDEA_ID_KEY);
    }

    setCurrentIdeaId(ideaId);
  };

  const persistAgentOutput = async (table, output, mapOutput) => {
    const ideaId = currentIdeaId || localStorage.getItem(CURRENT_IDEA_ID_KEY);

    if (!ideaId) {
      console.warn(`Skipping ${table} save because no current idea id is set.`);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        console.warn(`Skipping ${table} save because no authenticated user was found.`);
        return;
      }

      const payload = {
        idea_id: ideaId,
        user_id: user.id,
        ...mapOutput(output),
        raw_output: output
      };

      const { error } = await supabase.from(table).insert(payload);
      if (error) {
        console.error(`Failed to save ${table}:`, error);
      }
    } catch (err) {
      console.error(`Failed to persist agent output for ${table}:`, err);
    }
  };

  const addThinkingLog = (agentKey, message) => {
    setAgentThinking(prev => ({
      ...prev,
      [agentKey]: [...prev[agentKey], `[${new Date().toLocaleTimeString()}] ${message}`]
    }));
  };

  const getApiKey = () => {
    return process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
  };

  const runSequentialPlanning = async () => {
    const key = getApiKey();
    setAgentProgress(prev => ({ ...prev, refinement: 'running', market: 'pending' }));
    setAgentThinking(prev => ({ ...prev, refinement: [], market: [] }));

    // --- 1. REFINEMENT AGENT ---
    addThinkingLog('refinement', 'Starting concept synthesis analysis...');
    await new Promise(r => setTimeout(r, 600));
    addThinkingLog('refinement', 'Synthesizing raw pitch with questionnaire data...');
    await new Promise(r => setTimeout(r, 800));
    addThinkingLog('refinement', 'Formulating core customer segment value proposition...');

    let refinedResult;
    try {
      refinedResult = await runRefinementAgent(rawUserIdea, businessInfo, key, language);
      setRefinedConcept(refinedResult);
      await persistAgentOutput('agent_refinements', refinedResult, (output) => ({
        thinking: output.thinking,
        concept: output.concept,
        improved_summary: output.improved_summary,
        key_differentiators: output.key_differentiators,
        target_audience_refined: output.target_audience_refined
      }));
      addThinkingLog('refinement', `Thinking Process: ${refinedResult.thinking}`);
      addThinkingLog('refinement', 'Concept successfully refined. Improved Summary generated.');
      setAgentProgress(prev => ({ ...prev, refinement: 'completed', market: 'running' }));
    } catch (err) {
      console.error(err);
      addThinkingLog('refinement', `Error during refinement: ${err.message}`);
      setAgentProgress(prev => ({ ...prev, refinement: 'failed' }));
      return false;
    }

    // --- 2. MARKET RESEARCH AGENT ---
    addThinkingLog('market', 'Initializing competitor mapping algorithms...');
    await new Promise(r => setTimeout(r, 800));
    addThinkingLog('market', 'Searching for active players in the sector...');
    await new Promise(r => setTimeout(r, 1000));
    addThinkingLog('market', 'Analyzing saturation index & target segment demographics...');

    try {
      const researchResult = await runMarketResearchAgent(refinedResult, businessInfo, key, language);
      setMarketResearch(researchResult);
      await persistAgentOutput('agent_market_research', researchResult, (output) => ({
        thinking: output.thinking,
        markdown_deliverable: output.markdown_deliverable,
        tam: output.tam,
        competitors: output.competitors,
        opportunities: output.opportunities,
        saturation_level: output.saturation_level,
        target_personas: output.target_personas
      }));
      addThinkingLog('market', `Thinking Process: ${researchResult.thinking}`);
      addThinkingLog('market', `TAM calculated: ${researchResult.tam}. Saturation index set.`);
      setAgentProgress(prev => ({ ...prev, market: 'completed' }));
      return true;
    } catch (err) {
      console.error(err);
      addThinkingLog('market', `Error during market research: ${err.message}`);
      setAgentProgress(prev => ({ ...prev, market: 'failed' }));
      return false;
    }
  };

  const runParallelSpecializedPlanning = async () => {
    const key = getApiKey();
    setAgentProgress(prev => ({
      ...prev,
      finance: 'running',
      brand: 'running',
      website: 'running',
      marketing: 'running',
      business: 'pending'
    }));

    setAgentThinking(prev => ({
      ...prev,
      finance: [],
      brand: [],
      website: [],
      marketing: [],
      business: []
    }));

    // Local timing log simulations for each agent running in parallel
    const runFinanceSim = async () => {
      addThinkingLog('finance', 'Analyzing initial capital setup cost list...');
      await new Promise(r => setTimeout(r, 800));
      addThinkingLog('finance', 'Verifying expense allocations conform to user budget...');
      await new Promise(r => setTimeout(r, 1200));
      addThinkingLog('finance', 'Determining proposed customer pricing tiers...');
      await new Promise(r => setTimeout(r, 1000));
      addThinkingLog('finance', 'Simulating monthly breakeven timeline metrics...');
      
      try {
        const result = await runFinanceAgent(refinedConcept || DEFAULT_CONCEPT_FALLBACK, businessInfo, marketResearch || DEFAULT_MARKET_FALLBACK, key, language);
        setFinanceModel(result);
        await persistAgentOutput('agent_finance_models', result, (output) => ({
          thinking: output.thinking,
          markdown_deliverable: output.markdown_deliverable,
          cost_breakdown: output.costBreakdown,
          revenue_forecast: output.revenueForecast,
          pricing_strategy: output.pricingStrategy,
          breakeven_month: output.breakevenMonth
        }));
        addThinkingLog('finance', `Thinking Process: ${result.thinking}`);
        addThinkingLog('finance', 'Financial model synthesized successfully.');
        setAgentProgress(prev => ({ ...prev, finance: 'completed' }));
        return result;
      } catch (err) {
        console.error(err);
        addThinkingLog('finance', `Error during financial planning: ${err.message}`);
        setAgentProgress(prev => ({ ...prev, finance: 'failed' }));
        throw err;
      }
    };

    const runBrandSim = async () => {
      addThinkingLog('brand', 'Brainstorming unique short-form names...');
      await new Promise(r => setTimeout(r, 600));
      addThinkingLog('brand', 'Checking candidate names against tone of voice rules...');
      await new Promise(r => setTimeout(r, 1400));
      addThinkingLog('brand', 'Generating color palettes matching minimalist dark styles...');
      await new Promise(r => setTimeout(r, 900));
      addThinkingLog('brand', 'Formulating visual branding tagline options...');
      
      try {
        const result = await runBrandAgent(refinedConcept || DEFAULT_CONCEPT_FALLBACK, businessInfo, key, language);
        setBrandPackage(result);
        await persistAgentOutput('agent_brand_packages', result, (output) => ({
          thinking: output.thinking,
          markdown_deliverable: output.markdown_deliverable,
          names: output.names,
          tagline: output.tagline,
          voice: output.voice,
          palette: output.palette,
          logo_concept: output.logoConcept
        }));
        addThinkingLog('brand', `Thinking Process: ${result.thinking}`);
        addThinkingLog('brand', 'Brand guidelines and assets successfully resolved.');
        setAgentProgress(prev => ({ ...prev, brand: 'completed' }));
        return result;
      } catch (err) {
        console.error(err);
        addThinkingLog('brand', `Error during brand planning: ${err.message}`);
        setAgentProgress(prev => ({ ...prev, brand: 'failed' }));
        throw err;
      }
    };

    const runWebsiteSim = async () => {
      addThinkingLog('website', 'Creating wireframe elements for landing page sections...');
      await new Promise(r => setTimeout(r, 1100));
      addThinkingLog('website', 'Drafting copywriting tailored to the brand tone...');
      await new Promise(r => setTimeout(r, 1000));
      addThinkingLog('website', 'Detailing key application feature scopes...');
      await new Promise(r => setTimeout(r, 800));
      addThinkingLog('website', 'Selecting recommended technical stack components...');
      
      try {
        const result = await runWebsiteAgent(refinedConcept || DEFAULT_CONCEPT_FALLBACK, businessInfo, brandPackage || { palette: { primary: '#1b0624', secondary: '#aeec1d' }, names: ['Brand'] }, key, language);
        setDigitalPresence(result);
        await persistAgentOutput('agent_digital_presence', result, (output) => ({
          thinking: output.thinking,
          markdown_deliverable: output.markdown_deliverable,
          landing_page_outline: output.landingPageOutline,
          features: output.features,
          stack: output.stack
        }));
        addThinkingLog('website', `Thinking Process: ${result.thinking}`);
        addThinkingLog('website', 'Website structure and design specifications compiled.');
        setAgentProgress(prev => ({ ...prev, website: 'completed' }));
        return result;
      } catch (err) {
        console.error(err);
        addThinkingLog('website', `Error during website planning: ${err.message}`);
        setAgentProgress(prev => ({ ...prev, website: 'failed' }));
        throw err;
      }
    };

    const runMarketingSim = async () => {
      addThinkingLog('marketing', 'Formulating core customer acquisition strategy...');
      await new Promise(r => setTimeout(r, 900));
      addThinkingLog('marketing', 'Prioritizing organic content and growth hack channels...');
      await new Promise(r => setTimeout(r, 1300));
      addThinkingLog('marketing', 'Mapping launch milestones for marketing pipeline...');
      await new Promise(r => setTimeout(r, 700));
      addThinkingLog('marketing', 'Structuring first 90-day roadmap phases...');
      
      try {
        const result = await runMarketingAgent(refinedConcept || DEFAULT_CONCEPT_FALLBACK, businessInfo, marketResearch || DEFAULT_MARKET_FALLBACK, key, language);
        setGrowthPlan(result);
        await persistAgentOutput('agent_growth_plans', result, (output) => ({
          thinking: output.thinking,
          markdown_deliverable: output.markdown_deliverable,
          channels: output.channels,
          acquisition_plan: output.acquisitionPlan,
          roadmap_90_day: output.roadmap90Day
        }));
        addThinkingLog('marketing', `Thinking Process: ${result.thinking}`);
        addThinkingLog('marketing', 'Launch growth plan successfully structured.');
        setAgentProgress(prev => ({ ...prev, marketing: 'completed' }));
        return result;
      } catch (err) {
        console.error(err);
        addThinkingLog('marketing', `Error during marketing planning: ${err.message}`);
        setAgentProgress(prev => ({ ...prev, marketing: 'failed' }));
        throw err;
      }
    };

    try {
      // Execute the 4 specialized agents in parallel
      const [financeRes, brandRes, websiteRes, marketingRes] = await Promise.all([
        runFinanceSim(),
        runBrandSim(),
        runWebsiteSim(),
        runMarketingSim()
      ]);

      // --- 5. BUSINESS PLAN AGENT (INTEGRATOR) ---
      setAgentProgress(prev => ({ ...prev, business: 'running' }));
      addThinkingLog('business', 'Initiating blueprint details integration...');
      await new Promise(r => setTimeout(r, 800));
      addThinkingLog('business', 'Consolidating finance, marketing, and web layout data...');
      await new Promise(r => setTimeout(r, 1200));
      addThinkingLog('business', 'Assembling standard 9-box Lean Canvas layout...');

      const bizPlanResult = await runBusinessAgent(
        refinedConcept,
        marketResearch,
        financeRes,
        brandRes,
        websiteRes,
        marketingRes,
        key,
        language
      );

      setBusinessPlan(bizPlanResult);
      await persistAgentOutput('agent_business_plans', bizPlanResult, (output) => ({
        thinking: output.thinking,
        lean_canvas_markdown: output.lean_canvas_markdown
      }));
      addThinkingLog('business', `Thinking Process: ${bizPlanResult.thinking}`);
      addThinkingLog('business', 'Lean Canvas compilation completed.');
      setAgentProgress(prev => ({ ...prev, business: 'completed' }));
      return true;
    } catch (err) {
      console.error("Parallel execution or integration failed:", err);
      setAgentProgress(prev => ({ ...prev, business: 'failed' }));
      return false;
    }
  };

  const updateStartupIdea = (idea) => {
    localStorage.setItem(STARTUP_IDEA_KEY, idea);
    setRawUserIdea(idea);
  };

  const updateBusinessInfo = (info) => {
    localStorage.setItem(BUSINESS_INFO_KEY, JSON.stringify(info));
    setBusinessInfo(info);
  };

  const updateFinanceModelDirect = async (updatedFinance) => {
    setFinanceModel(updatedFinance);
    await persistAgentOutput('agent_finance_models', updatedFinance, (output) => ({
      thinking: output.thinking || '',
      markdown_deliverable: output.markdown_deliverable || '',
      cost_breakdown: output.costBreakdown || [],
      revenue_forecast: output.revenueForecast || '',
      pricing_strategy: output.pricingStrategy || '',
      breakeven_month: output.breakevenMonth || 0
    }));
  };

  const updateMarketResearchDirect = async (updatedMarket) => {
    setMarketResearch(updatedMarket);
    await persistAgentOutput('agent_market_research', updatedMarket, (output) => ({
      thinking: output.thinking || '',
      markdown_deliverable: output.markdown_deliverable || '',
      tam: output.tam || '',
      competitors: output.competitors || [],
      opportunities: output.opportunities || [],
      saturation_level: output.saturation_level || 0,
      target_personas: output.target_personas || []
    }));
  };

  const updateBrandPackageDirect = async (updatedBrand) => {
    setBrandPackage(updatedBrand);
    await persistAgentOutput('agent_brand_packages', updatedBrand, (output) => ({
      thinking: output.thinking || '',
      markdown_deliverable: output.markdown_deliverable || '',
      names: output.names || [],
      tagline: output.tagline || '',
      voice: output.voice || '',
      palette: output.palette || {},
      logo_concept: output.logoConcept || ''
    }));
  };

  const updateDigitalPresenceDirect = async (updatedDigital) => {
    setDigitalPresence(updatedDigital);
    await persistAgentOutput('agent_digital_presence', updatedDigital, (output) => ({
      thinking: output.thinking || '',
      markdown_deliverable: output.markdown_deliverable || '',
      landing_page_outline: output.landingPageOutline || [],
      features: output.features || [],
      stack: output.stack || []
    }));
  };

  const updateGrowthPlanDirect = async (updatedGrowth) => {
    setGrowthPlan(updatedGrowth);
    await persistAgentOutput('agent_growth_plans', updatedGrowth, (output) => ({
      thinking: output.thinking || '',
      markdown_deliverable: output.markdown_deliverable || '',
      channels: output.channels || [],
      acquisition_plan: output.acquisitionPlan || '',
      roadmap_90_day: output.roadmap90Day || []
    }));
  };

  const triggerRediscovery = async (changedModelName) => {
    const key = getApiKey();
    
    let currentRefined = refinedConcept || DEFAULT_CONCEPT_FALLBACK;
    let currentMarket = marketResearch || DEFAULT_MARKET_FALLBACK;
    let currentFinance = financeModel || DEFAULT_FINANCE_FALLBACK;
    let currentBrand = brandPackage || DEFAULT_BRAND_FALLBACK;
    let currentDigital = digitalPresence || DEFAULT_DIGITAL_FALLBACK;
    let currentGrowth = growthPlan || DEFAULT_MARKETING_FALLBACK;

    addThinkingLog('business', `Triggering rediscovery cascade from updated ${changedModelName} model...`);

    try {
      if (changedModelName === 'market') {
        addThinkingLog('finance', 'Market demographics updated. Re-running financial estimates...');
        const newFinance = await runFinanceAgent(currentRefined, businessInfo, currentMarket, key, language);
        setFinanceModel(newFinance);
        currentFinance = newFinance;

        addThinkingLog('marketing', 'Market opportunities updated. Re-evaluating customer acquisition channels...');
        const newGrowth = await runMarketingAgent(currentRefined, businessInfo, currentMarket, key, language);
        setGrowthPlan(newGrowth);
        currentGrowth = newGrowth;
      }

      if (changedModelName === 'brand') {
        addThinkingLog('website', 'Brand name or colors changed. Re-running landing page architecture...');
        const newDigital = await runWebsiteAgent(currentRefined, businessInfo, currentBrand, key, language);
        setDigitalPresence(newDigital);
        currentDigital = newDigital;
      }

      addThinkingLog('business', 'Integrating all modified properties into updated Lean Canvas...');
      const bizPlanResult = await runBusinessAgent(
        currentRefined,
        currentMarket,
        currentFinance,
        currentBrand,
        currentDigital,
        currentGrowth,
        key,
        language
      );

      setBusinessPlan(bizPlanResult);
      await persistAgentOutput('agent_business_plans', bizPlanResult, (output) => ({
        thinking: output.thinking,
        lean_canvas_markdown: output.lean_canvas_markdown
      }));

      addThinkingLog('business', 'Rediscovery successfully synchronized and persisted.');
      return true;
    } catch (err) {
      console.error("Rediscovery failed:", err);
      addThinkingLog('business', `Rediscovery error: ${err.message}`);
      return false;
    }
  };


  const executeRefinementChat = async (userMessage) => {
    const key = getApiKey();
    const currentBlueprint = {
      financeModel: financeModel || DEFAULT_FINANCE_FALLBACK,
      marketResearch: marketResearch || DEFAULT_MARKET_FALLBACK,
      brandPackage: brandPackage || DEFAULT_BRAND_FALLBACK,
      digitalPresence: digitalPresence || DEFAULT_DIGITAL_FALLBACK,
      growthPlan: growthPlan || DEFAULT_MARKETING_FALLBACK
    };

    try {
      const response = await runRefinementChatAgent(userMessage, currentBlueprint, businessInfo, key, language);
      
      if (response.updated_financeModel) setFinanceModel(response.updated_financeModel);
      if (response.updated_marketResearch) setMarketResearch(response.updated_marketResearch);
      if (response.updated_brandPackage) setBrandPackage(response.updated_brandPackage);
      if (response.updated_digitalPresence) setDigitalPresence(response.updated_digitalPresence);
      if (response.updated_growthPlan) setGrowthPlan(response.updated_growthPlan);

      // Re-run business agent to update Lean Canvas
      const bizPlanResult = await runBusinessAgent(
        refinedConcept || DEFAULT_CONCEPT_FALLBACK,
        response.updated_marketResearch,
        response.updated_financeModel,
        response.updated_brandPackage,
        response.updated_digitalPresence,
        response.updated_growthPlan,
        key,
        language
      );
      setBusinessPlan(bizPlanResult);

      return response.reply_message;
    } catch (err) {
      console.error("Refinement Chat failed:", err);
      throw err;
    }
  };

  const executeOnboardingChat = async (userMessage, location, category) => {
    const key = getApiKey();
    try {
      const response = await runOnboardingAgent(userMessage, onboardingChatHistory, location, category, key, language);
      
      const newHistory = [
        ...onboardingChatHistory,
        { role: 'user', content: userMessage }
      ];
      if (response.reply_message) {
          newHistory.push({ role: 'model', content: response.reply_message });
      }
      
      setOnboardingChatHistory(newHistory);

      if (response.requirements_met_count !== undefined) {
          setOnboardingProgress(response.requirements_met_count);
      }

      if (response.is_complete) {
        updateStartupIdea(response.startup_idea_summary);
        updateBusinessInfo(response.business_info_payload);
      }

      return response;
    } catch (err) {
      console.error("Onboarding Chat failed:", err);
      throw err;
    }
  };

  const resetWorkflow = () => {
    setValidationResult(null);
    setRefinedConcept(null);
    setMarketResearch(null);
    setFinanceModel(null);
    setBrandPackage(null);
    setDigitalPresence(null);
    setGrowthPlan(null);
    setBusinessPlan(null);
    updateCurrentIdeaId(null);
    
    // Clear onboarding state
    setOnboardingChatHistory([]);
    setOnboardingProgress(0);
    
    // Clear idea and business info state and storage
    setRawUserIdea('');
    setBusinessInfo(DEFAULT_BUSINESS_INFO);
    localStorage.removeItem(STARTUP_IDEA_KEY);
    localStorage.removeItem(BUSINESS_INFO_KEY);

    setAgentProgress({
      refinement: 'idle',
      market: 'idle',
      finance: 'idle',
      brand: 'idle',
      website: 'idle',
      marketing: 'idle',
      business: 'idle'
    });
    setAgentThinking({
      refinement: [],
      market: [],
      finance: [],
      brand: [],
      website: [],
      marketing: [],
      business: []
    });
    setActiveStep('idea');
  };

  return (
    <WorkflowContext.Provider value={{
      rawUserIdea,
      updateStartupIdea,
      validationResult,
      setValidationResult,
      businessInfo,
      updateBusinessInfo,
      currentIdeaId,
      updateCurrentIdeaId,
      refinedConcept,
      marketResearch,
      financeModel,
      brandPackage,
      digitalPresence,
      growthPlan,
      businessPlan,
      verifiedBlueprint,
      updateVerifiedBlueprint,
      setFinanceModel,
      setBrandPackage,
      setDigitalPresence,
      setGrowthPlan,
      setBusinessPlan,
      setRefinedConcept,
      setMarketResearch,
      agentProgress,
      agentThinking,
      activeStep,
      setActiveStep,
      runSequentialPlanning,
      runParallelSpecializedPlanning,
      executeRefinementChat,
      executeOnboardingChat,
      onboardingChatHistory,
      setOnboardingChatHistory,
      onboardingProgress,
      setOnboardingProgress,
      resetWorkflow,
      updateFinanceModelDirect,
      updateMarketResearchDirect,
      updateBrandPackageDirect,
      updateDigitalPresenceDirect,
      updateGrowthPlanDirect,
      triggerRediscovery
    }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}
