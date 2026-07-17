import { createDeepAgent } from 'deepagents/browser';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const RefinementResponseSchema = {
  type: "object",
  properties: {
    thinking: {
      type: "string",
      description: "Analyze the user request and explain which sections you are updating and why."
    },
    reply_message: {
      type: "string",
      description: "Write a helpful, empathetic, and professional reply explaining what changes you have made."
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
        markdown_deliverable: { type: "string" }
      },
      required: ["costBreakdown", "revenueForecast", "pricingStrategy", "breakevenMonth", "markdown_deliverable"]
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
        markdown_deliverable: { type: "string" }
      },
      required: ["tam", "saturation_level", "opportunities", "competitors", "target_personas", "markdown_deliverable"]
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
        markdown_deliverable: { type: "string" }
      },
      required: ["names", "tagline", "voice", "palette", "logoConcept", "markdown_deliverable"]
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
        markdown_deliverable: { type: "string" }
      },
      required: ["landingPageOutline", "features", "stack", "markdown_deliverable"]
    },
    updated_growthPlan: {
      type: "object",
      properties: {
        channels: { type: "array", items: { type: "string" } },
        acquisitionPlan: { type: "string" },
        roadmap90Day: { type: "array", items: { type: "string" } },
        markdown_deliverable: { type: "string" }
      },
      required: ["channels", "acquisitionPlan", "roadmap90Day", "markdown_deliverable"]
    }
  },
  required: [
    "thinking", 
    "reply_message", 
    "updated_financeModel", 
    "updated_marketResearch", 
    "updated_brandPackage", 
    "updated_digitalPresence", 
    "updated_growthPlan"
  ]
};

const SYSTEM_PROMPT = `You are the Refinement Chat Agent. Your role is to take a user instruction (such as "make it cheaper" or "target college students") and update the existing startup blueprint details.
You must adjust the budget, pricing tiers, target audience personas, marketing channels, and landing page outlines to reflect the changes requested.
You must return the updated objects for ALL sections, maintaining consistency (e.g. if the user says "make it cheaper", lower the expense values in costBreakdown, adjust pricingStrategy, and update the marketing channels/timeline to match a leaner rollout).`;

export async function runRefinementChatAgent(userMessage, currentBlueprint, businessInfo, apiKey) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: 'gemini-3.1-flash-lite',
    maxOutputTokens: 2048,
  });

  const agent = createDeepAgent({
    model: model,
    systemPrompt: SYSTEM_PROMPT,
    responseFormat: RefinementResponseSchema,
  });

  const promptContent = `
User Instruction: "${userMessage}"

Current Blueprint State:
- Business Info: ${JSON.stringify(businessInfo)}
- Finance Model: ${JSON.stringify(currentBlueprint.financeModel)}
- Market Research: ${JSON.stringify(currentBlueprint.marketResearch)}
- Brand Package: ${JSON.stringify(currentBlueprint.brandPackage)}
- Digital Presence: ${JSON.stringify(currentBlueprint.digitalPresence)}
- Growth Plan: ${JSON.stringify(currentBlueprint.growthPlan)}
  `.trim();

  const response = await agent.invoke({
    messages: [
      { role: 'user', content: `Process user instruction and refine the blueprint:\n\n${promptContent}` }
    ]
  });

  if (!response.structuredResponse) {
    throw new Error('Refinement Chat Agent did not return a structured response');
  }

  return response.structuredResponse;
}
