import { createDeepAgent } from 'deepagents/browser';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const AutoRefineSchema = {
  type: "object",
  properties: {
    refined_idea: {
      type: "string",
      description: "The newly rewritten and expanded business pitch."
    }
  },
  required: ["refined_idea"]
};

const SYSTEM_PROMPT = `You are an expert startup advisor and copywriter.
Your task is to take a user's raw, underdeveloped startup idea and automatically expand it into a comprehensive, professional, 2-3 sentence business pitch. 

The new pitch MUST:
1. Clearly state the target audience.
2. Clearly state the specific problem being solved.
3. Clearly state the proposed solution.
4. Address the missing elements identified in the feedback questions.

Make reasonable, professional assumptions to flesh out the idea if the user hasn't provided details. DO NOT ask any questions. DO NOT add conversational filler. ONLY return the rewritten pitch text.

CRITICAL GUARDRAIL - LANGUAGE ALIGNMENT:
- Generate the refined_idea in the same language as the user's input/raw idea (e.g. if the raw idea is in Burmese, write the refined pitch in Burmese; if in English, write in English).`;

export async function autoRefineIdeaAsync(rawIdea, clarificationQuestions) {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
  
  if (!apiKey) {
    // Fallback if no API key
    await new Promise((resolve) => setTimeout(resolve, 800));
    return rawIdea + " (Local fallback: This is an auto-refined version that addresses your target audience, problem, and monetization strategy.)";
  }

  const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: 'gemini-3.1-flash-lite',
    maxOutputTokens: 2048,
  });

  const agent = createDeepAgent({
    model: model,
    systemPrompt: SYSTEM_PROMPT,
    responseFormat: AutoRefineSchema,
  });

  const questionsText = clarificationQuestions && clarificationQuestions.length > 0 
    ? `\n\nMissing elements to address (use your expertise to fill these in intelligently):\n- ${clarificationQuestions.join('\n- ')}`
    : '';

  const prompt = `Raw Idea:\n"${rawIdea}"${questionsText}\n\nRewrite this into a strong, professional startup pitch.`;

  try {
    const result = await agent.invoke({
      messages: [{ role: 'user', content: prompt }]
    });

    if (result.structuredResponse && result.structuredResponse.refined_idea) {
      return result.structuredResponse.refined_idea;
    }
    
    return rawIdea;
  } catch (error) {
    console.error("Auto-refinement failed:", error);
    return rawIdea;
  }
}
