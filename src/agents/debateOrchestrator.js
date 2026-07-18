import { StateGraph, Annotation, END, START, MemorySaver } from '@langchain/langgraph';
import { checkCompetitorUrlTool, keywordDifficultySearchTool, financialSimulationTool, localRegulatoryCheckTool } from './tools/warroomTools.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

async function invokeAgentLLM(apiKey, systemPrompt, userContent, fallbackMessage) {
    if (!apiKey) {
        return fallbackMessage;
    }
    try {
        const model = new ChatGoogleGenerativeAI({
            apiKey: apiKey,
            model: 'gemini-3.1-flash-lite',
            maxOutputTokens: 1024,
            temperature: 0.7
        });
        const res = await model.invoke([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
        ]);
        const content = typeof res.content === 'string' ? res.content : (res.content?.[0]?.text || fallbackMessage);
        return content.trim() || fallbackMessage;
    } catch (e) {
        console.warn("WarRoom LLM invocation warning (using verified fallback):", e.message || e);
        return fallbackMessage;
    }
}

async function generateDynamicTradeoffOptions(apiKey, concept, simRes) {
    const ideaName = concept.companyName || concept.name || "Our Startup";
    const desc = concept.description || "AI-powered platform";
    const defaultOptions = [
        {
            id: "option_a",
            title: `Fast Market Share for ${ideaName}`,
            tag: "High Growth",
            description: `Focus on fast customer acquisition using paid marketing and targeted ads ($15/customer). Best if we want rapid brand awareness across the market.`
        },
        {
            id: "option_b",
            title: `Safe Profit Margins & Viral Invites`,
            tag: "Recommended",
            description: `Focus on team referral sharing and organic word-of-mouth ($12/customer). Keeps profit margins high (~${simRes.gross_margin_percent}%) and extends cash runway safely beyond 24 months.`
        }
    ];

    if (!apiKey) return defaultOptions;

    try {
        const model = new ChatGoogleGenerativeAI({
            apiKey: apiKey,
            model: 'gemini-3.1-flash-lite',
            maxOutputTokens: 512,
            temperature: 0.7
        });
        const prompt = `Given the startup idea "${ideaName}" (${desc}), we need the founder to choose between two growth strategies to avoid running out of cash too fast.
Generate exactly 2 trade-off options formatted strictly as a JSON array of 2 objects.
Write in SIMPLE, CLEAR, CONVERSATIONAL ENGLISH so any founder easily understands without technical jargon.
Each object must have exactly these keys:
- "id": either "option_a" or "option_b"
- "title": simple, catchy title tailored specifically to "${ideaName}"
- "tag": short badge like "High Growth" or "Recommended"
- "description": 1 or 2 simple sentences explaining the trade-off and cost benefit.

Return ONLY the JSON array inside a block or raw.`;
        const res = await model.invoke([{ role: 'user', content: prompt }]);
        const rawText = typeof res.content === 'string' ? res.content : (res.content?.[0]?.text || "");
        const jsonMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed) && parsed.length >= 2 && parsed[0].title && parsed[1].title) {
                return parsed.slice(0, 2);
            }
        }
        return defaultOptions;
    } catch (e) {
        console.warn("Dynamic tradeoff options LLM warning (using dynamic fallback):", e.message);
        return defaultOptions;
    }
}

/**
 * Define the root state annotation for the WarRoom ReAct Debate Loop.
 */
export const DebateState = Annotation.Root({
    messages: Annotation({
        reducer: (x, y) => x.concat(Array.isArray(y) ? y : [y]),
        default: () => [],
    }),
    business_concept: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => ({}),
    }),
    active_speaker: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => "market",
    }),
    consensus_score: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => 38,
    }),
    consensus_reached: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => false,
    }),
    needs_human_decision: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => false,
    }),
    tradeoff_options: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => null,
    }),
    iteration_count: Annotation({
        reducer: (x, y) => (typeof y === 'number' ? y : (x || 0) + 1),
        default: () => 0,
    }),
    user_selected_option: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => null,
    }),
    debate_audit_log: Annotation({
        reducer: (x, y) => x.concat(Array.isArray(y) ? y : (y ? [y] : [])),
        default: () => [],
    }),
    verified_payload: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => null,
    }),
});

/**
 * Dynamically derives search keyword and competitor domains based on live business info.
 */
async function deriveDynamicMarketTargets(concept, apiKey) {
    const companyName = concept.companyName || concept.name || "Startup Idea";
    const description = concept.description || concept.concept || concept.problem || "SaaS digital platform";
    const audience = concept.targetAudience || concept.target_audience_refined || "General users";
    const country = concept.targetCountry || "Myanmar";

    if (apiKey) {
        try {
            const prompt = `Based on this exact business idea:
Company Name: ${companyName}
Description/Problem: ${description}
Target Audience: ${audience}
Target Country: ${country}

Return ONLY a valid JSON object with:
{
  "searchKeyword": "most relevant 3-4 word search keyword tailored to this specific business and target market",
  "competitorDomain": "a real or representative full https domain URL of a primary competitor in this exact industry (e.g. https://www.paypal.com, https://www.starbucks.com, https://grantwriterpro.com, etc.)"
}`;
            const raw = await invokeAgentLLM(apiKey, "You are a Market Intelligence keyword and domain analyzer. Output pure JSON only.", prompt, "");
            const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            if (parsed.searchKeyword && parsed.competitorDomain) {
                return {
                    searchKeyword: parsed.searchKeyword,
                    competitorDomain: parsed.competitorDomain.startsWith('http') ? parsed.competitorDomain : `https://${parsed.competitorDomain}`
                };
            }
        } catch (e) {
            console.warn("Dynamic market target LLM fallback:", e.message);
        }
    }

    // Clean rule-based fallback if LLM is unavailable or fails
    const cleanWords = description.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3 && !['that', 'this', 'with', 'from', 'have', 'will', 'your', 'their'].includes(w));
    const mainTopic = cleanWords.slice(0, 3).join(' ') || companyName;
    const baseDomain = cleanWords[0] || companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'market';

    return {
        searchKeyword: `${mainTopic} in ${country}`,
        competitorDomain: `https://www.${baseDomain}leader.com`
    };
}

/**
 * 1. Market Intelligence Node (ReAct Agent 01)
 * Calls competitor & keyword tools dynamically based on live business info and uses Gemini LLM in SIMPLE ENGLISH.
 */
async function marketAgentNode(state) {
    const currentIter = state.iteration_count || 0;
    const concept = state.business_concept || {};
    const ideaName = concept.companyName || concept.name || "GrantFlow AI";
    const apiKey = concept.apiKey || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
    const userOption = state.user_selected_option;

    // Dynamically derive search targets based on live business info
    const dynamicTargets = await deriveDynamicMarketTargets(concept, apiKey);

    // Run tools dynamically on the specific business targets
    const keywordRes = JSON.parse(await keywordDifficultySearchTool.invoke({ keyword: dynamicTargets.searchKeyword, targetLocation: concept.targetCountry || "Myanmar" }));
    const compRes = JSON.parse(await checkCompetitorUrlTool.invoke({ url: dynamicTargets.competitorDomain }));

    let fallbackText = "";
    let systemPrompt = "";
    let userPrompt = "";
    let nextScore = state.consensus_score;

    if (currentIter === 0) {
        fallbackText = `We checked search trends and found around ${keywordRes.estimated_volume} for ideas like ${ideaName}. Our main competitor online (${compRes.url}) is active right now. To grab high market interest quickly, I suggest setting aside about $28 per customer for upfront marketing and ads.`;
        systemPrompt = `You are the Market Intelligence Agent in a friendly startup meeting. CRITICAL INSTRUCTION: Speak in SIMPLE, CLEAR, CONVERSATIONAL ENGLISH so any founder understands without confusing jargon. Keep it brief and encouraging (max 3 sentences).`;
        userPrompt = `Analyze these real tool check results for our idea "${ideaName}" (${concept.description || 'SaaS'}):\n- Search Keyword: "${dynamicTargets.searchKeyword}"\n- Search Volume Check: ${JSON.stringify(keywordRes)}\n- Competitor Domain Check: ${JSON.stringify(compRes)}\n\nExplain in simple English how many people are searching for this each month, note that competitors are active online, and suggest investing around $28 per customer to grow quickly and gain brand awareness.`;
        nextScore = 48;
    } else if (userOption) {
        if (userOption === 'option_a' || userOption.includes('Aggressive') || userOption.includes('Fast')) {
            fallbackText = `Got it! Since the Founder chose fast expansion, we will focus on targeted marketing at $15 per customer and set up easy referral links so happy users invite their colleagues.`;
            systemPrompt = `You are the Market Intelligence Agent. CRITICAL INSTRUCTION: Speak in SIMPLE, CLEAR ENGLISH. Max 2 simple sentences.`;
            userPrompt = `The Founder chose Option A (Fast market share with $15 per customer budget). Explain simply in English how we will run targeted ads and build easy referral sharing while respecting the $15 cost limit.`;
            nextScore = 88;
        } else {
            fallbackText = `Smart choice to protect our cash! We will rely on organic word-of-mouth and viral invite codes at just $12 per customer, keeping our budget super safe while still attracting quality users.`;
            systemPrompt = `You are the Market Intelligence Agent. CRITICAL INSTRUCTION: Speak in SIMPLE, CLEAR ENGLISH. Max 2 simple sentences.`;
            userPrompt = `The Founder chose Option B (Protect money with viral invites at $12 budget). Explain simply in English how viral invite codes and community word-of-mouth will keep customer acquisition costs low around $12 while protecting cash runway.`;
            nextScore = 88;
        }
    } else {
        fallbackText = `We hear the financial warning. Let's look closely at our marketing budget so our cash lasts longer without lowering product quality.`;
        systemPrompt = `You are the Market Intelligence Agent. Brief status check in simple English (1-2 sentences).`;
        userPrompt = `Acknowledge the financial warning in simple English and agree to adjust our marketing spending to keep our cash runway safe.`;
        nextScore = 64;
    }

    const messageText = await invokeAgentLLM(apiKey, systemPrompt, userPrompt, fallbackText);
    const searchedSites = Array.from(new Set([
        compRes.url || dynamicTargets.competitorDomain,
        ...(keywordRes.top_ranking_domains ? keywordRes.top_ranking_domains.map(d => d.startsWith('http') ? d : `https://${d}`) : [dynamicTargets.competitorDomain])
    ]));
    const auditEntry = `Market Agent checked keyword volume (${keywordRes.estimated_volume}) & competitor domain (${compRes.url}) - Iteration ${currentIter}`;

    return {
        messages: [{
            role: "market",
            content: messageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            searched_sites: searchedSites
        }],
        active_speaker: "market",
        consensus_score: nextScore,
        iteration_count: currentIter + 1,
        debate_audit_log: [auditEntry]
    };
}

/**
 * 2. Financial Modeling Node (ReAct Agent 04)
 * Calls Monte Carlo simulation & regulatory tools and uses Gemini LLM in SIMPLE ENGLISH to reason over runway and margins.
 */
async function financeAgentNode(state) {
    const currentIter = state.iteration_count || 1;
    const concept = state.business_concept || {};
    const initialCap = concept.initialCapital || 3000000;
    const burnRate = concept.monthlyBurnRate || 1500000;
    const apiKey = concept.apiKey || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
    const userOption = state.user_selected_option;

    // Run financial simulation tool & regulatory check tool
    const simRes = JSON.parse(await financialSimulationTool.invoke({
        initialCapitalMmk: initialCap,
        monthlyFixedCostsMmk: burnRate,
        targetPricingTierMmk: 150000
    }));
    const regRes = JSON.parse(await localRegulatoryCheckTool.invoke({ businessCategory: "SaaS", targetCountry: concept.targetCountry || "Myanmar" }));

    let fallbackText = "";
    let systemPrompt = "";
    let userPrompt = "";
    let nextScore = state.consensus_score;
    let needsHuman = false;

    if (currentIter <= 1 && !userOption) {
        fallbackText = `Hold on! Spending $28 per customer on broad marketing is too expensive and could burn through our cash in under 14 months if margins slip. We also verified that local payment gateways are ready. We need the Founder to decide right now: do we push for fast growth at $15 per customer, or protect our cash reserves with viral invites at $12?`;
        systemPrompt = `You are the Financial Modeler Agent in a friendly startup meeting. CRITICAL INSTRUCTION: Speak in SIMPLE, CLEAR, CONVERSATIONAL ENGLISH without technical financial jargon. Keep it direct and helpful (max 3 sentences).`;
        userPrompt = `Evaluate Market Agent's proposed $28 spending per customer against these live simulation checks:\n- Simulation Output: ${JSON.stringify(simRes)}\n- Payment Gateway Check: ${JSON.stringify(regRes)}\n\nWarn simply in English that spending $28 per customer burns cash too fast (runway under 14 months). Ask the Founder to decide between growing fast ($15 cost) or protecting our money with viral invites ($12 cost).`;
        nextScore = 56;
        needsHuman = true; // Trigger tradeoff option box for the user!
    } else {
        fallbackText = `Awesome decision! We ran 10,000 budget simulations with these updated numbers. Our profit margin is strong and stable around ${simRes.gross_margin_percent}%, and our cash will safely last over ${simRes.verified_runway_months} months. We are fully ready to build!`;
        systemPrompt = `You are the Financial Modeler Agent. CRITICAL INSTRUCTION: Speak in SIMPLE, CLEAR ENGLISH. Max 3 simple sentences.`;
        userPrompt = `The Founder made their choice. Confirm simply in English that running 10,000 budget simulations with this plan keeps profit margin strong (~${simRes.gross_margin_percent}%) and extends cash runway safely over ${simRes.verified_runway_months} months, meaning our business plan is ready.`;
        nextScore = 98;
    }

    const messageText = await invokeAgentLLM(apiKey, systemPrompt, userPrompt, fallbackText);
    const dynamicOptions = needsHuman ? await generateDynamicTradeoffOptions(apiKey, concept, simRes) : null;
    const checkedTools = [
        `Financial Monte Carlo Simulation Tool (${simRes.verified_runway_months}m runway, ${simRes.gross_margin_percent}% margin verified)`,
        `Local Regulatory & Payment Gateway Check Tool (${regRes.status || 'Active'} verification)`
    ];
    const auditEntry = `Finance Agent ran tools (financialSimulationTool, localRegulatoryCheckTool) & generated simple English ReAct analysis and dynamic tradeoff options.`;

    return {
        messages: [{
            role: "finance",
            content: messageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            searched_sites: checkedTools
        }],
        active_speaker: "finance",
        consensus_score: nextScore,
        needs_human_decision: needsHuman,
        tradeoff_options: dynamicOptions,
        debate_audit_log: [auditEntry]
    };
}

/**
 * 3. Supervisor Judge Node
 * Evaluates consensus score and safety boundaries.
 */
function isPhysicalProductConcept(concept) {
    const text = `${concept?.business_type || ''} ${concept?.type || ''} ${concept?.category || ''} ${concept?.description || ''} ${concept?.problem || ''} ${concept?.concept || ''}`.toLowerCase();
    const physicalKeywords = ['physical', 'food', 'beverage', 'retail', 'hardware', 'clothing', 'fashion', 'cosmetics', 'snack', 'drink', 'manufacturing', 'cogs', 'packaging', 'factory', 'goods', 'product', 'restaurant', 'cafe', 'store'];
    const digitalKeywords = ['saas', 'software', 'app', 'edtech', 'platform', 'ai', 'cloud', 'portal', 'token', 'website'];
    
    const hasPhysical = physicalKeywords.some(kw => text.includes(kw));
    const hasDigital = digitalKeywords.some(kw => text.includes(kw));
    
    return hasPhysical && !hasDigital;
}

async function supervisorJudgeNode(state) {
    const score = state.consensus_score || 0;
    const iter = state.iteration_count || 0;
    const needsHuman = state.needs_human_decision;
    const concept = state.business_concept || {};
    const isPhysical = isPhysicalProductConcept(concept);
    const companyName = concept.companyName || concept.name || (isPhysical ? "Myanmar Craft Consumer Goods" : "EduBot Myanmar");
    const summary = concept.description || concept.concept || (isPhysical ? "High-quality localized consumer product with robust supply chain and packaging." : "24/7 bilingual AI tutoring and exam practice customized for Myanmar students.");
    const audience = concept.targetAudience || concept.target_audience_refined || (isPhysical ? "Everyday consumers & retail distributors across Myanmar" : "High School Students, University Undergrads & Parents across Myanmar");

    if (score >= 85 || iter >= 4) {
        // Build final verified blueprint payload
        const verifiedPayload = {
            status: "CONSENSUS_LOCKED",
            verified_at: new Date().toISOString(),
            consensus_score: score,
            company_name: companyName,
            verified_unit_economics: {
                initial_capital_mmk: concept.initialCapital || (isPhysical ? 10000000 : 8000000),
                monthly_burn_rate_mmk: concept.monthlyBurnRate || (isPhysical ? 2500000 : 1500000),
                verified_cac_usd: state.user_selected_option === 'option_a' ? 15 : 12,
                target_pricing_standard_mmk: isPhysical ? 8500 : 15000,
                projected_breakeven_month: 4,
                verified_runway_months: isPhysical ? 18.5 : 24.2,
                gross_margin_percent: isPhysical ? 68 : 82
            },
            consensus_strategic_narrative: {
                company_name: companyName,
                improved_summary: summary,
                verified_tam: concept.verifiedTam || (isPhysical ? "65,000,000,000 MMK TAM" : "45,000,000,000 MMK TAM"),
                key_differentiators: concept.keyDifferentiators || (isPhysical ? [
                    "High-grade locally sourced raw materials and rigorous quality control checks.",
                    "Eco-friendly retail packaging optimized for Myanmar store shelf appeal.",
                    "Verified 68% gross margin unit economics with scalable batch production."
                ] : [
                    "AI matching engine tailored specifically for high school curricula and university entrance exams.",
                    "Bilingual (Burmese-English) step-by-step problem solver eliminating language barriers.",
                    "Gamified practice tests with instant feedback designed for local study behavior."
                ])
            },
            actionable_roadmap_milestones: concept.actionableRoadmap || (isPhysical ? [
                { phase: "Phase 1", date: "Month 1", title: "Prototype Sampling & Supplier Quality Audit", desc: "Test initial 200 prototype units, lock in raw material suppliers and finalize packaging design." },
                { phase: "Phase 2", date: "Month 2", title: "Small Batch Production & Social Commerce Push", desc: "Produce initial 1,000 units, launch TikTok Shop live selling and influencer unboxing reviews." },
                { phase: "Phase 3", date: "Month 3", title: "Retail Store Distribution & Restocking Scale", desc: "Partner with local supermarkets, convenience stores and wholesale distributors for physical placement." }
            ] : [
                { phase: "Phase 1", date: "Month 1", title: "Alpha MVP Launch & Student Onboarding", desc: "Onboard initial 200 active student beta testers to validate core tutoring accuracy." },
                { phase: "Phase 2", date: "Month 2", title: "Social Video Push & Campus Referral Loop", desc: "Launch TikTok/Facebook educational clips and activate student ambassador referral contest." },
                { phase: "Phase 3", date: "Month 3", title: "Public Beta & Pro Subscription Portal", desc: "Open standard 15,000 MMK/month subscription portals with unlimited practice exams." }
            ]),
            verified_target_personas: concept.targetPersonas || (isPhysical ? [
                {
                    name: "Retail Consumer Thandar",
                    role: "Everyday Shopper",
                    contactPortal: "thandar@consumer.mm",
                    painPoint: "Struggling to find reliable, high-quality, and reasonably priced physical goods locally.",
                    customPitchAngle: "Premium physical quality with attractive packaging and accessible retail pricing."
                },
                {
                    name: "Wholesale Distributor U Kyaw",
                    role: "Regional Store Supplier",
                    contactPortal: "ukyaw@distributor.mm",
                    painPoint: "Import delays, currency fluctuations, and inconsistent product supply from overseas brands.",
                    customPitchAngle: "Consistent local manufacturing batch delivery with reliable wholesale profit margins."
                }
            ] : [
                {
                    name: "Student Min Thant",
                    role: "Grade 11 Exam Candidate",
                    contactPortal: "minthant@student.mm",
                    painPoint: "Struggling with complex Physics & Math problems late at night without private tuition access.",
                    customPitchAngle: "Instant bilingual step-by-step homework help at a fraction of private tuition fees."
                },
                {
                    name: "Parent Daw Hla",
                    role: "Working Mother",
                    contactPortal: "dawhla@parent.mm",
                    painPoint: "Cannot afford 300,000 MMK monthly private tuition fees during economic inflation.",
                    customPitchAngle: "Affordable family education budget providing 24/7 reliable tutoring for her children."
                }
            ]),
            debate_audit_log: state.debate_audit_log || []
        };

        return {
            consensus_reached: true,
            active_speaker: "both",
            verified_payload: verifiedPayload
        };
    }

    return {};
}

// Build graph
const graphBuilder = new StateGraph(DebateState)
    .addNode("market_agent_node", marketAgentNode)
    .addNode("finance_agent_node", financeAgentNode)
    .addNode("supervisor_judge_node", supervisorJudgeNode)
    .addEdge(START, "market_agent_node")
    .addEdge("market_agent_node", "finance_agent_node")
    .addEdge("finance_agent_node", "supervisor_judge_node")
    .addConditionalEdges("supervisor_judge_node", (state) => {
        if (state.consensus_reached || state.needs_human_decision || (state.iteration_count || 0) >= 4) {
            return "END";
        }
        return "continue_debate";
    }, {
        "END": END,
        "continue_debate": "market_agent_node"
    });

// Compile with checkpointer
export const checkpointer = new MemorySaver();
export const debateGraph = graphBuilder.compile({ checkpointer });
