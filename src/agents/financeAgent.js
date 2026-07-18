import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const FinancialModelSchema = {
  type: "object",
  properties: {
    thinking: {
      type: "string",
      description: "Explain your financial calculations, assumptions, cost allocations, and revenue projection strategy."
    },
    markdown_deliverable: {
      type: "string",
      description: "A complete formatted Markdown document for financial_model.md outlining: Cost breakdown (Initial setup and monthly operating costs), Revenue forecast (Break-even timeframe and projections), and Pricing strategy (Proposed tiers and models)."
    },
    costBreakdown: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item: { type: "string", description: "Expense item name." },
          cost: { type: "number", description: "Item cost in the local currency unit (e.g. MMK or USD)." }
        },
        required: ["item", "cost"]
      },
      description: "Itemized breakdown of initial startup setup costs."
    },
    revenueForecast: {
      type: "string",
      description: "A brief description of projected monthly revenue trajectory."
    },
    pricingStrategy: {
      type: "string",
      description: "A brief description of the proposed pricing strategy."
    },
    breakevenMonth: {
      type: "integer",
      description: "Estimated number of months to reach the break-even point."
    }
  },
  required: ["thinking", "markdown_deliverable", "costBreakdown", "revenueForecast", "pricingStrategy", "breakevenMonth"]
};

const SYSTEM_PROMPT = `You are the Finance Agent. Your role is to calculate initial setup costs, monthly operating costs, pricing tiers, and break-even timelines. All currency units, costs, and pricing details must be calculated, presented, and formatted in MMK (Myanmar Kyat). Do NOT use USD ($) or any other currency.

CRITICAL GUARDRAILS:
- Currency: You MUST use MMK (Myanmar Kyat) as the primary currency for all financial estimates, breakdowns, projections, and reports. Do NOT use the dollar symbol ($) or USD in your output text or numbers. Always use "MMK" (e.g. 5,000,000 MMK or 4,000 MMK).
- Realistic MMK Pricing: Ensure all values are realistic for Myanmar market economics (for example, a single bottle of drink is around 2,000 to 4,000 MMK, not 400 MMK; software/hosting/marketing items are typically in tens/hundreds of thousands or millions of MMK). Do not just copy dollar amounts and append 'MMK'; scale the values properly (1 USD is roughly equivalent to 3,000 - 4,500 MMK in local purchasing power/exchange).
- Financial constraints: All costs, price points, and revenues must be strictly positive numbers.
- Value Matching: Total cost estimates must be aligned with the user's declared budget (which is in MMK). For instance, if the budget is 5,000,000 MMK, do not propose 20,000,000 MMK in capital expenditures; propose lean items within the budget constraints.
- Markdown Deliverable: Ensure that the 'markdown_deliverable' contains a rich, complete document titled "Financial Model & Projections Report". Use headers (H2, H3), bullet points, and markdown tables.
- Language Alignment: Generate all textual properties, cost item names, revenue forecast descriptions, pricing strategy copy, and markdown_deliverable in the same language as the user's input/concept (e.g. if the raw startup idea is in Burmese, write all these properties in Burmese; if in English, write in English).
- Blueprint Alignment: You MUST strictly respect all constraints, exclusions, and requirements specified in the Refined Startup Concept. For example, if the concept contains "Please Don't Use AI" or "No AI", you must NOT suggest AI API fees or LLM token costs in the costBreakdown or markdown deliverable; propose standard database, templating, manual processing, developer, or hosting costs instead.`;

export async function runFinanceAgent(refinedConcept, businessInfo, marketResearch, apiKey, language) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: 'gemini-3.1-flash-lite',
    maxOutputTokens: 2048,
  });

  const structuredModel = model.withStructuredOutput(FinancialModelSchema);

  const isBurmese = language === 'my' || /[\u1000-\u109F]/.test(refinedConcept.concept);
  const targetLanguage = isBurmese ? "Burmese (မြန်မာဘာသာ) language (using Myanmar script)" : "English language";

  const promptContent = `
Refined Startup Concept:
- Concept Summary: ${refinedConcept.concept}
- Catchy Summary: ${refinedConcept.improved_summary}
- Target Segment: ${refinedConcept.target_audience_refined}

Business Info:
- Budget: ${businessInfo.budget}
- Location: ${businessInfo.location}
- Category: ${businessInfo.business_type}
- Core Painpoint: ${businessInfo.core_painpoint}
- Revenue Stream: ${businessInfo.revenue_stream}

Market Research Insights:
- Saturation Level: ${marketResearch.saturation_level}%
- Target TAM: ${marketResearch.tam}
  `.trim();

  const response = await structuredModel.invoke([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Analyze financial metrics and build the model. IMPORTANT: You MUST write/generate all output fields (thinking, markdown_deliverable, costBreakdown item names, revenueForecast, pricingStrategy, etc.) in the ${targetLanguage}. Do NOT write them in English:\n\n${promptContent}` }
  ]);

  if (!response) {
    throw new Error('Finance Agent did not return a structured response');
  }

  return response;
}
