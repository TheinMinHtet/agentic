import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const RoadmapBreakdownSchema = {
  type: "object",
  properties: {
    weeks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          weekNumber: { type: "integer", minimum: 1, maximum: 12 },
          milestoneTitle: { type: "string", description: "The overarching theme/milestone of this week" },
          milestoneDescription: { type: "string" },
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                dayOffset: { type: "integer", description: "The day offset from launch day (1 to 90)" },
                title: { type: "string", description: "Short actionable task title (max 5 words)" },
                desc: { type: "string", description: "One-sentence description of the task." },
                type: { type: "string", enum: ["planning", "execution", "review"] }
              },
              required: ["dayOffset", "title", "desc", "type"]
            }
          }
        },
        required: ["weekNumber", "milestoneTitle", "milestoneDescription", "tasks"]
      }
    }
  },
  required: ["weeks"]
};

const SYSTEM_PROMPT = `You are the Launch Coordinator Agent. Your task is to take a high-level 90-day startup roadmap and break it down into 12 weekly sprints, with 3 specific actionable tasks per week (representing Monday planning, Wednesday execution, and Friday review).

CRITICAL DIRECTIVES:
- Ingest the 3-phase high-level roadmap and generate exactly 12 weeks of detailed milestone sprints.
- Map the day offsets correctly (Week 1 = Days 1, 3, 5; Week 2 = Days 8, 10, 12; ... Week 12 = Days 78, 80, 82).
- Tailor the task contents dynamically based on the startup's category (SaaS vs Local Brick-and-mortar vs Food & Beverage etc.) so the tasks are highly realistic.
- Keep task description and title strings extremely concise (under 12 words) to prevent token overflow.
- Currency: Use MMK for any cost references.
- Language: Generate all content in the same language as the input roadmap (if Burmese, write all title and desc fields in Burmese; if English, write in English).`;

export async function runRoadmapBreakdownAgent(refinedConcept, businessInfo, growthPlan, apiKey, language) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.UPDATE_AGENT_API_KEY || process.env.NEXT_PUBLIC_UPDATE_AGENT_API_KEY || apiKey || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    model: 'gemini-3.1-flash-lite',
    maxOutputTokens: 8192,
  });

  const structuredModel = model.withStructuredOutput(RoadmapBreakdownSchema);

  const isBurmese = language === 'my' || /[\u1000-\u109F]/.test(refinedConcept?.concept || "");
  const targetLanguage = isBurmese ? "Burmese (မြန်မာဘာသာ) language (using Myanmar script)" : "English language";

  const promptContent = `
Startup Concept: ${refinedConcept?.concept || ''}
Category: ${businessInfo?.business_type || ''}
Budget: ${businessInfo?.budget || ''}

90-Day Phases Roadmap:
1. Days 1-30: ${growthPlan?.roadmap90Day?.[0] || ''}
2. Days 31-60: ${growthPlan?.roadmap90Day?.[1] || ''}
3. Days 61-90: ${growthPlan?.roadmap90Day?.[2] || ''}
  `.trim();

  const response = await structuredModel.invoke([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Break down the roadmap into 12 weekly sprints. You MUST write/generate all output fields in ${targetLanguage}:\n\n${promptContent}` }
  ]);

  if (!response) {
    throw new Error('Roadmap breakdown agent did not return a structured response');
  }

  return response;
}
