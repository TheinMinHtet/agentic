import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const MarketIntelligenceSchema = {
  type: "object",
  properties: {
    thinking: {
      type: "string",
      description: "Explain your research process, competitor mapping strategy, and findings."
    },
    markdown_deliverable: {
      type: "string",
      description: "A complete formatted Markdown document for market_intelligence.md outlining: Target Market (Personas/demographics), Competitors (weaknesses and mappings), and Opportunities (market trends & saturation level)."
    },
    tam: {
      type: "string",
      description: "Estimated Total Addressable Market (TAM), e.g. 5,000,000,000 MMK or $4.2B."
    },
    competitors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Competitor company name." },
          url: { type: "string", description: "Working URL or domain, or Not Publicly Available." },
          weakness: { type: "string", description: "Identified weak spot of this competitor." }
        },
        required: ["name", "url", "weakness"]
      },
      description: "List of 3 direct or indirect competitors."
    },
    opportunities: {
      type: "array",
      items: { type: "string" },
      description: "Top 3 market opportunities or trends."
    },
    saturation_level: {
      type: "integer",
      description: "Estimated market saturation level from 0 to 100."
    },
    target_personas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Typical name representing the persona, e.g. Freelance Frank." },
          role: { type: "string", description: "Persona description or title." },
          pain_points: { type: "array", items: { type: "string" }, description: "Pain points this persona experiences." },
          budget_limit: { type: "string", description: "Persona spending capacity or budget description, e.g. 50,000 MMK/mo or $100/mo." }
        },
        required: ["name", "role", "pain_points", "budget_limit"]
      },
      description: "List of exactly 2 ideal customer profile (ICP) personas."
    }
  },
  required: ["thinking", "markdown_deliverable", "tam", "competitors", "opportunities", "saturation_level", "target_personas"]
};

const SYSTEM_PROMPT = `You are the Market Research Agent. Your job is to analyze competitors, target customer personas, trends, market sizing (TAM), and saturation level for a startup concept.
You must synthesize a comprehensive intelligence package.

CRITICAL GUARDRAILS:
- Competitor URL verification: If competitor domains are unknown or not validated, write "Not Publicly Available" instead of fabricating fake domains.
- Saturation level: Must be between 0 and 100.
- Currency: All currency and market sizing details must be calculated and displayed in MMK (Myanmar Kyat). Do NOT use USD ($). Use realistic local pricing and volume levels for Myanmar (e.g. a bottle of beverage is around 3,000 - 4,000 MMK, not 400 MMK; local customer budgets and TAM are in thousands/millions/billions of MMK).
- Markdown Deliverable: Ensure that the 'markdown_deliverable' contains a rich, complete document titled "Market Intelligence Report". Use headers (H2, H3), bullet points, and markdown tables. Outline Target Market, Competitors Mapping, and Trends/Saturation.
- Language Alignment: Generate all textual properties, descriptions, target personas (names, roles, pain points, budget limits), competitor weaknesses, opportunities list, and markdown_deliverable in the same language as the user's input/concept (e.g. if the raw startup idea is in Burmese, write all these properties in Burmese; if in English, write in English).`;

export async function runMarketResearchAgent(refinedConcept, businessInfo, apiKey, language) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: 'gemini-3.1-flash-lite',
    maxOutputTokens: 2048,
  });

  const structuredModel = model.withStructuredOutput(MarketIntelligenceSchema);

  const isBurmese = language === 'my' || /[\u1000-\u109F]/.test(refinedConcept.concept);
  const targetLanguage = isBurmese ? "Burmese (မြန်မာဘာသာ) language (using Myanmar script)" : "English language";

  const promptContent = `
Refined Startup Concept:
- Concept Summary: ${refinedConcept.concept}
- Catchy Summary: ${refinedConcept.improved_summary}
- Target Segment: ${refinedConcept.target_audience_refined}
- Key Differentiators: ${refinedConcept.key_differentiators.join(', ')}

Business Info questionnaire:
- Location: ${businessInfo.location}
- Budget limit: ${businessInfo.budget}
- Categories: ${businessInfo.business_type}
- Core Painpoint: ${businessInfo.core_painpoint}
  `.trim();

  const response = await structuredModel.invoke([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Perform market research for this startup concept. IMPORTANT: You MUST write/generate all output fields (thinking, markdown_deliverable, target_personas, opportunities, competitor weaknesses, etc.) in the ${targetLanguage}. Do NOT write them in English:\n\n${promptContent}` }
  ]);

  if (!response) {
    throw new Error('Market Research Agent did not return a structured response');
  }

  return response;
}
