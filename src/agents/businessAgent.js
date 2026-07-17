import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const LeanCanvasOutputSchema = {
  type: "object",
  properties: {
    thinking: {
      type: "string",
      description: "Explain your consolidation strategy and how you structured the 9-box Lean Canvas."
    },
    lean_canvas_markdown: {
      type: "string",
      description: "Complete, beautifully formatted Markdown string of the 9-box Lean Canvas (incorporating Problem, Solution, Key Metrics, UVP, Unfair Advantage, Channels, Customer Segments, Cost Structure, and Revenue Streams)."
    }
  },
  required: ["thinking", "lean_canvas_markdown"]
};

const SYSTEM_PROMPT = `You are the Business Agent (The Integrator). Your role is to consolidate outputs from all specialized downstream agents to compile a comprehensive, unified Lean Canvas deliverable in Markdown format.

CRITICAL GUARDRAILS:
- Structure preserving: Output a standard 9-box Lean Canvas (Problem, Solution, Key Metrics, Unique Value Proposition, Unfair Advantage, Channels, Customer Segments, Cost Structure, Revenue Streams) as a well-formed Markdown document.
- Information fidelity: Use only details directly derived from other agent outputs; do not fabricate numbers or metrics.
- Language Alignment: Generate all textual descriptions, 9-box fields in the Lean Canvas, thinking explanation, and the final markdown deliverable in the same language as the user's input/concept (e.g. if the raw startup idea is in Burmese, write all these fields/documents in Burmese; if in English, write in English).`;

export async function runBusinessAgent(refinedConcept, marketResearch, financeModel, brandPackage, digitalPresence, growthPlan, apiKey) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: 'gemini-3.1-flash-lite',
    maxOutputTokens: 2048,
  });

  const structuredModel = model.withStructuredOutput(LeanCanvasOutputSchema);

  const isBurmese = /[\u1000-\u109F]/.test(refinedConcept.concept);
  const targetLanguage = isBurmese ? "Burmese (မြန်မာဘာသာ) language (using Myanmar script)" : "English language";

  const promptContent = `
Startup Concept:
- Concept Summary: ${refinedConcept.concept}
- Key Differentiators: ${refinedConcept.key_differentiators.join(', ')}

Market Research:
- TAM: ${marketResearch.tam}
- Persona segments: ${JSON.stringify(marketResearch.target_personas)}
- Opportunities: ${marketResearch.opportunities.join(', ')}

Financial Model:
- Cost breakdown: ${JSON.stringify(financeModel.costBreakdown)}
- Revenue forecast: ${financeModel.revenueForecast}
- Pricing strategy: ${financeModel.pricingStrategy}
- Breakeven Month: Month ${financeModel.breakevenMonth}

Branding:
- Suggested Names: ${brandPackage.names.join(', ')}
- Tagline: ${brandPackage.tagline}
- Brand Voice: ${brandPackage.voice}

Digital Presence:
- Core features: ${digitalPresence.features.join(', ')}
- Stack: ${digitalPresence.stack.join(', ')}

Growth Plan:
- Acquisition channels: ${growthPlan.channels.join(', ')}
- Acquisition strategy: ${growthPlan.acquisitionPlan}
- 90-day roadmap milestones: ${growthPlan.roadmap90Day.join(', ')}
  `.trim();

  const response = await structuredModel.invoke([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Consolidate these insights and compile a beautifully formatted Lean Canvas markdown table and description. IMPORTANT: You MUST write/generate all output fields (thinking, lean_canvas_markdown) in the ${targetLanguage}. Do NOT write them in English:\n\n${promptContent}` }
  ]);

  if (!response) {
    throw new Error('Business Agent did not return a structured response');
  }

  return response;
}
