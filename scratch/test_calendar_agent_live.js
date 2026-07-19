import fs from 'fs';
import path from 'path';

try {
    const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf-8');
    for (const line of envContent.split('\n')) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            let val = match[2].trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
            process.env[match[1].trim()] = val;
        }
    }
} catch (e) {}

import { runCalendarUpdateAgent } from '../src/agents/calendarUpdateAgent.js';

async function testAll() {
    const milestones = [
        { phase: "Phase 1", date: "2026-07-19", title: "Alpha Launch MVP", desc: "Initial launch testing with early cohort." },
        { phase: "Phase 2", date: "2026-08-19", title: "Growth & Scaling", desc: "Customer acquisition and channel scaling." }
    ];

    console.log("--- TEST 1: Valid Burmese Date Shift ---");
    const prompt1 = "၁၉ ရက်နေ့ ဇူလိုင်ကို နှစ်ဆယ်ရက် တနင်္လာနေ့ ပြောင်းပေးပါ";
    const res1 = await runCalendarUpdateAgent(prompt1, milestones, process.env.GOOGLE_API_KEY, 'my');
    console.log("Status 1:", res1.status, "| Tool Called:", res1.tool_called, "| Date Result:", res1.updated_milestones?.[0]?.date);

    console.log("\n--- TEST 2: Invalid/Unrelated Prompt (Joke) ---");
    const prompt2 = "ဟာသတစ်ခု ပြောပြပါ";
    const res2 = await runCalendarUpdateAgent(prompt2, milestones, process.env.GOOGLE_API_KEY, 'my');
    console.log("Status 2:", res2.status, "| Message:", res2.message);
}

testAll();
