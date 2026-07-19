import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { draftInvestorEmailTool } from './tools/executionTools.js';

/**
 * Investor Email Drafting Agent (True Tool-Calling Agent)
 * Binds `draft_investor_email_tool` and generates tailored, high-converting investor pitch letters and report summaries.
 */
export async function runEmailDraftingAgent({ recipientName, recipientEmail, customFocus, docTitle, docContent, businessName, language, apiKey }) {
    const model = new ChatGoogleGenerativeAI({
        apiKey: process.env.UPDATE_AGENT_API_KEY || process.env.NEXT_PUBLIC_UPDATE_AGENT_API_KEY || apiKey || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY,
        model: 'gemini-3.1-flash-lite',
        maxOutputTokens: 2048,
        temperature: 0.2
    }).bindTools([draftInvestorEmailTool]);

    const isBurmese = language === 'my' || /[\u1000-\u109F]/.test(customFocus || '');
    const targetLang = isBurmese ? "Burmese (မြန်မာဘာသာ)" : "English";

    const systemPrompt = `You are the WarRoom Executive Investor Relations AI Agent. Your ONLY responsibility is to draft a highly professional, compelling, and customized investor pitch email or report cover letter by calling the \`draft_investor_email_tool\`.

CRITICAL RULES:
1. YOU MUST INVOKE \`draft_investor_email_tool\` (` + "`draft_investor_email_tool`" + `) IMMEDIATELY upon receiving the recipient and report details.
2. Structure the arguments cleanly:
   - \`recipientName\`: The exact name/title provided for the recipient.
   - \`recipientEmail\`: The exact email address provided.
   - \`subject\`: A sharp, high-impact subject line referencing ${businessName || 'our startup'} and the specific deliverable (${docTitle}). If custom focus is provided, reflect its angle.
   - \`greeting\`: Formal personalized greeting (e.g. "Dear ${recipientName || 'Investor'},").
   - \`executiveSummary\`: Summarize the core value, problem solved, and key narrative from the provided report content in 2 powerful paragraphs.
   - \`keyBulletPoints\`: Extract 3-4 specific, quantitative, or high-impact takeaways from the document (e.g., TAM, breakeven timeframe, differentiators, growth metrics).
   - \`callToAction\`: Propose a clear, professional next step (e.g., a brief 15-minute presentation or review of the attached PDF report).
   - \`closing\`: Professional sign-off (e.g., "Best regards,\\nFounding Executive Team").
3. Language format: Write the draft in ${targetLang}. If writing in Burmese, maintain formal executive business Burmese vocabulary.
`;

    const userMessage = `Startup / Business Name: ${businessName || 'GrantFlow AI / Venture'}
Deliverable Report Title: ${docTitle}
Deliverable Content Summary / Snippet:
${(docContent || '').substring(0, 3000)}

Recipient Details:
- Name/Title: ${recipientName || 'Valued Investor'}
- Email: ${recipientEmail || 'investor@vc.com'}
- Custom Notes / Focus from User: ${customFocus || 'Please highlight our key metrics and competitive edge.'}

Invoke \`draft_investor_email_tool\` right now with the complete structured email draft.`;

    try {
        const res = await model.invoke([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ]);

        const toolCalls = res.tool_calls && res.tool_calls.length > 0
            ? res.tool_calls
            : (res.additional_kwargs?.tool_calls || []);

        if (toolCalls && toolCalls.length > 0) {
            const tc = toolCalls.find(c => 
                c.name === 'draft_investor_email_tool' || 
                c.name === 'draftInvestorEmailTool' || 
                c.function?.name === 'draft_investor_email_tool'
            );

            if (tc) {
                const args = tc.args || tc.function?.arguments;
                const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
                
                return {
                    status: 'success',
                    recipient_name: parsedArgs.recipientName || recipientName,
                    recipient_email: parsedArgs.recipientEmail || recipientEmail,
                    subject: parsedArgs.subject || `Investor Update: ${docTitle}`,
                    greeting: parsedArgs.greeting || `Dear ${recipientName},`,
                    executive_summary: parsedArgs.executiveSummary || '',
                    key_bullet_points: parsedArgs.keyBulletPoints || [],
                    call_to_action: parsedArgs.callToAction || '',
                    closing: parsedArgs.closing || 'Best regards,\nExecutive Team',
                    raw_tool_call: tc
                };
            }
        }

        // If for any reason the model responded with text without tool call, fallback to structured
        return {
            status: 'success',
            recipient_name: recipientName,
            recipient_email: recipientEmail,
            subject: `${businessName || 'Startup'} - ${docTitle} Summary`,
            greeting: `Dear ${recipientName || 'Investor'},`,
            executive_summary: res.content || 'Please review our attached executive prospectus and report.',
            key_bullet_points: ['Comprehensive Business Overview & Lean Canvas', 'Verified Market & Competitor Intelligence', '3-Year Financial Projections & Breakeven Model'],
            call_to_action: 'We welcome the opportunity to discuss these projections with you.',
            closing: 'Best regards,\nFounding Executive Team'
        };
    } catch (err) {
        console.error('EmailDraftingAgent Error:', err);
        return {
            status: 'error',
            message: err?.message || 'Failed to generate email draft via tool call.'
        };
    }
}
