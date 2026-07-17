import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const BrandPackageSchema = {
  type: "object",
  properties: {
    thinking: {
      type: "string",
      description: "Explain your branding analysis, name generation rationale, and color selection process."
    },
    markdown_deliverable: {
      type: "string",
      description: "A complete formatted Markdown document for brand_package.md outlining: Logo (Suggested brand names & visual style), Brand voice (Tone of voice guidelines), and Visual identity (Color palette hex codes & typography guidance)."
    },
    names: {
      type: "array",
      items: { type: "string" },
      description: "List of exactly 5 unique, short, and catchy brand name ideas (consisting of single or dual-word names)."
    },
    tagline: {
      type: "string",
      description: "A short, catchy marketing tagline."
    },
    voice: {
      type: "string",
      description: "Tone of voice guidelines, e.g. Professional, Friendly, Bold, Educational."
    },
    palette: {
      type: "object",
      properties: {
        primary: { type: "string", description: "Primary hex color code, e.g., #1b0624." },
        secondary: { type: "string", description: "Secondary hex color code, e.g., #aeec1d." },
        background: { type: "string", description: "Background hex color code, e.g., #ffffff." }
      },
      required: ["primary", "secondary", "background"],
      description: "Hex codes for primary, secondary, and background colors."
    },
    logoConcept: {
      type: "string",
      description: "Description of the visual logo icon concept."
    }
  },
  required: ["thinking", "markdown_deliverable", "names", "tagline", "voice", "palette", "logoConcept"]
};

const SYSTEM_PROMPT = `You are the Brand Agent. Your job is to generate brand identities including name suggestions, visual aesthetics, tagline, tone of voice, and logo concepts.

CRITICAL GUARDRAILS:
- Design guidelines: You must output actual hex codes (e.g. #1b0624) rather than descriptive colors (e.g. "soft blue").
- Naming constraints: Suggested brand names must consist of single or dual-word names (excluding complex phrases). Brand names can be in either English or Burmese as appropriate for the market, but other brand components must align with the input language.
- Markdown Deliverable: Ensure that the 'markdown_deliverable' contains a rich, complete document titled "Brand Identity & Style Guide". Use headers (H2, H3), lists, and visual code blocks showing hex colors.
- Language Alignment: Generate all textual properties, descriptions, tagline, tone of voice guidelines, logo concept, and markdown_deliverable in the same language as the user's input/concept (e.g. if the raw startup idea is in Burmese, write all these properties in Burmese; if in English, write in English).`;

export async function runBrandAgent(refinedConcept, businessInfo, apiKey) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: 'gemini-3.1-flash-lite',
    maxOutputTokens: 2048,
  });

  const structuredModel = model.withStructuredOutput(BrandPackageSchema);

  const isBurmese = /[\u1000-\u109F]/.test(refinedConcept.concept);
  const targetLanguage = isBurmese ? "Burmese (မြန်မာဘာသာ) language (using Myanmar script)" : "English language";

  const promptContent = `
Refined Startup Concept:
- Concept Summary: ${refinedConcept.concept}
- Catchy Summary: ${refinedConcept.improved_summary}
- Target Segment: ${refinedConcept.target_audience_refined}
- Core Painpoint: ${businessInfo.core_painpoint}
- Business Type: ${businessInfo.business_type}
  `.trim();

  const response = await structuredModel.invoke([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Generate branding assets for this concept. IMPORTANT: You MUST write/generate all output fields (thinking, markdown_deliverable, tagline, voice, logoConcept, etc.) in the ${targetLanguage}. Do NOT write them in English:\n\n${promptContent}` }
  ]);

  if (!response) {
    throw new Error('Brand Agent did not return a structured response');
  }

  return response;
}
