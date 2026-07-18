import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const RefinedConceptSchema = {
  type: "object",
  properties: {
    thinking: {
      type: "string",
      description: "Explain your analysis of the raw idea and why/how you are refining it."
    },
    concept: {
      type: "string",
      description: "A refined, professional, and clear startup concept summary."
    },
    improved_summary: {
      type: "string",
      description: "A catchy one-sentence value proposition for the startup."
    },
    key_differentiators: {
      type: "array",
      items: { type: "string" },
      description: "List of exactly 3 unique differentiators for this startup."
    },
    target_audience_refined: {
      type: "string",
      description: "A detailed description of the primary customer segment refined from the input."
    }
  },
  required: ["thinking", "concept", "improved_summary", "key_differentiators", "target_audience_refined"]
};

const SYSTEM_PROMPT = `You are the Refinement Agent. Your role is to take a raw business idea and questionnaire inputs (such as location, budget, target customers, business type, experience level, goal, core painpoint, and launch timeline) and synthesize it into a highly professional, cohesive, and refined startup concept.
Formulate a clear value proposition, identify exactly 3 key competitive differentiators, and refine the target audience description.
Focus on highlighting how the solution solves the core pain points under the specific business constraints (e.g. budget, timeline).

CRITICAL GUARDRAILS:
- Currency Alignment: Always describe and align any monetary references, targets, or pricing examples in terms of MMK (Myanmar Kyat) rather than USD ($) or standard dollar units.
- Language Alignment: Generate all textual properties in the output schema (such as thinking, concept, improved_summary, key_differentiators, target_audience_refined) in the same language as the user's input raw idea/concept (e.g. if the raw startup idea is in Burmese, write all properties in Burmese; if in English, write in English).`;

export async function runRefinementAgent(rawIdea, businessInfo, apiKey, language) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: 'gemini-3.1-flash-lite',
    maxOutputTokens: 2048,
  });

  const structuredModel = model.withStructuredOutput(RefinedConceptSchema);

  const isBurmese = language === 'my' || /[\u1000-\u109F]/.test(rawIdea);
  const targetLanguage = isBurmese ? "Burmese (မြန်မာဘာသာ) language (using Myanmar script)" : "English language";

  const promptContent = `
Raw Startup Idea:
${rawIdea}

Business Context:
- Business Type: ${businessInfo.business_type}
- Goal Type: ${businessInfo.goal}
- Primary Target Audience: ${businessInfo.target_customers}
- Primary Revenue Stream: ${businessInfo.revenue_stream}
- Location: ${businessInfo.location}
- Budget: ${businessInfo.budget}
- Experience Level: ${businessInfo.experience_level}
- Launch Timeline: ${businessInfo.launch_timeline}
- Core Painpoint: ${businessInfo.core_painpoint}
  `.trim();

  const response = await structuredModel.invoke([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Refine this startup concept. IMPORTANT: You MUST write/generate all output fields (thinking, concept, improved_summary, key_differentiators, target_audience_refined) in the ${targetLanguage}. Do NOT write them in English:\n\n${promptContent}` }
  ]);

  if (!response) {
    throw new Error('Refinement Agent did not return a structured response');
  }

  return response;
}

