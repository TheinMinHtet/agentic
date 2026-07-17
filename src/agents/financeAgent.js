import { createDeepAgent } from 'deepagents/browser';
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
          cost: { type: "number", description: "Item cost in dollars." }
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
      description: "A brief description of the proposed pricing strategy (e.g. Free Tier, SaaS Premium tiers)."
    },
    breakevenMonth: {
      type: "integer",
      description: "Estimated number of months to reach the break-even point."
    }
  },
  required: ["thinking", "markdown_deliverable", "costBreakdown", "revenueForecast", "pricingStrategy", "breakevenMonth"]
};

const SYSTEM_PROMPT = `You are the Finance Agent. Your role is to calculate initial setup costs, monthly operating costs, pricing tiers, and break-even timelines.

CRITICAL GUARDRAILS:
- Financial constraints: All costs, price points, and revenues must be strictly positive numbers.
- Value Matching: Total cost estimates must be aligned with the user's declared budget. For instance, if the budget is $1,000, do not propose $10,000 in capital expenditures; propose lean items within the budget constraints.
- Markdown Deliverable: Ensure that the 'markdown_deliverable' contains a rich, complete document titled "Financial Model & Projections Report". Use headers (H2, H3), bullet points, and markdown tables.`;

export async function runFinanceAgent(refinedConcept, businessInfo, marketResearch, apiKey) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: 'gemini-3.1-flash-lite',
    maxOutputTokens: 2048,
  });

  const agent = createDeepAgent({
    model: model,
    systemPrompt: SYSTEM_PROMPT,
    responseFormat: FinancialModelSchema,
  });

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

  const response = await agent.invoke({
    messages: [
      { role: 'user', content: `Analyze financial metrics and build the model:\n\n${promptContent}` }
    ]
  });

  if (!response.structuredResponse) {
    throw new Error('Finance Agent did not return a structured response');
  }

  return response.structuredResponse;
}
