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
  runOnboardingAgent,
  runAgenticUpdateAgent
} from '../../agents/orchestrator';

const WorkflowContext = createContext();

const STARTUP_IDEA_KEY = 'agentic:startupIdea';
const BUSINESS_INFO_KEY = 'agentic:businessInfo';
const AUTH_KEY = 'agentic:isAuthenticated';
const CURRENT_IDEA_ID_KEY = 'agentic:currentIdeaId';

const DEFAULT_BUSINESS_INFO = {
  location: "Yangon, Myanmar",
  target_country: "Myanmar",
  budget: "8,000,000 MMK",
  target_customers: "High School Students, University Undergrads & Parents across Myanmar",
  business_type: "EdTech / SaaS",
  experience_level: "Intermediate",
  goal: "local",
  core_painpoint: "High private tuition costs and limited access to quality educators outside major cities leave students struggling with complex subjects and exam preparations without 24/7 support.",
  launch_timeline: "6 months",
  revenue_stream: "Freemium & Monthly Subscription"
};

const DEFAULT_STARTUP_IDEA = "EduBot Myanmar is an AI-powered EdTech platform that provides bilingual (Burmese-English) 24/7 tutoring, interactive courses, and personalized learning paths for high school and university students across Myanmar.";

const DEFAULT_CONCEPT_FALLBACK = {
  concept: "EduBot Myanmar is an AI-powered EdTech platform that provides bilingual (Burmese-English) 24/7 tutoring, interactive courses, and personalized learning paths for high school and university students across Myanmar.",
  improved_summary: "24/7 bilingual AI tutoring and exam practice customized for Myanmar students.",
  key_differentiators: [
    "AI matching engine tailored specifically for high school curricula and university entrance exams.",
    "Bilingual (Burmese-English) step-by-step problem solver eliminating language barriers.",
    "Gamified practice tests with instant feedback designed for local study behavior."
  ],
  target_audience_refined: "High School Students, University Undergrads & Parents across Myanmar."
};

const DEFAULT_MARKET_FALLBACK = {
  tam: "45,000,000,000 MMK TAM",
  saturation_level: 28,
  competitors: [
    { name: "Traditional Offline Tuition Centers", url: "Offline Centers", weakness: "Extremely expensive (200k-500k MMK/mo) and rigid schedules." },
    { name: "Generic Global AI Chatbots", url: "https://chatgpt.com", weakness: "Lacks Myanmar curriculum alignment and Burmese pedagogical explanations." },
    { name: "Recorded Video Platforms", url: "https://myanlearn.com", weakness: "One-way video lectures with zero interactive Q&A or instant feedback." }
  ],
  opportunities: [
    "Growing smartphone and mobile data adoption among Myanmar youth seeking self-study alternatives.",
    "Parents looking for affordable high-quality tutoring during economic inflation.",
    "Integration of interactive AI practice with local matriculation exam preparation."
  ],
  target_personas: [
    { name: "Student Min Thant", role: "Grade 11 Exam Candidate", pain_points: ["Struggling with Physics & Math without evening tutor access"], budget_limit: "25,000 MMK/mo subscription" },
    { name: "Parent Daw Hla", role: "Working Mother", pain_points: ["Cannot afford 300,000 MMK monthly private tuition fees"], budget_limit: "50,000 MMK/mo family budget" }
  ],
  markdown_deliverable: `# Market Intelligence Report: EduBot Myanmar\n\n## Target Market & Personas\nEduBot Myanmar targets high school students, undergraduates, and parents across Myanmar.\n\n### Ideal Customer Personas (ICPs)\n- **Student Min Thant (Grade 11)**: Needs instant step-by-step homework help late at night.\n- **Parent Daw Hla**: Seeks affordable, reliable quality education support for her children.\n\n## Competitor Mapping\n| Competitor | URL | Weakness |\n|---|---|---|\n| Offline Tuition Centers | Offline | High cost (200k+ MMK) & rigid times |\n| Generic AI Chatbots | https://chatgpt.com | Lacks Myanmar curriculum & Burmese pedagogical style |\n| Recorded Video Apps | https://myanlearn.com | No interactive Q&A or live feedback |\n\n## Market Trends & Opportunities\n- Verified TAM: **45,000,000,000 MMK**\n- High demand for low-cost mobile tutoring.\n- Saturation Level: **28%**.`
};

const DEFAULT_FINANCE_FALLBACK = {
  costBreakdown: [
    { item: "Core Platform & AI Model Tuning", cost: 450000 },
    { item: "Cloud Servers, Hosting & CDN", cost: 300000 },
    { item: "Customer Acquisition & Social Video Ads", cost: 525000 },
    { item: "Customer Support & Operations", cost: 150000 },
    { item: "Domain, SSL & Local Curriculum Compliance", cost: 75000 }
  ],
  revenueForecast: "12,000,000 MMK monthly recurring revenue (MRR) projected by Month 6 via 800 active paid subscribers.",
  pricingStrategy: "Freemium access tier (Basic AI tutoring) + Pro Subscription at 15,000 MMK/month for unlimited practice & live exam feedback.",
  breakevenMonth: 4,
  markdown_deliverable: `# Financial Model & Projections: EduBot Myanmar\n\n## Startup Capital Allocation\nBelow is the itemized monthly burn allocation:\n\n| Expense Item | Monthly Cost (MMK) |\n|---|---|\n| Core Platform & AI Model Tuning | 450,000 MMK |\n| Cloud Servers, Hosting & CDN | 300,000 MMK |\n| Customer Acquisition & Social Ads | 525,000 MMK |\n| Customer Support & Operations | 150,000 MMK |\n| Domain & Curriculum Compliance | 75,000 MMK |\n| **Total Run-rate** | **1,500,000 MMK/mo** |\n\n## Revenue Forecast\n- Projecting **Month 4 Breakeven**.\n- Targeting 800 active paid students by Month 6 (12,000,000 MMK MRR).\n\n## Pricing Strategy\n- **Freemium Tier**: Free basic homework solver\n- **Pro Tier**: 15,000 MMK/mo (Unlimited practice tests & AI step-by-step explanations)`
};

const DEFAULT_BRAND_FALLBACK = {
  names: ["EduBot Myanmar", "BurmaLearn AI", "PinyaTutor", "SmartStudent MM", "NextGen Academy"],
  tagline: "24/7 AI tutoring customized for Myanmar students.",
  voice: "Encouraging, pedagogical, clear, bilingual (Burmese/English), and accessible.",
  palette: { primary: "#1e1b4b", secondary: "#38bdf8", background: "#0f172a" },
  logoConcept: "A glowing digital graduation cap intertwined with an AI neural network node, representing futuristic education for Myanmar youth.",
  markdown_deliverable: `# Brand Identity & Style Guide: EduBot Myanmar\n\n## Brand Naming Suggestions\n1. **EduBot Myanmar** (Primary suggestion)\n2. **BurmaLearn AI**\n3. **PinyaTutor**\n4. **SmartStudent MM**\n\n## Brand Voice Guidelines\n- **Encouraging & Pedagogical**: Explaining patiently step-by-step.\n- **Bilingual**: Clear Burmese explanations alongside accurate English terminology.`
};

const DEFAULT_DIGITAL_FALLBACK = {
  landingPageOutline: [
    { section_id: "hero", title: "Master your exams with EduBot 24/7 AI Tutor.", body: "Bilingual tutoring tailored specifically to Myanmar high school and university curricula. No expensive tuition required.", cta_text: "Start Learning Free" },
    { section_id: "features", title: "Interactive Step-by-Step Explanations", body: "Snap a photo of any difficult homework problem or textbook question and get instant pedagogical step-by-step guidance in Burmese.", cta_text: "Try Demo Question" },
    { section_id: "pricing", title: "Affordable plans for every student", body: "Freemium access for all, plus a low-cost Pro tier priced under a fraction of traditional private tuition.", cta_text: "Explore Plans" }
  ],
  features: [
    "Bilingual Homework Solver & Explainer",
    "Myanmar Curriculum Practice Test Engine",
    "Personalized Exam Readiness Dashboard"
  ],
  stack: ["React Next.js", "Gemini 2.5 AI API", "Supabase DB", "Tailwind CSS", "Vercel Cloud"],
  markdown_deliverable: `# Digital Presence Specification: EduBot Myanmar\n\n## Website Landing Page Layout\n\n### 1. Hero Section\n- **Heading**: Master your exams with EduBot 24/7 AI Tutor.\n- **Subheading**: Bilingual tutoring tailored specifically to Myanmar high school and university curricula.\n- **CTA**: Start Learning Free\n\n### 2. Features Grid\n- **Heading**: Interactive Step-by-Step Explanations\n\n## Key App Capabilities\n- Bilingual Homework Solver & Explainer\n- Myanmar Curriculum Practice Test Engine\n- Personalized Exam Readiness Dashboard\n\n## Recommended Technical Stack\n- Frontend: React Next.js\n- API & Orchestration: Node.js (deepagents)\n- Hosting: Vercel Cloud`
};

const DEFAULT_MARKETING_FALLBACK = {
  channels: ["TikTok & Facebook Short Video Ads", "Direct Campus / School Ambassador Networks", "Viral Referral Invite Codes"],
  acquisitionPlan: "Target students and parents across Myanmar using short educational problem-solving videos on TikTok and Facebook ($12 CAC) combined with student referral contests.",
  roadmap90Day: [
    "Days 1-30: Launch Bilingual MVP with Grade 10-12 Math & Science solvers; onboard 200 student beta testers.",
    "Days 31-60: Launch TikTok & Facebook educational mini-lessons and activate campus ambassador referral contest.",
    "Days 61-90: Introduce Pro subscription tier (15,000 MMK/mo) and expand subject database to University level."
  ],
  markdown_deliverable: `# Growth & Marketing Plan: EduBot Myanmar\n\n## Acquisition Channels\n1. **TikTok & Facebook Video Ads**: Short problem-solving clips targeting students.\n2. **Campus Ambassador Networks**: Student leaders sharing invite codes.\n3. **Viral Referral Program**: Invite 3 friends for 1 free month of Pro.\n\n## Launch Roadmap (First 90 Days)\n- **Phase 1 (Days 1-30)**: Alpha launch with 200 active student testers.\n- **Phase 2 (Days 31-60)**: Push social video content & student referrals.\n- **Phase 3 (Days 61-90)**: Open paid Pro tier at 15,000 MMK/mo.`
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

    // Hydrate states from localStorage on mount
    const savedRefined = localStorage.getItem('agentic:refinedConcept');
    if (savedRefined) {
      try { setRefinedConcept(JSON.parse(savedRefined)); } catch (e) { console.error("Error parsing stored refinedConcept:", e); }
    }
    const savedMarket = localStorage.getItem('agentic:marketResearch');
    if (savedMarket) {
      try { setMarketResearch(JSON.parse(savedMarket)); } catch (e) { console.error("Error parsing stored marketResearch:", e); }
    }
    const savedFinance = localStorage.getItem('agentic:financeModel');
    if (savedFinance) {
      try { setFinanceModel(JSON.parse(savedFinance)); } catch (e) { console.error("Error parsing stored financeModel:", e); }
    }
    const savedBrand = localStorage.getItem('agentic:brandPackage');
    if (savedBrand) {
      try { setBrandPackage(JSON.parse(savedBrand)); } catch (e) { console.error("Error parsing stored brandPackage:", e); }
    }
    const savedDigital = localStorage.getItem('agentic:digitalPresence');
    if (savedDigital) {
      try { setDigitalPresence(JSON.parse(savedDigital)); } catch (e) { console.error("Error parsing stored digitalPresence:", e); }
    }
    const savedGrowth = localStorage.getItem('agentic:growthPlan');
    if (savedGrowth) {
      try { setGrowthPlan(JSON.parse(savedGrowth)); } catch (e) { console.error("Error parsing stored growthPlan:", e); }
    }
    const savedBusiness = localStorage.getItem('agentic:businessPlan');
    if (savedBusiness) {
      try { setBusinessPlan(JSON.parse(savedBusiness)); } catch (e) { console.error("Error parsing stored businessPlan:", e); }
    }

    const savedIdeaId = localStorage.getItem(CURRENT_IDEA_ID_KEY);
    if (savedIdeaId) {
      setCurrentIdeaId(savedIdeaId);
    }
  }, []);

  useEffect(() => {
    if (refinedConcept) {
      localStorage.setItem('agentic:refinedConcept', JSON.stringify(refinedConcept));
    } else {
      localStorage.removeItem('agentic:refinedConcept');
    }
  }, [refinedConcept]);

  useEffect(() => {
    if (marketResearch) {
      localStorage.setItem('agentic:marketResearch', JSON.stringify(marketResearch));
    } else {
      localStorage.removeItem('agentic:marketResearch');
    }
  }, [marketResearch]);

  useEffect(() => {
    if (financeModel) {
      localStorage.setItem('agentic:financeModel', JSON.stringify(financeModel));
    } else {
      localStorage.removeItem('agentic:financeModel');
    }
  }, [financeModel]);

  useEffect(() => {
    if (brandPackage) {
      localStorage.setItem('agentic:brandPackage', JSON.stringify(brandPackage));
    } else {
      localStorage.removeItem('agentic:brandPackage');
    }
  }, [brandPackage]);

  useEffect(() => {
    if (digitalPresence) {
      localStorage.setItem('agentic:digitalPresence', JSON.stringify(digitalPresence));
    } else {
      localStorage.removeItem('agentic:digitalPresence');
    }
  }, [digitalPresence]);

  useEffect(() => {
    if (growthPlan) {
      localStorage.setItem('agentic:growthPlan', JSON.stringify(growthPlan));
    } else {
      localStorage.removeItem('agentic:growthPlan');
    }
  }, [growthPlan]);

  useEffect(() => {
    if (businessPlan) {
      localStorage.setItem('agentic:businessPlan', JSON.stringify(businessPlan));
    } else {
      localStorage.removeItem('agentic:businessPlan');
    }
  }, [businessPlan]);

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

  const updateRefinedConceptDirect = async (updatedConcept) => {
    setRefinedConcept(updatedConcept);
    await persistAgentOutput('agent_refinements', updatedConcept, (output) => ({
      thinking: output.thinking || '',
      concept: output.concept || '',
      improved_summary: output.improved_summary || '',
      key_differentiators: output.key_differentiators || [],
      target_audience_refined: output.target_audience_refined || ''
    }));
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

  const triggerRediscovery = async (changedModelName, updatedModelDirect = null) => {
    const key = getApiKey();
    
    let currentRefined = refinedConcept || DEFAULT_CONCEPT_FALLBACK;
    let currentMarket = marketResearch || DEFAULT_MARKET_FALLBACK;
    let currentFinance = financeModel || DEFAULT_FINANCE_FALLBACK;
    let currentBrand = brandPackage || DEFAULT_BRAND_FALLBACK;
    let currentDigital = digitalPresence || DEFAULT_DIGITAL_FALLBACK;
    let currentGrowth = growthPlan || DEFAULT_MARKETING_FALLBACK;

    if (updatedModelDirect) {
      if (changedModelName === 'overview') currentRefined = updatedModelDirect;
      if (changedModelName === 'market') currentMarket = updatedModelDirect;
      if (changedModelName === 'finance') currentFinance = updatedModelDirect;
      if (changedModelName === 'brand') currentBrand = updatedModelDirect;
      if (changedModelName === 'digital') currentDigital = updatedModelDirect;
      if (changedModelName === 'growth') currentGrowth = updatedModelDirect;
    }

    const currentBlueprint = {
      refinedConcept: currentRefined,
      marketResearch: currentMarket,
      financeModel: currentFinance,
      brandPackage: currentBrand,
      digitalPresence: currentDigital,
      growthPlan: currentGrowth
    };

    addThinkingLog('business', `Triggering agentic rediscovery cascade for updated ${changedModelName} model...`);

    try {
      const updateResponse = await runAgenticUpdateAgent(
        changedModelName,
        updatedModelDirect,
        currentBlueprint,
        businessInfo,
        key,
        language
      );

      addThinkingLog('business', `Agentic Analysis: ${updateResponse.thinking}`);
      
      const affectedSet = new Set(updateResponse.affected_tabs || []);
      if (changedModelName === 'overview') {
        ['market', 'finance', 'brand', 'digital', 'growth'].forEach(t => affectedSet.add(t));
      } else if (changedModelName === 'market') {
        ['finance', 'growth'].forEach(t => affectedSet.add(t));
      } else if (changedModelName === 'finance') {
        ['growth'].forEach(t => affectedSet.add(t));
      } else if (changedModelName === 'brand') {
        ['digital'].forEach(t => affectedSet.add(t));
      } else if (changedModelName === 'digital') {
        ['finance', 'growth'].forEach(t => affectedSet.add(t));
      } else if (changedModelName === 'growth') {
        ['finance'].forEach(t => affectedSet.add(t));
      }
      affectedSet.delete(changedModelName);
      const affected = Array.from(affectedSet);

      addThinkingLog('business', `Affected downstream modules identified (including strategist dependencies): ${affected.join(', ') || 'none'}`);

      if (changedModelName === 'overview' && updatedModelDirect) {
        addThinkingLog('business', 'Persisting updated Refined Concept...');
        await updateRefinedConceptDirect(updatedModelDirect);
        currentRefined = updatedModelDirect;
      }
      if (changedModelName === 'market' && updatedModelDirect) {
        addThinkingLog('market', 'Persisting updated Market Intelligence...');
        await updateMarketResearchDirect(updatedModelDirect);
        currentMarket = updatedModelDirect;
      }
      if (changedModelName === 'finance' && updatedModelDirect) {
        addThinkingLog('finance', 'Persisting updated Finance Model...');
        await updateFinanceModelDirect(updatedModelDirect);
        currentFinance = updatedModelDirect;
      }
      if (changedModelName === 'brand' && updatedModelDirect) {
        addThinkingLog('brand', 'Persisting updated Brand Package...');
        await updateBrandPackageDirect(updatedModelDirect);
        currentBrand = updatedModelDirect;
      }
      if (changedModelName === 'digital' && updatedModelDirect) {
        addThinkingLog('website', 'Persisting updated Digital Presence...');
        await updateDigitalPresenceDirect(updatedModelDirect);
        currentDigital = updatedModelDirect;
      }
      if (changedModelName === 'growth' && updatedModelDirect) {
        addThinkingLog('marketing', 'Persisting updated Growth Plan...');
        await updateGrowthPlanDirect(updatedModelDirect);
        currentGrowth = updatedModelDirect;
      }

      if (affected.includes('overview')) {
        addThinkingLog('refinement', 'Refined concept affected. Re-running Refinement Agent...');
        const newRefined = await runRefinementAgent(rawUserIdea, businessInfo, key, language);
        setRefinedConcept(newRefined);
        await persistAgentOutput('agent_refinements', newRefined, (output) => ({
          thinking: output.thinking || '',
          concept: output.concept || '',
          improved_summary: output.improved_summary || '',
          key_differentiators: output.key_differentiators || [],
          target_audience_refined: output.target_audience_refined || ''
        }));
        currentRefined = newRefined;
      }

      if (affected.includes('market')) {
        addThinkingLog('market', 'Market research affected. Re-running Market Research Agent...');
        const newMarket = await runMarketResearchAgent(currentRefined, businessInfo, key, language);
        setMarketResearch(newMarket);
        await persistAgentOutput('agent_market_research', newMarket, (output) => ({
          thinking: output.thinking || '',
          markdown_deliverable: output.markdown_deliverable || '',
          tam: output.tam || '',
          competitors: output.competitors || [],
          opportunities: output.opportunities || [],
          saturation_level: output.saturation_level || 0,
          target_personas: output.target_personas || []
        }));
        currentMarket = newMarket;
      }

      if (affected.includes('finance')) {
        addThinkingLog('finance', 'Financial model affected. Re-running Finance Agent...');
        const newFinance = await runFinanceAgent(currentRefined, businessInfo, currentMarket, key, language);
        setFinanceModel(newFinance);
        await persistAgentOutput('agent_finance_models', newFinance, (output) => ({
          thinking: output.thinking || '',
          markdown_deliverable: output.markdown_deliverable || '',
          cost_breakdown: output.costBreakdown || [],
          revenue_forecast: output.revenueForecast || '',
          pricing_strategy: output.pricingStrategy || '',
          breakeven_month: output.breakevenMonth || 0
        }));
        currentFinance = newFinance;
      }

      if (affected.includes('brand')) {
        addThinkingLog('brand', 'Brand identity affected. Re-running Brand Agent...');
        const newBrand = await runBrandAgent(currentRefined, businessInfo, key, language);
        setBrandPackage(newBrand);
        await persistAgentOutput('agent_brand_packages', newBrand, (output) => ({
          thinking: output.thinking || '',
          markdown_deliverable: output.markdown_deliverable || '',
          names: output.names || [],
          tagline: output.tagline || '',
          voice: output.voice || '',
          palette: output.palette || {},
          logo_concept: output.logoConcept || ''
        }));
        currentBrand = newBrand;
      }

      if (affected.includes('digital')) {
        addThinkingLog('website', 'Digital presence affected. Re-running Website/Product Agent...');
        const newDigital = await runWebsiteAgent(currentRefined, businessInfo, currentBrand, key, language);
        setDigitalPresence(newDigital);
        await persistAgentOutput('agent_digital_presence', newDigital, (output) => ({
          thinking: output.thinking || '',
          markdown_deliverable: output.markdown_deliverable || '',
          landing_page_outline: output.landingPageOutline || [],
          features: output.features || [],
          stack: output.stack || []
        }));
        currentDigital = newDigital;
      }

      if (affected.includes('growth')) {
        addThinkingLog('marketing', 'Growth roadmap affected. Re-running Marketing Agent...');
        const newGrowth = await runMarketingAgent(currentRefined, businessInfo, currentMarket, key, language);
        setGrowthPlan(newGrowth);
        await persistAgentOutput('agent_growth_plans', newGrowth, (output) => ({
          thinking: output.thinking || '',
          markdown_deliverable: output.markdown_deliverable || '',
          channels: output.channels || [],
          acquisition_plan: output.acquisitionPlan || '',
          roadmap_90_day: output.roadmap90Day || []
        }));
        currentGrowth = newGrowth;
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
      updateRefinedConceptDirect,
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
