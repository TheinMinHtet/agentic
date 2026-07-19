import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { scheduleCalendarTool } from './tools/executionTools.js';

/**
 * Roadmap Calendar Update Agent (True Tool-Calling Agent)
 * Binds `schedule_calendar_tool` and validates natural language prompts to modify milestone dates/descriptions.
 * Rejects any non-calendar prompts.
 */
export async function runCalendarUpdateAgent(userPrompt, currentMilestones, apiKey, language) {
    const model = new ChatGoogleGenerativeAI({
        apiKey: process.env.UPDATE_AGENT_API_KEY || process.env.NEXT_PUBLIC_UPDATE_AGENT_API_KEY || apiKey || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY,
        model: 'gemini-3.1-flash-lite',
        maxOutputTokens: 2048,
        temperature: 0.1
    }).bindTools([scheduleCalendarTool]);

    const isBurmese = language === 'my' || /[\u1000-\u109F]/.test(userPrompt);
    const targetLang = isBurmese ? "Burmese (မြန်မာဘာသာ)" : "English";

    const systemPrompt = `You are the WarRoom Roadmap Calendar Update Agent. Your ONLY responsibility is to process user instructions to modify, reschedule, shift dates, add, or update roadmap execution milestones.

CRITICAL RULES FOR CALENDAR & DATE SHIFTS:
1. MANDATORY TOOL CALLING FOR ANY DATE OR MILESTONE SHIFT:
   If the user's prompt mentions ANY date modification, day change, month shift, phase reschedule, or calendar instruction (for example: "၁၉ ရက်နေ့ ဇူလိုင်ကို နှစ်ဆယ်ရက် တနင်္လာနေ့ ပြောင်းပေးပါ" meaning change July 19 to Monday July 20th, or "move Alpha Launch by 2 weeks", or "change date to October 1st"), THIS IS A VALID CALENDAR REQUEST.
   - You MUST NOT reject it.
   - You MUST invoke the \`schedule_calendar_tool\` tool (` + "`schedule_calendar_tool`" + `) immediately.
   - Pass ALL milestones inside the \`milestones\` array argument of \`schedule_calendar_tool\`, updating the date(s) of the matching milestone(s) (or Phase 1 if general) to the requested date in ISO format (YYYY-MM-DD), and preserving remaining milestones.

2. REJECTION OF STRICTLY NON-CALENDAR PROMPTS ONLY:
   Only if the user's prompt is completely unrelated to calendars, dates, timelines, or roadmap phases (for example, asking general trivia, jokes, changing business names, programming questions), ONLY THEN reject the request without calling tools and output:
     ${isBurmese 
        ? '"တောင်းပန်ပါသည်။ ကျွန်ုပ်သည် Roadmap Calendar (တိုးတက်မှု ပြက္ခဒိန်) ရက်စွဲပြောင်းလဲခြင်း၊ Phase များ ရွှေ့ဆိုင်းခြင်းနှင့် Milestone ခေါင်းစဉ်/အသေးစိတ် ပြင်ဆင်ခြင်းများကိုသာ ဆောင်ရွက်ပေးနိုင်ပါသည်။ ကျေးဇူးပြု၍ ပြက္ခဒိန်နှင့် ဆိုင်သော ပြင်ဆင်ချက် ညွှန်ကြားချက်ကိုသာ ထည့်သွင်းပေးပါ။"'
        : '"Sorry, I can only process roadmap calendar modifications (such as shifting dates, rescheduling milestones, or modifying phase descriptions). Please provide a valid calendar update request."'}
`;

    const userMessage = `Current Roadmap Milestones:
${JSON.stringify(currentMilestones, null, 2)}

User Instruction for Calendar Edit:
"${userPrompt}"

If this is about shifting or modifying any date/milestone/timeline, invoke \`schedule_calendar_tool\` right now with the complete updated \`milestones\` array (using YYYY-MM-DD format). If it is totally unrelated to calendar/timelines, respond with the rejection message.`;

    try {
        const res = await model.invoke([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ]);

        // Check tool_calls or additional_kwargs for schedule_calendar_tool
        const toolCalls = res.tool_calls && res.tool_calls.length > 0
            ? res.tool_calls
            : (res.additional_kwargs?.tool_calls || []);

        if (toolCalls && toolCalls.length > 0) {
            const toolCall = toolCalls.find(tc => 
                tc.name === 'schedule_calendar_tool' || 
                tc.name === 'scheduleCalendarTool' || 
                tc.function?.name === 'schedule_calendar_tool'
            );
            if (toolCall) {
                const args = toolCall.args || (typeof toolCall.function?.arguments === 'string' ? JSON.parse(toolCall.function.arguments) : toolCall.function?.arguments);
                const toolOutputJson = await scheduleCalendarTool.invoke(args);
                const parsedOutput = JSON.parse(toolOutputJson);

                return {
                    success: true,
                    status: "SUCCESS_CALENDAR_UPDATED",
                    tool_called: "schedule_calendar_tool",
                    updated_milestones: parsedOutput.schedule.map(s => ({
                        phase: s.phase,
                        date: s.date,
                        title: s.title,
                        desc: s.description,
                        google_calendar_link: s.google_calendar_link
                    })),
                    message: isBurmese 
                        ? `schedule_calendar_tool ကို အသုံးပြု၍ Roadmap Calendar ရှိ အဆင့် (${parsedOutput.schedule.length}) ခုလုံးကို အောင်မြင်စွာ ပြင်ဆင်ချိန်းဆိုပြီးပါပြီ။`
                        : `Successfully updated ${parsedOutput.schedule.length} milestones using schedule_calendar_tool.`
                };
            }
        }

        // Check if the model output JSON or text describing tool call in content
        if (typeof res.content === 'string' && res.content.includes('schedule_calendar_tool')) {
            try {
                const jsonMatch = res.content.match(/\{[\s\S]*"milestones"[\s\S]*\}/);
                if (jsonMatch) {
                    const parsedArgs = JSON.parse(jsonMatch[0]);
                    const toolOutputJson = await scheduleCalendarTool.invoke(parsedArgs);
                    const parsedOutput = JSON.parse(toolOutputJson);
                    return {
                        success: true,
                        status: "SUCCESS_CALENDAR_UPDATED",
                        tool_called: "schedule_calendar_tool",
                        updated_milestones: parsedOutput.schedule.map(s => ({
                            phase: s.phase,
                            date: s.date,
                            title: s.title,
                            desc: s.description,
                            google_calendar_link: s.google_calendar_link
                        })),
                        message: isBurmese 
                            ? `schedule_calendar_tool ကို အသုံးပြု၍ Roadmap Calendar ရှိ အဆင့် (${parsedOutput.schedule.length}) ခုလုံးကို အောင်မြင်စွာ ပြင်ဆင်ချိန်းဆိုပြီးပါပြီ။`
                            : `Successfully updated ${parsedOutput.schedule.length} milestones using schedule_calendar_tool.`
                    };
                }
            } catch (e) {
                console.warn("Fallback parsing of content failed:", e);
            }
        }

        const replyText = res.content || (isBurmese 
            ? "တောင်းပန်ပါသည်။ ညွှန်ကြားချက်သည် Roadmap Calendar ရက်စွဲပြောင်းလဲခြင်းနှင့် မဆိုင်သောကြောင့် လက်မခံနိုင်ပါ။" 
            : "Sorry, this request is not related to calendar modification and was rejected.");

        return {
            success: false,
            status: "REJECTED_INVALID_PROMPT",
            tool_called: null,
            message: replyText
        };
    } catch (error) {
        console.error("Calendar Update Agent error:", error);
        throw new Error(`Calendar Update Agent Error: ${error.message}`);
    }
}
