import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const DigitalPresenceSchema = {
  type: "object",
  properties: {
    thinking: {
      type: "string",
      description: "Explain your wireframe structure choices, component layout logic, and stack decisions."
    },
    markdown_deliverable: {
      type: "string",
      description: "A complete formatted Markdown document for digital_presence.md outlining: Website prototype (Layout blocks and key app capabilities), and Landing page (CTA elements and wireframe structure)."
    },
    landingPageOutline: {
      type: "array",
      items: {
        type: "object",
        properties: {
          section_id: { type: "string", description: "e.g., hero, features, benefits, testimonials, cta" },
          title: { type: "string", description: "Section heading text." },
          body: { type: "string", description: "Copy tailored to the startup branding voice." },
          cta_text: { type: "string", description: "Button text for call-to-action, or None." }
        },
        required: ["section_id", "title", "body", "cta_text"]
      },
      description: "Proposed layout blocks on the home page."
    },
    features: {
      type: "array",
      items: { type: "string" },
      description: "Top 3 core software capabilities or service features."
    },
    stack: {
      type: "array",
      items: { type: "string" },
      description: "List of technologies recommended for development."
    }
  },
  required: ["thinking", "markdown_deliverable", "landingPageOutline", "features", "stack"]
};

const SYSTEM_PROMPT = `You are the Website/Product Agent. Your role is to define structural landing page features, wireframe layouts, CTA placements, and technical stack recommendations.

CRITICAL GUARDRAILS:
- No broken HTML: Only return structured arrays representing layout content blocks.
- Markdown Deliverable: Ensure that the 'markdown_deliverable' contains a rich, complete document titled "Digital Presence & Wireframe Specification". Use headers (H2, H3) and lists.
- Language Alignment: Generate all textual properties, section titles, body copywriting, CTA buttons text, core service features list, and markdown_deliverable in the same language as the user's input/concept (e.g. if the raw startup idea is in Burmese, write all these properties in Burmese; if in English, write in English). Technical terms (like technologies in stack) may remain in standard technical terms/English if appropriate.
- Blueprint Alignment: You MUST strictly respect all constraints, exclusions, and requirements specified in the Refined Startup Concept. For example, if the concept contains "Please Don't Use AI" or "No AI", you must NOT recommend AI APIs or LLM tech stacks (like Gemini API, OpenAI, or LangChain) in the stack list or landingPageOutline; propose standard application servers, databases, templating systems, or search engines instead. If it is a mobile app, align wireframes and stacks to mobile (e.g. React Native, Flutter, Swift).`;

export async function runWebsiteAgent(refinedConcept, businessInfo, brandPackage, apiKey, language) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: 'gemini-3.1-flash-lite',
    maxOutputTokens: 2048,
  });

  const structuredModel = model.withStructuredOutput(DigitalPresenceSchema);

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

Brand Assets:
- Suggest Names: ${brandPackage.names.join(', ')}
- Brand Voice: ${brandPackage.voice}
- Recommended colors (primary, secondary): ${brandPackage.palette.primary}, ${brandPackage.palette.secondary}
  `.trim();

  const response = await structuredModel.invoke([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Design website wireframe and recommend stack. IMPORTANT: You MUST write/generate all output fields (thinking, markdown_deliverable, landingPageOutline, features, etc.) in the ${targetLanguage}. Do NOT write them in English:\n\n${promptContent}` }
  ]);

  if (!response) {
    throw new Error('Website Agent did not return a structured response');
  }

  return response;
}
