import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const AgenticUpdateResponseSchema = {
  type: "object",
  properties: {
    thinking: {
      type: "string",
      description: "Analyze the user's edits, explain how they are merged, and identify which other sections of the startup blueprint must be regenerated due to these changes."
    },
    affected_tabs: {
      type: "array",
      items: {
        type: "string",
        enum: ["overview", "market", "finance", "brand", "digital", "growth"]
      },
      description: "List of other tabs that are dependent on the edited tab and must be re-run to ensure consistency."
    },
    updated_concept: {
      type: "object",
      properties: {
        concept: { type: "string" },
        improved_summary: { type: "string" },
        key_differentiators: { type: "array", items: { type: "string" } },
        target_audience_refined: { type: "string" },
        thinking: { type: "string" }
      },
      required: ["concept", "improved_summary", "key_differentiators", "target_audience_refined", "thinking"]
    },
    updated_marketResearch: {
      type: "object",
      properties: {
        tam: { type: "string" },
        saturation_level: { type: "integer" },
        opportunities: { type: "array", items: { type: "string" } },
        competitors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              url: { type: "string" },
              weakness: { type: "string" }
            },
            required: ["name", "url", "weakness"]
          }
        },
        target_personas: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              role: { type: "string" },
              pain_points: { type: "array", items: { type: "string" } },
              budget_limit: { type: "string" }
            },
            required: ["name", "role", "pain_points", "budget_limit"]
          }
        },
        markdown_deliverable: { type: "string" },
        thinking: { type: "string" }
      },
      required: ["tam", "saturation_level", "opportunities", "competitors", "target_personas", "markdown_deliverable", "thinking"]
    },
    updated_financeModel: {
      type: "object",
      properties: {
        costBreakdown: {
          type: "array",
          items: {
            type: "object",
            properties: {
              item: { type: "string" },
              cost: { type: "number" }
            },
            required: ["item", "cost"]
          }
        },
        revenueForecast: { type: "string" },
        pricingStrategy: { type: "string" },
        breakevenMonth: { type: "integer" },
        markdown_deliverable: { type: "string" },
        thinking: { type: "string" }
      },
      required: ["costBreakdown", "revenueForecast", "pricingStrategy", "breakevenMonth", "markdown_deliverable", "thinking"]
    },
    updated_brandPackage: {
      type: "object",
      properties: {
        names: { type: "array", items: { type: "string" } },
        tagline: { type: "string" },
        voice: { type: "string" },
        palette: {
          type: "object",
          properties: {
            primary: { type: "string" },
            secondary: { type: "string" },
            background: { type: "string" }
          },
          required: ["primary", "secondary", "background"]
        },
        logoConcept: { type: "string" },
        markdown_deliverable: { type: "string" },
        thinking: { type: "string" }
      },
      required: ["names", "tagline", "voice", "palette", "logoConcept", "markdown_deliverable", "thinking"]
    },
    updated_digitalPresence: {
      type: "object",
      properties: {
        landingPageOutline: {
          type: "array",
          items: {
            type: "object",
            properties: {
              section_id: { type: "string" },
              title: { type: "string" },
              body: { type: "string" },
              cta_text: { type: "string" }
            },
            required: ["section_id", "title", "body", "cta_text"]
          }
        },
        features: { type: "array", items: { type: "string" } },
        stack: { type: "array", items: { type: "string" } },
        markdown_deliverable: { type: "string" },
        thinking: { type: "string" }
      },
      required: ["landingPageOutline", "features", "stack", "markdown_deliverable", "thinking"]
    },
    updated_growthPlan: {
      type: "object",
      properties: {
        channels: { type: "array", items: { type: "string" } },
        acquisitionPlan: { type: "string" },
        roadmap90Day: { type: "array", items: { type: "string" } },
        markdown_deliverable: { type: "string" },
        thinking: { type: "string" }
      },
      required: ["channels", "acquisitionPlan", "roadmap90Day", "markdown_deliverable", "thinking"]
    }
  },
  required: ["thinking", "affected_tabs"]
};

const SYSTEM_PROMPT = `You are the Agentic Update Planner Agent. Your role is to:
1. Merge direct form edits made to any tab of a startup blueprint into the state of that tab.
2. Formulate the clean, fully-populated updated JSON schema for the edited tab.
3. Dynamically evaluate the semantic relationship and business logic impacts of the user's edits across the entire dashboard to decide WHICH other tabs (overview, market, finance, brand, digital, growth) are affected and must be regenerated/re-run to ensure cross-module consistency.

Dynamic Dependency Evaluation Guidelines:
Do not use hardcoded limits; think like an advanced startup strategist. For example:
- If 'overview' (concept) changes (e.g. pivoting product type, core features, or audience): Almost all tabs ("market", "finance", "brand", "digital", "growth") are highly affected and must align.
- If 'market' target customers or tam change: The 'finance' model (projected sales/pricing levels) and 'growth' plan (channels/ICP segments) are highly dependent.
- If 'finance' pricing tiers or setup budget changes: The 'growth' plan (CAC/marketing budgets) or 'digital' presence (pricing tier layout boxes) might need adjustment.
- If 'brand' visual guides or names change: The 'digital' presence (branding logo, primary colors, tagline copy on landing pages) is affected.
- If 'digital' technical stack changes (e.g. from web to mobile): The 'finance' cost breakdown (hosting/server costs vs mobile store developer fees) and 'growth' acquisition plan (app store optimization vs search engine SEO) might be affected.
- If 'growth' channels change: The 'finance' model budget item allocations are affected.

Output Requirements:
- In "affected_tabs", return an array containing any dashboard tab identifiers that are semantically affected by the change and must be re-run.
- Under the corresponding "updated_*" field (e.g. updated_concept if editedTab is 'overview', updated_marketResearch if editedTab is 'market', etc.), return the fully updated, merged object for the edited tab. Do NOT return updated objects for the affected tabs; they will be dynamically re-run by their respective specialized agents.
- Currency: Ensure MMK (Myanmar Kyat) scale and formatting is maintained.
- Language: Output all values in the target language (Burmese if Burmese text exists in input, English otherwise).`;

export async function runAgenticUpdateAgent(editedTab, editedValues, currentBlueprint, businessInfo, apiKey, language) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: 'gemini-3.1-flash-lite',
    maxOutputTokens: 2048,
  });

  const structuredModel = model.withStructuredOutput(AgenticUpdateResponseSchema);

  const isBurmese = language === 'my' ||
                    (editedValues && /[\u1000-\u109F]/.test(JSON.stringify(editedValues))) ||
                    (currentBlueprint.refinedConcept && /[\u1000-\u109F]/.test(currentBlueprint.refinedConcept.concept));
  const targetLanguage = isBurmese ? "Burmese (မြန်မာဘာသာ) language (using Myanmar script)" : "English language";

  const promptContent = `
Edited Tab: "${editedTab}"
New Edited Values: ${JSON.stringify(editedValues)}

Current Blueprint State:
- Business Info: ${JSON.stringify(businessInfo)}
- Concept Overview: ${JSON.stringify(currentBlueprint.refinedConcept)}
- Market Research: ${JSON.stringify(currentBlueprint.marketResearch)}
- Finance Model: ${JSON.stringify(currentBlueprint.financeModel)}
- Brand Package: ${JSON.stringify(currentBlueprint.brandPackage)}
- Digital Presence: ${JSON.stringify(currentBlueprint.digitalPresence)}
- Growth Plan: ${JSON.stringify(currentBlueprint.growthPlan)}
  `.trim();

  const response = await structuredModel.invoke([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Process the edits, merge the active tab state, and identify dependencies. IMPORTANT: You MUST write/generate all updated output fields in the ${targetLanguage}. Do NOT write them in English:\n\n${promptContent}` }
  ]);

  if (!response) {
    throw new Error('Agentic Update Planner Agent did not return a structured response');
  }

  return response;
}
