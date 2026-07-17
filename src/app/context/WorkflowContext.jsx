'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  evaluateIdeaAsync,
  runRefinementAgent,
  runMarketResearchAgent,
  runFinanceAgent,
  runBrandAgent,
  runWebsiteAgent,
  runMarketingAgent,
  runBusinessAgent,
  runRefinementChatAgent
} from '../../agents/orchestrator';

const WorkflowContext = createContext();

const STARTUP_IDEA_KEY = 'agentic:startupIdea';
const BUSINESS_INFO_KEY = 'agentic:businessInfo';
const AUTH_KEY = 'agentic:isAuthenticated';

const DEFAULT_BUSINESS_INFO = {
  location: "Online-only",
  budget: "$1000",
  target_customers: "Billionare",
  business_type: "SaaS",
  experience_level: "Begineer",
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
    { name: "Executive Director Emily", role: "NPO Director", pain_points: ["Spends 20+ hours per grant proposal", "Lacks writing budget"], budget_limit: "$100/mo max" },
    { name: "Researcher Roger", role: "University Grant Applicant", pain_points: ["Compliance checklist overload", "Missed submission deadlines"], budget_limit: "$150/mo research budget" }
  ],
  markdown_deliverable: `# Market Intelligence Report: GrantFlow AI\n\n## Target Market & Personas\nGrantFlow AI targets small-to-medium non-profits, academic researchers, and social impact startups.\n\n### Ideal Customer Personas (ICPs)\n- **Executive Director Emily**: Manages a local community service non-profit. Spends 20+ hours per grant and has zero writing budget.\n- **Researcher Roger**: University researcher who deals with complex compliance requirements.\n\n## Competitor Mapping\n| Competitor | URL | Weakness |\n|---|---|---|\n| GrantWriter Pro | https://grantwriterpro.com | High pricing & templates only |\n| ProposalAI | https://proposalai.io | Generic copy, low compliance checks |\n| FundraisingHub | Not Publicly Available | Focuses on donation CRMs, not writing |\n\n## Market Trends & Opportunities\n- Growth in government micro-grants.\n- Increasing demand for low-cost automated proposal writers.\n- Saturation Level: **25%** (Low-medium market penetration).`
};

const DEFAULT_FINANCE_FALLBACK = {
  costBreakdown: [
    { item: "Gemini API token costs", cost: 120 },
    { item: "Hosting & Server infrastructure", cost: 80 },
    { item: "Domain & SSL registration", cost: 15 },
    { item: "Customer support software license", cost: 35 },
    { item: "Basic marketing and ads", cost: 250 }
  ],
  revenueForecast: "$5,000 monthly recurring revenue (MRR) projected in Month 6.",
  pricingStrategy: "Tiered subscription model: Standard ($49/mo) and Premium ($99/mo) with credits-based drafting caps.",
  breakevenMonth: 4,
  markdown_deliverable: `# Financial Model & Projections: GrantFlow AI\n\n## Startup Capital Allocation\nBelow is the itemized budget allocation mapping back to our $1,000 setup limit:\n\n| Expense Item | Monthly Cost ($) |\n|---|---|\n| Gemini API token costs | $120.00 |\n| Hosting & Server infrastructure | $80.00 |\n| Domain & SSL registration | $15.00 |\n| Customer support software | $35.00 |\n| Marketing campaigns | $250.00 |\n| **Total Estimated Run-rate** | **$500.00/mo** |\n\n## Revenue Forecast\n- Projecting **Month 4 Breakeven**.\n- Targeting 100 active non-profit subscribers by Month 6 ($5,000 MRR).\n\n## Pricing Strategy\n- **Standard Plan**: $49/mo (up to 3 proposals monthly)\n- **Premium Plan**: $99/mo (unlimited proposals & compliance checking)`
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
  const [rawUserIdea, setRawUserIdea] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(DEFAULT_BUSINESS_INFO);
  
  // Agent outputs
  const [refinedConcept, setRefinedConcept] = useState(null);
  const [marketResearch, setMarketResearch] = useState(null);
  const [financeModel, setFinanceModel] = useState(null);
  const [brandPackage, setBrandPackage] = useState(null);
  const [digitalPresence, setDigitalPresence] = useState(null);
  const [growthPlan, setGrowthPlan] = useState(null);
  const [businessPlan, setBusinessPlan] = useState(null);

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

    // Force auth active for this agentic workflow
    localStorage.setItem(AUTH_KEY, 'true');
  }, []);

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
      refinedResult = await runRefinementAgent(rawUserIdea, businessInfo, key);
      setRefinedConcept(refinedResult);
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
      const researchResult = await runMarketResearchAgent(refinedResult, businessInfo, key);
      setMarketResearch(researchResult);
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
        const result = await runFinanceAgent(refinedConcept, businessInfo, marketResearch, key);
        setFinanceModel(result);
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
        const result = await runBrandAgent(refinedConcept, businessInfo, key);
        setBrandPackage(result);
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
        const result = await runWebsiteAgent(refinedConcept, businessInfo, brandPackage || { palette: { primary: '#1b0624', secondary: '#aeec1d' }, names: ['Brand'] }, key);
        setDigitalPresence(result);
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
        const result = await runMarketingAgent(refinedConcept, businessInfo, marketResearch, key);
        setGrowthPlan(result);
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
        key
      );

      setBusinessPlan(bizPlanResult);
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
      const response = await runRefinementChatAgent(userMessage, currentBlueprint, businessInfo, key);
      
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
        key
      );
      setBusinessPlan(bizPlanResult);

      return response.reply_message;
    } catch (err) {
      console.error("Refinement Chat failed:", err);
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
      refinedConcept,
      marketResearch,
      financeModel,
      brandPackage,
      digitalPresence,
      growthPlan,
      businessPlan,
      setFinanceModel,
      setBrandPackage,
      setDigitalPresence,
      setGrowthPlan,
      setBusinessPlan,
      setRefinedConcept,
      agentProgress,
      agentThinking,
      activeStep,
      setActiveStep,
      runSequentialPlanning,
      runParallelSpecializedPlanning,
      executeRefinementChat,
      resetWorkflow
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
