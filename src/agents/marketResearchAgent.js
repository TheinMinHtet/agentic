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
      description: "Estimated Total Addressable Market (TAM), e.g. $4.2B."
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
          budget_limit: { type: "string", description: "Persona spending capacity or budget description." }
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
- Markdown Deliverable: Ensure that the 'markdown_deliverable' contains a rich, complete document titled "Market Intelligence Report". Use headers (H2, H3), bullet points, and markdown tables. Outline Target Market, Competitors Mapping, and Trends/Saturation.`;

export async function runMarketResearchAgent(refinedConcept, businessInfo, apiKey) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: 'gemini-3.1-flash-lite',
    maxOutputTokens: 2048,
  });

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

  const response = await model.invoke([
    {
      role: 'system',
      content: `${SYSTEM_PROMPT}

Return only valid JSON matching this JSON Schema:
${JSON.stringify(MarketIntelligenceSchema)}`
    },
    {
      role: 'user',
      content: `Perform market research for this startup concept:\n\n${promptContent}`
    }
  ]);

  const content = Array.isArray(response.content)
    ? response.content.map(part => typeof part === 'string' ? part : part.text || '').join('')
    : response.content;
  const jsonText = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const structuredResponse = JSON.parse(jsonText);

  if (!structuredResponse) {
    throw new Error('Market Research Agent did not return a structured response');
  }

  return structuredResponse;
}
