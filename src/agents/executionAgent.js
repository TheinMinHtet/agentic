import { generateExcelTool, generateDocxTool, scheduleCalendarTool, sendOutreachEmailTool } from './tools/executionTools.js';

/**
 * Executes all 4 executive action tools based on the verified blueprint payload from WarRoom OS.
 */
export async function executeAllDeliverables(blueprintData, options = { excel: true, docx: true, calendar: true, email: true }) {
    const results = {
        excel_model: null,
        word_proposal: null,
        calendar_schedule: null,
        outreach_campaign: null,
        executed_at: new Date().toISOString(),
        status: "COMPLETED"
    };

    const companyName = blueprintData?.company_name || blueprintData?.consensus_strategic_narrative?.company_name || "GrantFlow AI";
    const econ = blueprintData?.verified_unit_economics || {
        initial_capital_mmk: 3000000,
        monthly_burn_rate_mmk: 1500000,
        verified_cac_usd: 12,
        target_pricing_standard_mmk: 150000
    };
    const narrative = blueprintData?.consensus_strategic_narrative || {
        improved_summary: "Automated compliance-first grant proposal drafting for non-profits.",
        verified_tam: "$4.2B TAM (APAC & Global)",
        key_differentiators: ["NLP compliance compiler", "Historical narrative voice preservation"]
    };
    const milestones = blueprintData?.actionable_roadmap_milestones || [
        { phase: "Phase 1", date: "2026-09-01", title: "Alpha MVP Launch & NPO Onboarding", desc: "Onboard 5 alpha non-profit directors" },
        { phase: "Phase 2", date: "2026-10-01", title: "SEO Content Push & Email Broadcast", desc: "Launch organic referral loop" },
        { phase: "Phase 3", date: "2026-11-01", title: "Public Beta & Paid Subscription Tiers", desc: "Open subscription portals" }
    ];
    const personas = blueprintData?.verified_target_personas || [
        { name: "Executive Director Emily", role: "Local NPO Director", contactPortal: "emily@localnpo.org", painPoint: "Spends 20+ hours drafting proposals" }
    ];

    try {
        if (options.excel) {
            const excelRaw = await generateExcelTool.invoke({
                companyName: companyName,
                initialCapitalMmk: econ.initial_capital_mmk || 3000000,
                monthlyBurnRateMmk: econ.monthly_burn_rate_mmk || 1500000,
                verifiedCacUsd: econ.verified_cac_usd || 12,
                targetPricingStandardMmk: econ.target_pricing_standard_mmk || 150000
            });
            results.excel_model = typeof excelRaw === 'string' ? JSON.parse(excelRaw) : excelRaw;
        }

        if (options.docx) {
            const docxRaw = await generateDocxTool.invoke({
                companyName: companyName,
                summaryText: narrative.improved_summary || "Grant proposal automation platform.",
                verifiedTam: narrative.verified_tam || "$4.2B TAM",
                keyDifferentiators: narrative.key_differentiators || [],
                leanCanvasSummary: "Problem: High grant overhead. Solution: Instant compliance drafting. Revenue: MRR."
            });
            results.word_proposal = typeof docxRaw === 'string' ? JSON.parse(docxRaw) : docxRaw;
        }

        if (options.calendar) {
            const calRaw = await scheduleCalendarTool.invoke({ milestones });
            results.calendar_schedule = typeof calRaw === 'string' ? JSON.parse(calRaw) : calRaw;
        }

        if (options.email) {
            const emailRaw = await sendOutreachEmailTool.invoke({
                targetPersonas: personas,
                companyName: companyName,
                attachExcel: Boolean(results.excel_model),
                attachDocx: Boolean(results.word_proposal)
            });
            results.outreach_campaign = typeof emailRaw === 'string' ? JSON.parse(emailRaw) : emailRaw;
        }
    } catch (err) {
        console.error("Error executing deliverables:", err);
        results.status = "PARTIAL_OR_ERROR";
        results.error_message = err.message;
    }

    return results;
}
