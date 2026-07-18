import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export async function runOnboardingAgent(userMessage, chatHistory, location, category, apiKey, language = 'en') {
  if (!apiKey) throw new Error('API key is missing.');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction: `You are a friendly, expert startup incubator agent interviewing an entrepreneur.
Their business will operate in the '${location}' setting, in the '${category}' category.
Your goal is to gather enough information to form a complete business concept.
You must gather at least 7 core details:
1. What the core product or service is.
2. Who the exact target audience is.
3. The main problem it solves for them.
4. An estimated budget or constraints.
5. The desired timeline to launch.
6. The experience level of the founder.
7. How they plan to make money (revenue stream).

Ask ONE clear, engaging question at a time. Keep it conversational and encouraging. Do not overwhelm them with multiple questions in one message.
Always calculate and return 'requirements_met_count' as an integer (0-7) representing how many of these 7 details you have successfully gathered so far from the conversation history.
If you have gathered all 7 details, set "is_complete" to true and populate "business_info_payload" and "startup_idea_summary".
Otherwise, set "is_complete" to false, and ask the next question in "reply_message".

Language: Please reply in ${language === 'mm' ? 'Burmese' : 'English'}.
`,
  });

  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      reply_message: {
        type: SchemaType.STRING,
        description: "The next question or response to the user. Leave empty if is_complete is true and no further discussion is needed."
      },
      is_complete: {
        type: SchemaType.BOOLEAN,
        description: "True if you have gathered all necessary information about the business idea."
      },
      requirements_met_count: {
        type: SchemaType.INTEGER,
        description: "An integer from 0 to 7 representing how many of the 7 core requirements have been successfully gathered so far."
      },
      startup_idea_summary: {
        type: SchemaType.STRING,
        description: "A detailed 2-3 sentence pitch of the startup. Only populate if is_complete is true."
      },
      business_info_payload: {
        type: SchemaType.OBJECT,
        description: "Only populate if is_complete is true.",
        properties: {
          title: { type: SchemaType.STRING, description: "A catchy name or title for the idea" },
          location: { type: SchemaType.STRING, description: "Keep it to what they said, or fallback to their Online/Offline preference." },
          budget: { type: SchemaType.STRING },
          target_customers: { type: SchemaType.STRING },
          business_type: { type: SchemaType.STRING },
          experience_level: { type: SchemaType.STRING },
          goal: { type: SchemaType.STRING, description: "local, scalable, or online" },
          core_painpoint: { type: SchemaType.STRING },
          launch_timeline: { type: SchemaType.STRING },
          revenue_stream: { type: SchemaType.STRING }
        },
        required: ["title", "location", "budget", "target_customers", "business_type", "experience_level", "goal", "core_painpoint", "launch_timeline", "revenue_stream"]
      }
    },
    required: ["reply_message", "is_complete", "requirements_met_count"]
  };

  const generationConfig = {
    temperature: 0.7,
    responseMimeType: "application/json",
    responseSchema: responseSchema,
  };

  // Build conversation history
  const contents = chatHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  // Add latest message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  try {
    const result = await model.generateContent({
      contents,
      generationConfig
    });

    const textOutput = result.response.text();
    const jsonOutput = JSON.parse(textOutput);
    return jsonOutput;
  } catch (err) {
    console.error("Error in runOnboardingAgent:", err);
    throw err;
  }
}
