import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const GrowthPlanSchema = {
  type: "object",
  properties: {
    thinking: {
      type: "string",
      description: "Explain your acquisition channel choices, pricing constraints analysis, and roadmap design."
    },
    markdown_deliverable: {
      type: "string",
      description: "A complete formatted Markdown document for growth_plan.md outlining: Marketing strategy (Customer acquisition channels), and First 90-day roadmap (Actionable execution milestones)."
    },
    channels: {
      type: "array",
      items: { type: "string" },
      description: "Top 3 recommended marketing or acquisition channels."
    },
    acquisitionPlan: {
      type: "string",
      description: "Detailed strategy copy for organic growth and paid acquisition."
    },
    roadmap90Day: {
      type: "array",
      items: { type: "string" },
      description: "At least 3 phases or core milestones for a 90-day execution roadmap."
    }
  },
  required: ["thinking", "markdown_deliverable", "channels", "acquisitionPlan", "roadmap90Day"]
};

const SYSTEM_PROMPT = `You are the Marketing Agent. Your role is to design marketing pipelines, acquisition plans, and launch roadmaps.

CRITICAL GUARDRAILS:
- Budget constraints: If the user's questionnaire budget is small (under 15,000,000 MMK), you must NOT suggest expensive advertising routes like television commercials or physical billboards; prioritize lean organic channels.
- Currency: Always use MMK (Myanmar Kyat) as the primary currency for any costs or pricing references. Do NOT use the dollar symbol ($) or USD.
- Markdown Deliverable: Ensure that the 'markdown_deliverable' contains a rich, complete document titled "Marketing Strategy & 90-Day Roadmap". Use headers (H2, H3) and lists.
- Language Alignment: Generate all recommended channels, acquisition plan copy, 90-day roadmap milestones, thinking, and markdown_deliverable in the same language as the user's input/concept (e.g. if the raw startup idea is in Burmese, write all these properties in Burmese; if in English, write in English).
- Blueprint Alignment: You MUST strictly respect all constraints, exclusions, and requirements specified in the Refined Startup Concept. For example, if the concept contains "Please Don't Use AI" or "No AI", you must NOT suggest AI-driven marketing strategies or AI assistants in the channels, acquisitionPlan, or roadmap; propose traditional marketing, community events, organic search, or non-AI digital channels instead. If it is a mobile app, prioritize mobile store channels.`;

export async function runMarketingAgent(refinedConcept, businessInfo, marketResearch, apiKey, language) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: 'gemini-3.1-flash-lite',
    maxOutputTokens: 2048,
  });

  const structuredModel = model.withStructuredOutput(GrowthPlanSchema);

  const isBurmese = language === 'my' || /[\u1000-\u109F]/.test(refinedConcept.concept);
  const targetLanguage = isBurmese ? "Burmese (မြန်မာဘာသာ) language (using Myanmar script)" : "English language";

  const promptContent = `
Refined Startup Concept:
- Concept Summary: ${refinedConcept.concept}
- Catchy Summary: ${refinedConcept.improved_summary}
- Target Segment: ${refinedConcept.target_audience_refined}
- Key Differentiators: ${refinedConcept.key_differentiators.join(', ')}

Business Info:
- Budget: ${businessInfo.budget}
- Location: ${businessInfo.location}
- Category: ${businessInfo.business_type}

Market Research:
- Persona Details: ${JSON.stringify(marketResearch.target_personas)}
- Market Saturation: ${marketResearch.saturation_level}%
  `.trim();

  const response = await structuredModel.invoke([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Create marketing strategy and roadmap. IMPORTANT: You MUST write/generate all output fields (thinking, markdown_deliverable, channels, acquisitionPlan, roadmap90Day, etc.) in the ${targetLanguage}. Do NOT write them in English:\n\n${promptContent}` }
  ]);

  if (!response) {
    throw new Error('Marketing Agent did not return a structured response');
  }

  return response;
}
