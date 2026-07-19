'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkflow } from '../context/WorkflowContext';
import { createClient } from '@/lib/supabase/client';
import MarkdownPreviewer from '../components/MarkdownPreviewer';
import { useLanguage } from '../context/LanguageContext';
import RoadmapCalendar from '../components/RoadmapCalendar';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import {
    ArrowLeft,
    FileText,
    Briefcase,
    TrendingUp,
    DollarSign,
    Sparkles,
    Globe,
    Megaphone,
    CheckCircle,
    ExternalLink,
    Calendar as CalendarIcon,
    RefreshCw,
    Plus,
    Trash2,
    Download,
    History,
    ChevronDown,
    ChevronUp,
    Lightbulb,
    Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AgentRediscoveryOverlay from '../components/AgentRediscoveryOverlay';
import InvestorEmailModal from '../components/InvestorEmailModal';

// Lightweight Markdown to HTML string converter for dynamic print iframes
function convertMarkdownToHTML(mdText) {
    if (!mdText) return '';
    const lines = mdText.split('\n');
    let html = '';
    let inList = false;
    let inTable = false;
    let tableRows = [];

    const flushList = () => {
        if (inList) {
            html += '</ul>';
            inList = false;
        }
    };

    const flushTable = () => {
        if (inTable && tableRows.length > 0) {
            html += '<table>';
            // Header
            html += '<thead><tr>';
            const headerCells = tableRows[0];
            headerCells.forEach(cell => {
                html += `<th>${cell}</th>`;
            });
            html += '</tr></thead>';

            // Body
            html += '<tbody>';
            const dataRows = tableRows.slice(2);
            dataRows.forEach(row => {
                html += '<tr>';
                row.forEach(cell => {
                    html += `<td>${cell}</td>`;
                });
                html += '</tr>';
            });
            html += '</tbody></table>';

            tableRows = [];
            inTable = false;
        }
    };

    const parseInline = (text) => {
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
        return formatted;
    };

    lines.forEach(line => {
        const trimmed = line.trim();

        if (trimmed.startsWith('|')) {
            flushList();
            inTable = true;
            const cells = trimmed.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
            tableRows.push(cells.map(c => parseInline(c)));
            return;
        } else if (inTable) {
            flushTable();
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += `<li>${parseInline(trimmed.substring(2))}</li>`;
            return;
        } else if (inList) {
            flushList();
        }

        if (trimmed.startsWith('### ')) {
            html += `<h4>${parseInline(trimmed.substring(4))}</h4>`;
        } else if (trimmed.startsWith('## ')) {
            html += `<h3>${parseInline(trimmed.substring(3))}</h3>`;
        } else if (trimmed.startsWith('# ')) {
            html += `<h2>${parseInline(trimmed.substring(2))}</h2>`;
        } else if (trimmed.startsWith('> ')) {
            html += `<blockquote>${parseInline(trimmed.substring(2))}</blockquote>`;
        } else if (trimmed === '---') {
            html += '<hr />';
        } else if (trimmed.length > 0) {
            html += `<p>${parseInline(trimmed)}</p>`;
        }
    });

    flushList();
    flushTable();

    return html;
}

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { language, t } = useLanguage();
    const ideaId = searchParams.get('ideaId');
    const supabase = useMemo(() => createClient(), []);
    const { user } = useAuth();
    const [pastIdeas, setPastIdeas] = useState([]);
    const [historyExpanded, setHistoryExpanded] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                const { data, error } = await supabase
                    .from('agent_refinements')
                    .select('idea_id, created_at, improved_summary, concept')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                if (error) { console.error('History fetch error:', error); return; }
                if (data) setPastIdeas(data);
            }
        };
        fetchHistory();
    }, [user, supabase]);

    const {
        businessInfo,
        startupIdea,
        refinedConcept,
        marketResearch,
        financeModel,
        brandPackage,
        digitalPresence,
        growthPlan,
        businessPlan,
        setRefinedConcept,
        setMarketResearch,
        setFinanceModel,
        setBrandPackage,
        setDigitalPresence,
        setGrowthPlan,
        setBusinessPlan,
        updateCurrentIdeaId,
        resetWorkflow,
        currentIdeaId,
        updateFinanceModelDirect,
        updateMarketResearchDirect,
        updateBrandPackageDirect,
        updateDigitalPresenceDirect,
        updateGrowthPlanDirect,
        updateRefinedConceptDirect,
        triggerRediscovery,
        verifiedBlueprint
    } = useWorkflow();

    // Editing & Rediscovery States
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingCalendarModal, setIsEditingCalendarModal] = useState(false);
    const [emailModal, setEmailModal] = useState({ isOpen: false, docTitle: '', docContent: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [steps, setSteps] = useState([]);

    // Executive Action Center States
    const [executingActions, setExecutingActions] = useState(false);
    const [actionResults, setActionResults] = useState({
        excel_model: null,
        word_proposal: null,
        calendar_schedule: null,
        outreach_campaign: null
    });

    const handleRestart = () => {
        resetWorkflow();
        router.push('/onboarding');
    };

    const handleExecuteAll = async () => {
        setExecutingActions(true);
        try {
            const { executeAllDeliverables } = await import('../../agents/executionAgent');
            const res = await executeAllDeliverables((verifiedBlueprint && verifiedBlueprint.company_name !== "GrantFlow AI") ? verifiedBlueprint : {
                company_name: refinedConcept?.companyName || businessInfo?.company_name || businessInfo?.title || (startupIdea ? startupIdea.split(' ').slice(0, 3).join(' ').replace(/[^a-zA-Z0-9 ]/g, '') : "EduBot Myanmar"),
                verified_unit_economics: {
                    initial_capital_mmk: 3000000,
                    monthly_burn_rate_mmk: 1500000,
                    verified_cac_usd: 12,
                    target_pricing_standard_mmk: 150000,
                    projected_breakeven_month: financeModel?.breakevenMonth || 4,
                    verified_runway_months: 24.2,
                    gross_margin_percent: 82
                },
                consensus_strategic_narrative: {
                    improved_summary: refinedConcept?.improved_summary || startupIdea || "AI-powered platform providing localized solutions across Myanmar.",
                    verified_tam: marketResearch?.tam || "$4.2B TAM",
                    key_differentiators: refinedConcept?.key_differentiators || []
                },
                actionable_roadmap_milestones: growthPlan?.roadmap90Day ? growthPlan.roadmap90Day.map((item, idx) => ({
                    phase: `Phase ${idx + 1}`,
                    date: `Month ${idx + 1}`,
                    title: `Roadmap Step ${idx + 1}`,
                    desc: item
                })) : [
                    { phase: "Phase 1", date: "Month 1", title: "Alpha MVP Launch", desc: "Alpha testers & validation" },
                    { phase: "Phase 2", date: "Month 2", title: "Growth & Marketing Push", desc: "Targeted campaigns and local outreach" },
                    { phase: "Phase 3", date: "Month 3", title: "Public Beta & Scale", desc: "Scale revenue tiers and partnerships" }
                ],
                verified_target_personas: marketResearch?.target_personas || []
            });
            setActionResults(res);
        } catch (err) {
            console.error("Execution error:", err);
        } finally {
            setExecutingActions(false);
        }
    };

    const handleExecuteSingle = async (type) => {
        setExecutingActions(true);
        try {
            const { executeAllDeliverables } = await import('../../agents/executionAgent');
            const options = { excel: false, docx: false, calendar: false, email: false, [type]: true };
            const res = await executeAllDeliverables((verifiedBlueprint && verifiedBlueprint.company_name !== "GrantFlow AI") ? verifiedBlueprint : {
                company_name: refinedConcept?.companyName || businessInfo?.company_name || businessInfo?.title || (startupIdea ? startupIdea.split(' ').slice(0, 3).join(' ').replace(/[^a-zA-Z0-9 ]/g, '') : "EduBot Myanmar"),
                verified_unit_economics: {
                    initial_capital_mmk: 3000000,
                    monthly_burn_rate_mmk: 1500000,
                    verified_cac_usd: 12,
                    target_pricing_standard_mmk: 150000,
                    projected_breakeven_month: financeModel?.breakevenMonth || 4,
                    verified_runway_months: 24.2,
                    gross_margin_percent: 82
                },
                consensus_strategic_narrative: {
                    improved_summary: refinedConcept?.improved_summary || startupIdea || "AI-powered platform providing localized solutions across Myanmar.",
                    verified_tam: marketResearch?.tam || "$4.2B TAM",
                    key_differentiators: refinedConcept?.key_differentiators || []
                },
                actionable_roadmap_milestones: growthPlan?.roadmap90Day ? growthPlan.roadmap90Day.map((item, idx) => ({
                    phase: `Phase ${idx + 1}`,
                    date: `Month ${idx + 1}`,
                    title: `Roadmap Step ${idx + 1}`,
                    desc: item
                })) : [
                    { phase: "Phase 1", date: "Month 1", title: "Alpha MVP Launch", desc: "Alpha testers & validation" },
                    { phase: "Phase 2", date: "Month 2", title: "Growth & Marketing Push", desc: "Targeted campaigns and local outreach" },
                    { phase: "Phase 3", date: "Month 3", title: "Public Beta & Scale", desc: "Scale revenue tiers and partnerships" }
                ],
                verified_target_personas: marketResearch?.target_personas || []
            }, options);
            setActionResults(prev => ({ ...prev, ...res }));
        } catch (err) {
            console.error("Single execution error:", err);
        } finally {
            setExecutingActions(false);
        }
    };

    // Temporary editing form states
    const [editConcept, setEditConcept] = useState('');
    const [editDifferentiators, setEditDifferentiators] = useState('');
    const [editMarketTam, setEditMarketTam] = useState('');
    const [editMarketSaturation, setEditMarketSaturation] = useState(0);
    const [editMarketCompetitors, setEditMarketCompetitors] = useState([]);
    const [editMarketPersonas, setEditMarketPersonas] = useState([]);
    const [editFinanceBreakeven, setEditFinanceBreakeven] = useState(0);
    const [editFinanceForecast, setEditFinanceForecast] = useState('');
    const [editFinanceCosts, setEditFinanceCosts] = useState([]);
    const [editFinancePricing, setEditFinancePricing] = useState('');
    const [editBrandNames, setEditBrandNames] = useState('');
    const [editBrandTagline, setEditBrandTagline] = useState('');
    const [editBrandVoice, setEditBrandVoice] = useState('');
    const [editDigitalStack, setEditDigitalStack] = useState('');
    const [editDigitalFeatures, setEditDigitalFeatures] = useState('');
    const [editGrowthChannels, setEditGrowthChannels] = useState('');
    const [editGrowthPlanText, setEditGrowthPlanText] = useState('');

    const getCurrencySymbol = () => {
        return 'MMK';
    };

    const formatCost = (cost) => {
        return `${Math.round(cost).toLocaleString()} MMK`;
    };

    const [activeTab, setActiveTab] = useState('overview');
    const [previewDoc, setPreviewDoc] = useState(false);
    const [historyLoadError, setHistoryLoadError] = useState('');
    const [selectedInvestorDoc, setSelectedInvestorDoc] = useState('overview');

    const handlePrintPDF = (title, markdownContent) => {
        const htmlMarkup = convertMarkdownToHTML(markdownContent);
        const printContent = `
          <html>
            <head>
              <title>${title}</title>
              <style>
                body {
                  font-family: 'Inter', system-ui, -apple-system, sans-serif;
                  color: #1E293B;
                  background-color: #FFFFFF;
                  padding: 40px;
                  line-height: 1.6;
                }
                h2 { font-size: 28px; font-weight: 800; color: #0F172A; border-bottom: 2px solid #E2E8F0; padding-bottom: 12px; margin-top: 0; margin-bottom: 24px; }
                h3 { font-size: 22px; font-weight: 700; color: #1E293B; margin-top: 32px; margin-bottom: 16px; border-bottom: 1px solid #F1F5F9; padding-bottom: 8px; }
                h4 { font-size: 18px; font-weight: 700; color: #334155; margin-top: 24px; margin-bottom: 12px; }
                p { font-size: 15px; color: #334155; margin-bottom: 16px; }
                ul { padding-left: 24px; margin: 0 0 16px 0; font-size: 15px; color: #334155; }
                li { margin-bottom: 6px; }
                blockquote { border-left: 4px solid #6366F1; padding-left: 16px; margin: 0 0 20px 0; font-style: italic; color: #475569; background-color: #F8FAFC; padding: 12px 16px; border-radius: 0 8px 8px 0; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; text-align: left; }
                th { padding: 12px 16px; font-weight: 700; background-color: #F1F5F9; border-bottom: 2px solid #E2E8F0; }
                td { padding: 12px 16px; border-bottom: 1px solid #E2E8F0; color: #475569; }
                code { background-color: #F1F5F9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
                @media print {
                  body { padding: 20px; }
                  thead { display: table-header-group; }
                  tr { page-break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              ${htmlMarkup}
            </body>
          </html>
        `;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(printContent);
        doc.close();
        iframe.contentWindow.focus();
        setTimeout(() => {
            iframe.contentWindow.print();
            document.body.removeChild(iframe);
        }, 250);
    };

    const handleDownloadPDF = (title, markdownContent, filename) => {
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const maxLineWidth = pageWidth - (margin * 2);

            let y = 25;

            const addTextLine = (text, size = 11, style = 'normal', spacing = 6) => {
                doc.setFont('helvetica', style);
                doc.setFontSize(size);
                const lines = doc.splitTextToSize(text, maxLineWidth);
                lines.forEach(line => {
                    if (y + spacing > pageHeight - margin) {
                        doc.addPage();
                        y = 25;
                    }
                    doc.text(line, margin, y);
                    y += spacing;
                });
            };

            // Add Document Title
            addTextLine(title, 22, 'bold', 12);
            doc.setDrawColor(226, 232, 240);
            doc.line(margin, y - 4, pageWidth - margin, y - 4);
            y += 4;

            const markdownLines = markdownContent.split('\n');
            markdownLines.forEach(line => {
                const trimmed = line.trim();
                if (!trimmed) {
                    y += 3;
                    return;
                }

                if (trimmed.startsWith('### ')) {
                    y += 4;
                    addTextLine(trimmed.substring(4), 14, 'bold', 8);
                } else if (trimmed.startsWith('## ')) {
                    y += 6;
                    addTextLine(trimmed.substring(3), 16, 'bold', 9);
                } else if (trimmed.startsWith('# ')) {
                    y += 8;
                    addTextLine(trimmed.substring(2), 20, 'bold', 11);
                } else if (trimmed.startsWith('> ')) {
                    addTextLine(trimmed.substring(2), 11, 'italic', 7);
                } else if (trimmed === '---') {
                    doc.setDrawColor(226, 232, 240);
                    doc.line(margin, y + 2, pageWidth - margin, y + 2);
                    y += 8;
                } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    addTextLine(`•  ${trimmed.substring(2)}`, 11, 'normal', 6);
                } else {
                    if (trimmed.startsWith('|')) {
                        const cleanRow = trimmed.split('|').map(s => s.trim()).filter(s => s).join('   |   ');
                        doc.setFont('courier', 'normal');
                        addTextLine(`| ${cleanRow} |`, 9, 'normal', 5.5);
                    } else {
                        addTextLine(trimmed, 11, 'normal', 6);
                    }
                }
            });

            doc.save(filename.replace('.md', '.pdf'));
        } catch (error) {
            console.error("PDF local generation failed, falling back to print:", error);
            handlePrintPDF(title, markdownContent);
        }
    };

    const handleDownloadAllMarkdown = () => {
        const fullMarkdown = [
            `# ${fallbackBrand.names[0] || 'Startup'} - Complete Investor Prospectus`,
            `Generated on: ${new Date().toLocaleDateString()}`,
            `Concept Summary: ${fallbackConcept.improved_summary}`,
            `---`,
            fallbackBusiness.lean_canvas_markdown,
            fallbackMarket.markdown_deliverable,
            fallbackFinance.markdown_deliverable,
            fallbackBrand.markdown_deliverable,
            fallbackDigital.markdown_deliverable,
            fallbackGrowth.markdown_deliverable
        ].join('\n\n');

        const element = document.createElement("a");
        const file = new Blob([fullMarkdown], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        const name = (fallbackBrand.names[0] || 'startup').toLowerCase().replace(/\s+/g, '_');
        element.download = `${name}_complete_prospectus.md`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleDownloadAllPDF = () => {
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const maxLineWidth = pageWidth - (margin * 2);

            let y = 25;

            const addTextLine = (text, size = 11, style = 'normal', spacing = 6) => {
                doc.setFont('helvetica', style);
                doc.setFontSize(size);
                const lines = doc.splitTextToSize(text, maxLineWidth);
                lines.forEach(line => {
                    if (y + spacing > pageHeight - margin) {
                        doc.addPage();
                        y = 25;
                    }
                    doc.text(line, margin, y);
                    y += spacing;
                });
            };

            // Add Cover Page
            y = 60;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(38);
            doc.text(fallbackBrand.names[0] || 'Startup', margin, y);
            y += 15;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(16);
            doc.setTextColor(100, 116, 139);
            doc.text('COMPLETE STARTUP PROSPECTUS', margin, y);
            y += 30;

            // Box for concept
            doc.setDrawColor(226, 232, 240);
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y, maxLineWidth, 60, 'FD');

            y += 10;
            doc.setTextColor(30, 41, 59);
            addTextLine(`Concept Summary:`, 13, 'bold', 7);
            y += 2;
            addTextLine(fallbackConcept.concept, 10.5, 'normal', 5.5);

            doc.setTextColor(148, 163, 184);
            doc.setFontSize(11);
            doc.text(`Generated by Advanced AI Multi-Agent Workflow on ${new Date().toLocaleDateString()}`, margin, pageHeight - 30);

            // Add all segments
            const docs = [
                { title: 'Business Overview (Lean Canvas)', md: fallbackBusiness.lean_canvas_markdown },
                { title: 'Market Intelligence Report', md: fallbackMarket.markdown_deliverable },
                { title: 'Financial Model & Projections', md: fallbackFinance.markdown_deliverable },
                { title: 'Brand Identity & Style Guide', md: fallbackBrand.markdown_deliverable },
                { title: 'Digital Presence Specification', md: fallbackDigital.markdown_deliverable },
                { title: 'Growth & Marketing Plan', md: fallbackGrowth.markdown_deliverable }
            ];

            docs.forEach((d) => {
                doc.addPage();
                y = 25;
                doc.setTextColor(15, 23, 42);
                addTextLine(d.title, 20, 'bold', 12);
                doc.setDrawColor(226, 232, 240);
                doc.line(margin, y - 4, pageWidth - margin, y - 4);
                y += 6;

                const lines = d.md.split('\n');
                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (!trimmed) {
                        y += 3;
                        return;
                    }

                    if (trimmed.startsWith('### ')) {
                        y += 3;
                        addTextLine(trimmed.substring(4), 13, 'bold', 7.5);
                    } else if (trimmed.startsWith('## ')) {
                        y += 5;
                        addTextLine(trimmed.substring(3), 15, 'bold', 8.5);
                    } else if (trimmed.startsWith('# ')) {
                        y += 7;
                        addTextLine(trimmed.substring(2), 18, 'bold', 10.5);
                    } else if (trimmed.startsWith('> ')) {
                        addTextLine(trimmed.substring(2), 10.5, 'italic', 6);
                    } else if (trimmed === '---') {
                        doc.setDrawColor(226, 232, 240);
                        doc.line(margin, y + 2, pageWidth - margin, y + 2);
                        y += 6;
                    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        addTextLine(`•  ${trimmed.substring(2)}`, 10.5, 'normal', 5.5);
                    } else {
                        if (trimmed.startsWith('|')) {
                            const cleanRow = trimmed.split('|').map(s => s.trim()).filter(s => s).join('   |   ');
                            doc.setFont('courier', 'normal');
                            addTextLine(`| ${cleanRow} |`, 8.5, 'normal', 5);
                        } else {
                            addTextLine(trimmed, 10.5, 'normal', 5.5);
                        }
                    }
                });
            });

            const name = (fallbackBrand.names[0] || 'startup').toLowerCase().replace(/\s+/g, '_');
            doc.save(`${name}_complete_prospectus.pdf`);
        } catch (error) {
            console.error("Prospectus PDF download failed, falling back to print:", error);
            handlePrintAllPDF();
        }
    };

    useEffect(() => {
        let mounted = true;

        const fetchSingle = async (table) => {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .eq('idea_id', ideaId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    if (error.code !== 'PGRST116') {
                        console.warn(`[Supabase Note] Table ${table} info:`, error.message || error.code || JSON.stringify(error) || error);
                    }
                    return null;
                }

                return data;
            } catch (err) {
                console.warn(`[Supabase Note] Fetch exception for table ${table}:`, err?.message || err);
                return null;
            }
        };

        const loadHistoryDashboard = async () => {
            if (!ideaId) return;

            setHistoryLoadError('');
            updateCurrentIdeaId(ideaId);

            try {
                const [refinement, market, finance, brand, digital, growth, business] = await Promise.all([
                    fetchSingle('agent_refinements'),
                    fetchSingle('agent_market_research'),
                    fetchSingle('agent_finance_models'),
                    fetchSingle('agent_brand_packages'),
                    fetchSingle('agent_digital_presence'),
                    fetchSingle('agent_growth_plans'),
                    fetchSingle('agent_business_plans')
                ]);

                if (!mounted) return;

                if (refinement) {
                    setRefinedConcept(refinement.raw_output || {
                        thinking: refinement.thinking,
                        concept: refinement.concept,
                        improved_summary: refinement.improved_summary,
                        key_differentiators: refinement.key_differentiators || [],
                        target_audience_refined: refinement.target_audience_refined
                    });
                }

                if (market) {
                    setMarketResearch(market.raw_output || {
                        thinking: market.thinking,
                        markdown_deliverable: market.markdown_deliverable,
                        tam: market.tam,
                        competitors: market.competitors || [],
                        opportunities: market.opportunities || [],
                        saturation_level: market.saturation_level,
                        target_personas: market.target_personas || []
                    });
                }

                if (finance) {
                    setFinanceModel(finance.raw_output || {
                        thinking: finance.thinking,
                        markdown_deliverable: finance.markdown_deliverable,
                        costBreakdown: finance.cost_breakdown || [],
                        revenueForecast: finance.revenue_forecast,
                        pricingStrategy: finance.pricing_strategy,
                        breakevenMonth: finance.breakeven_month
                    });
                }

                if (brand) {
                    setBrandPackage(brand.raw_output || {
                        thinking: brand.thinking,
                        markdown_deliverable: brand.markdown_deliverable,
                        names: brand.names || [],
                        tagline: brand.tagline,
                        voice: brand.voice,
                        palette: brand.palette || {},
                        logoConcept: brand.logo_concept
                    });
                }

                if (digital) {
                    setDigitalPresence(digital.raw_output || {
                        thinking: digital.thinking,
                        markdown_deliverable: digital.markdown_deliverable,
                        landingPageOutline: digital.landing_page_outline || [],
                        features: digital.features || [],
                        stack: digital.stack || []
                    });
                }

                if (growth) {
                    setGrowthPlan(growth.raw_output || {
                        thinking: growth.thinking,
                        markdown_deliverable: growth.markdown_deliverable,
                        channels: growth.channels || [],
                        acquisitionPlan: growth.acquisition_plan,
                        roadmap90Day: growth.roadmap_90_day || []
                    });
                }

                if (business) {
                    setBusinessPlan(business.raw_output || {
                        thinking: business.thinking,
                        lean_canvas_markdown: business.lean_canvas_markdown
                    });
                }
            } catch (error) {
                console.warn('[Supabase Note] Could not load saved history dashboard:', error?.message || error);
                if (mounted) {
                    setHistoryLoadError(error.message || 'Unable to load saved dashboard.');
                }
            }
        };

        loadHistoryDashboard();

        return () => {
            mounted = false;
        };
    }, [
        ideaId,
        supabase,
        setRefinedConcept,
        setMarketResearch,
        setFinanceModel,
        setBrandPackage,
        setDigitalPresence,
        setGrowthPlan,
        setBusinessPlan,
        updateCurrentIdeaId
    ]);

    // Dynamic base info derived from live user workflow, Onboarding, or Meeting Room output
    const activeIdea = verifiedBlueprint?.consensus_strategic_narrative?.improved_summary || startupIdea || "AI-powered digital platform solving local user pain points.";
    const activeName = verifiedBlueprint?.company_name || (startupIdea ? startupIdea.split(' ').slice(0, 3).join(' ').replace(/[^a-zA-Z0-9 ]/g, '') : "EduBot Myanmar");
    const activeAudience = Array.isArray(verifiedBlueprint?.verified_target_personas) && verifiedBlueprint.verified_target_personas.length > 0
        ? verifiedBlueprint.verified_target_personas.map(p => `${p.name || 'Persona'} (${p.role || 'Segment'})`).join(', ')
        : (businessInfo?.target_customers || "Students, Professionals & Businesses across Myanmar");
    const activePain = businessInfo?.core_painpoint || "High operational costs and lack of modern automated tools in the local market.";
    const activeBudget = businessInfo?.budget || "8,000,000 MMK";
    const activeCAC = verifiedBlueprint?.verified_unit_economics?.verified_cac_usd || 12;
    const activeType = businessInfo?.business_type || "SaaS / Digital App";
    const activeCountry = businessInfo?.target_country || "Myanmar";

    const isPhysicalProduct = (() => {
        const text = `${activeType || ''} ${businessInfo?.business_type || ''} ${activeIdea || ''} ${businessInfo?.core_painpoint || ''}`.toLowerCase();
        const physicalKeywords = ['physical', 'food', 'beverage', 'retail', 'hardware', 'clothing', 'fashion', 'cosmetics', 'snack', 'drink', 'manufacturing', 'cogs', 'packaging', 'factory', 'goods', 'product', 'restaurant', 'cafe', 'store'];
        const digitalKeywords = ['saas', 'software', 'app', 'edtech', 'platform', 'ai', 'cloud', 'portal', 'token', 'website'];
        const hasPhysical = physicalKeywords.some(kw => text.includes(kw));
        const hasDigital = digitalKeywords.some(kw => text.includes(kw));
        return hasPhysical && !hasDigital;
    })();

    // Fallback and dynamic override data when connected to verifiedBlueprint or Onboarding data
    const fallbackConcept = {
        concept: refinedConcept?.concept || verifiedBlueprint?.consensus_strategic_narrative?.improved_summary || activeIdea,
        improved_summary: refinedConcept?.improved_summary || verifiedBlueprint?.consensus_strategic_narrative?.improved_summary || activeIdea,
        key_differentiators: Array.isArray(refinedConcept?.key_differentiators) && refinedConcept.key_differentiators.length > 0
            ? refinedConcept.key_differentiators
            : (Array.isArray(verifiedBlueprint?.consensus_strategic_narrative?.key_differentiators) && verifiedBlueprint.consensus_strategic_narrative.key_differentiators.length > 0
                ? verifiedBlueprint.consensus_strategic_narrative.key_differentiators
                : (isPhysicalProduct ? [
                    `High-grade locally sourced raw materials and rigorous quality control checks across ${activeCountry}.`,
                    `Eco-friendly retail packaging box design optimized for store shelf appeal and unboxing.`,
                    `Verified 68% gross margin unit economics with scalable production batches.`
                ] : [
                    `AI matching engine tailored specifically for ${activeAudience}.`,
                    `Automated workflow resolution addressing: ${activePain.substring(0, 80)}...`,
                    `Built specifically for ${activeCountry} market requirements and local behavior.`
                ])),
        target_audience_refined: refinedConcept?.target_audience_refined || activeAudience
    };

    const fallbackMarket = {
        tam: marketResearch?.tam || verifiedBlueprint?.consensus_strategic_narrative?.verified_tam || (isPhysicalProduct ? "65,000,000,000 MMK TAM" : "45,000,000,000 MMK TAM"),
        saturation_level: marketResearch?.saturation_level !== undefined && marketResearch?.saturation_level !== null
            ? marketResearch.saturation_level
            : (verifiedBlueprint?.consensus_strategic_narrative?.verified_saturation || (isPhysicalProduct ? 34 : 28)),
        competitors: Array.isArray(marketResearch?.competitors) && marketResearch.competitors.length > 0
            ? marketResearch.competitors
            : (Array.isArray(verifiedBlueprint?.verified_competitors) && verifiedBlueprint.verified_competitors.length > 0
                ? verifiedBlueprint.verified_competitors
                : (isPhysicalProduct ? [
                    { name: "Imported Overseas Brands", url: "Thailand / China Imports", weakness: "High currency import tariffs and inconsistent supply stock." },
                    { name: "Traditional Local Producers", url: "Offline Market", weakness: "Lacks modern packaging appeal and quality consistency." },
                    { name: "Generic Supermarket Items", url: "Retail Stores", weakness: `Missing tailored ${activeCountry} cultural branding and premium quality.` }
                ] : [
                    { name: "Traditional Offline Services", url: "Offline Market", weakness: "High cost, slow turnaround, and rigid schedules." },
                    { name: "Generic Global Alternatives", url: "https://globalcompetitor.com", weakness: `Lacks ${activeCountry} localization, currency integration, and local support.` },
                    { name: "Manual Excel & Paper Workflows", url: "Internal Processes", weakness: "Prone to human error, time-consuming, and hard to scale." }
                ])),
        opportunities: Array.isArray(marketResearch?.opportunities) && marketResearch.opportunities.length > 0
            ? marketResearch.opportunities
            : (isPhysicalProduct ? [
                `High demand for reliable, premium quality local physical goods in ${activeCountry}.`,
                `Rapid expansion of modern supermarkets, convenience mini-marts, and TikTok Shop social selling.`,
                `Import substitution opportunity offering better pricing and local quality assurance.`
            ] : [
                `High demand from ${activeAudience} looking for digital automation.`,
                `Expanding mobile internet and digital wallet adoption across ${activeCountry}.`,
                `Cost reduction potential compared to traditional manual solutions.`
            ]),
        target_personas: Array.isArray(marketResearch?.target_personas) && marketResearch.target_personas.length > 0
            ? marketResearch.target_personas.map(p => ({
                name: p.name || "Persona",
                role: p.role || "Customer Segment",
                pain_points: Array.isArray(p.pain_points) ? p.pain_points : (p.painPoint ? [p.painPoint] : [activePain]),
                budget_limit: p.budget_limit || p.customPitchAngle || (isPhysicalProduct ? "15,000 MMK/purchase" : "30,000 MMK/mo subscription")
            }))
            : (Array.isArray(verifiedBlueprint?.verified_target_personas) && verifiedBlueprint.verified_target_personas.length > 0
                ? verifiedBlueprint.verified_target_personas.map(p => ({
                    name: p.name || "Target Persona",
                    role: p.role || "Customer Segment",
                    pain_points: Array.isArray(p.pain_points) ? p.pain_points : (p.painPoint ? [p.painPoint] : [activePain]),
                    budget_limit: p.budget_limit || p.customPitchAngle || (isPhysicalProduct ? "15,000 MMK/purchase" : "30,000 MMK/mo subscription")
                }))
                : (isPhysicalProduct ? [
                    { name: "Retail Shopper Thandar", role: "Everyday Consumer", pain_points: [activePain, "Inconsistent quality from cheap imported goods"], budget_limit: "12,000 MMK/item budget" },
                    { name: "Store Distributor U Kyaw", role: "Wholesale Retailer", pain_points: ["Stock shortages from overseas suppliers", "High import exchange rates"], budget_limit: "500,000 MMK wholesale order" }
                ] : [
                    { name: "Primary Persona A", role: activeAudience.split(',')[0] || "Target Customer", pain_points: [activePain, "Time-consuming daily operations"], budget_limit: "25,000 MMK/mo max" },
                    { name: "Secondary Persona B", role: "Decision Maker / Manager", pain_points: ["High expense overhead", "Lack of real-time insights"], budget_limit: "50,000 MMK/mo budget" }
                ])),
        markdown_deliverable: marketResearch?.markdown_deliverable || `# Market Intelligence Report: ${activeName}\n\n## Target Market & Personas\n${activeName} targets ${activeAudience}.\n\n### Ideal Customer Personas (ICPs)\n${Array.isArray(marketResearch?.target_personas) && marketResearch.target_personas.length > 0
            ? marketResearch.target_personas.map(p => `- **${p.name || 'Persona'}** (${p.role || 'Segment'}): ${Array.isArray(p.pain_points) ? p.pain_points.join(', ') : (p.painPoint || activePain)}`).join('\n')
            : (Array.isArray(verifiedBlueprint?.verified_target_personas) && verifiedBlueprint.verified_target_personas.length > 0
                ? verifiedBlueprint.verified_target_personas.map(p => `- **${p.name || 'Persona'}** (${p.role || 'Segment'}): ${p.painPoint || (Array.isArray(p.pain_points) ? p.pain_points.join(', ') : activePain)}`).join('\n')
                : `- **Primary Persona**: ${activeAudience}. Pain point: ${activePain}\n- **Decision Maker**: Seeking reliable localized solutions in ${activeCountry}.`)
            }\n\n## Competitor Mapping\n| Competitor | Weakness |\n|---|---|\n| Traditional Offline Services / Imports | High cost & rigid delivery |\n| Generic Alternatives | Lacks ${activeCountry} localization |\n\n## Market Trends & Opportunities\n- Verified TAM: **${marketResearch?.tam || verifiedBlueprint?.consensus_strategic_narrative?.verified_tam || (isPhysicalProduct ? '65,000,000,000 MMK TAM' : '45,000,000,000 MMK TAM')}**\n- High opportunity for localized ${activeType} solutions.`
    };

    const fallbackFinance = {
        costBreakdown: Array.isArray(financeModel?.costBreakdown || financeModel?.cost_breakdown) && (financeModel?.costBreakdown || financeModel?.cost_breakdown).length > 0
            ? (financeModel.costBreakdown || financeModel.cost_breakdown)
            : (isPhysicalProduct ? [
                { item: "Raw Materials & Supplier Procurement", cost: verifiedBlueprint?.verified_unit_economics ? Math.round(verifiedBlueprint.verified_unit_economics.monthly_burn_rate_mmk * 0.35) : 875000 },
                { item: "Manufacturing, Tooling & Quality Control", cost: verifiedBlueprint?.verified_unit_economics ? Math.round(verifiedBlueprint.verified_unit_economics.monthly_burn_rate_mmk * 0.25) : 625000 },
                { item: `Packaging, Box Printing & Labeling`, cost: verifiedBlueprint?.verified_unit_economics ? Math.round(verifiedBlueprint.verified_unit_economics.monthly_burn_rate_mmk * 0.15) : 375000 },
                { item: `Logistics, Warehousing & Store Distribution`, cost: verifiedBlueprint?.verified_unit_economics ? Math.round(verifiedBlueprint.verified_unit_economics.monthly_burn_rate_mmk * 0.15) : 375000 },
                { item: `Retail Marketing & Influencer Gifting (CAC: $${activeCAC})`, cost: verifiedBlueprint?.verified_unit_economics ? Math.round(verifiedBlueprint.verified_unit_economics.monthly_burn_rate_mmk * 0.10) : 250000 }
            ] : [
                { item: "Core Platform Development & AI Compute", cost: verifiedBlueprint?.verified_unit_economics ? Math.round(verifiedBlueprint.verified_unit_economics.monthly_burn_rate_mmk * 0.30) : 450000 },
                { item: "Cloud Servers, Hosting & CDN", cost: verifiedBlueprint?.verified_unit_economics ? Math.round(verifiedBlueprint.verified_unit_economics.monthly_burn_rate_mmk * 0.20) : 300000 },
                { item: `Customer Acquisition & Marketing (CAC: $${activeCAC})`, cost: verifiedBlueprint?.verified_unit_economics ? Math.round(verifiedBlueprint.verified_unit_economics.monthly_burn_rate_mmk * 0.35) : 525000 },
                { item: "Customer Support & Operations", cost: verifiedBlueprint?.verified_unit_economics ? Math.round(verifiedBlueprint.verified_unit_economics.monthly_burn_rate_mmk * 0.10) : 150000 },
                { item: "Domain, SSL & Local Compliance", cost: verifiedBlueprint?.verified_unit_economics ? Math.round(verifiedBlueprint.verified_unit_economics.monthly_burn_rate_mmk * 0.05) : 75000 }
            ]),
        revenueForecast: financeModel?.revenueForecast || financeModel?.revenue_forecast || (verifiedBlueprint?.verified_unit_economics
            ? `Breakeven projected in Month ${verifiedBlueprint.verified_unit_economics.projected_breakeven_month} with verified runway of ${verifiedBlueprint.verified_unit_economics.verified_runway_months} months (${verifiedBlueprint.verified_unit_economics.gross_margin_percent}% Gross Margin).`
            : (isPhysicalProduct ? "18,500,000 MMK monthly wholesale & retail sales projected by Month 6 via distributor networks." : "12,000,000 MMK monthly recurring revenue (MRR) projected by Month 6 via active subscribers.")),
        pricingStrategy: financeModel?.pricingStrategy || financeModel?.pricing_strategy || (verifiedBlueprint?.verified_unit_economics
            ? `Verified Target Price Plan: ${(verifiedBlueprint.verified_unit_economics.target_pricing_standard_mmk || (isPhysicalProduct ? 8500 : 15000)).toLocaleString()} MMK (${verifiedBlueprint.verified_unit_economics.gross_margin_percent}% Gross Margin).`
            : (isPhysicalProduct ? "Retail Price: 8,500 MMK per unit (Wholesale carton discounts at 6,800 MMK/unit for distributors)." : "Freemium access tier + Pro Subscription at 15,000 MMK/month for unlimited advanced features.")),
        breakevenMonth: financeModel?.breakevenMonth || financeModel?.breakeven_month || verifiedBlueprint?.verified_unit_economics?.projected_breakeven_month || 4,
        markdown_deliverable: financeModel?.markdown_deliverable || `# Financial Model & Projections: ${activeName}\n\n## Startup Capital & Runway\n- **Initial Capital Allocation**: ${activeBudget}\n- **Monthly Burn Rate**: ${(verifiedBlueprint?.verified_unit_economics?.monthly_burn_rate_mmk || (isPhysicalProduct ? 2500000 : 1500000)).toLocaleString()} MMK/mo\n- **Verified Runway**: ${verifiedBlueprint?.verified_unit_economics?.verified_runway_months || (isPhysicalProduct ? 18.5 : 24.2)} months\n- **Verified CAC**: $${activeCAC}/user\n- **Gross Margin**: ${verifiedBlueprint?.verified_unit_economics?.gross_margin_percent || (isPhysicalProduct ? 68 : 82)}%\n\n## Revenue Forecast\n- Projecting **Month ${financeModel?.breakevenMonth || financeModel?.breakeven_month || verifiedBlueprint?.verified_unit_economics?.projected_breakeven_month || 4} Breakeven**.`
    };

    const fallbackBrand = {
        names: Array.isArray(brandPackage?.names) && brandPackage.names.length > 0
            ? brandPackage.names
            : (verifiedBlueprint?.company_name ? [verifiedBlueprint.company_name, `${activeName} Pro`, `${activeName} Hub`, `${activeName} AI`, `Smart${activeName}`] : [activeName, `${activeName} Pro`, `${activeName} Hub`, `${activeName} AI`, `Smart${activeName}`]),
        tagline: brandPackage?.tagline || verifiedBlueprint?.consensus_strategic_narrative?.improved_summary || `${activeName}: Smarter localized solutions for ${activeAudience.split(',')[0] || 'your daily lifestyle'}.`,
        voice: brandPackage?.voice || "Empathetic, clear, structured, engaging, and trustworthy across Myanmar.",
        palette: {
            primary: brandPackage?.palette?.primary || "#1e1b4b",
            secondary: brandPackage?.palette?.secondary || "#38bdf8",
            background: brandPackage?.palette?.background || "#0f172a"
        },
        logoConcept: brandPackage?.logoConcept || brandPackage?.logo_concept || `A sleek, modern emblem combining quality assurance with ${activeName}, symbolizing growth and trust across ${activeCountry}.`,
        markdown_deliverable: brandPackage?.markdown_deliverable || `# Brand Identity & Style Guide: ${activeName}\n\n## Brand Naming Suggestions\n1. **${brandPackage?.names?.[0] || activeName}** (Primary suggestion)\n2. **${brandPackage?.names?.[1] || (activeName + ' Pro')}**\n3. **${brandPackage?.names?.[2] || (activeName + ' Hub')}**\n\n## Brand Voice Guidelines\n- **Localized & Clear**: Easy to understand across all customer segments.\n- **Trustworthy**: Emphasizing reliability and high quality in ${activeCountry}.`
    };

    const fallbackDigital = {
        landingPageOutline: Array.isArray(digitalPresence?.landingPageOutline || digitalPresence?.landing_page_outline) && (digitalPresence.landingPageOutline || digitalPresence.landing_page_outline).length > 0
            ? (digitalPresence.landingPageOutline || digitalPresence.landing_page_outline)
            : [
                { section_id: "hero", title: isPhysicalProduct ? `Experience superior quality with ${activeName}.` : `Elevate your workflow with ${activeName}.`, body: activeIdea, cta_text: isPhysicalProduct ? "Order Now / Buy Sample" : "Get Started Free" },
                { section_id: "features", title: `Tailored for ${activeCountry}`, body: `Designed to eliminate ${activePain.substring(0, 80)} with premium quality assurance and local support.`, cta_text: isPhysicalProduct ? "View Product Catalog" : "See Features" },
                { section_id: "pricing", title: isPhysicalProduct ? "Accessible wholesale & retail pricing" : "Transparent, flexible pricing", body: `Affordable options scaling from individual purchases to wholesale distributor packages.`, cta_text: isPhysicalProduct ? "View Price List" : "View Plans" }
            ],
        features: Array.isArray(digitalPresence?.features) && digitalPresence.features.length > 0
            ? digitalPresence.features
            : (isPhysicalProduct ? [
                "Online E-Commerce Product Catalog & Ordering Portal",
                "Real-time Stock Tracking & Social Chat-to-Order Sync",
                "Store Locator Map & Wholesale Distributor Application"
            ] : [
                `${activeType} Core Automation Engine`,
                "Real-time Analytics & Activity Tracking",
                "Localized Support & Multi-device Sync"
            ]),
        stack: Array.isArray(digitalPresence?.stack) && digitalPresence.stack.length > 0
            ? digitalPresence.stack
            : (isPhysicalProduct ? ["Shopify / WooCommerce", "TikTok & Facebook Shop Sync", "Local Order & Inventory API", "KBZPay & WavePay Gateway", "Logistics Delivery Portal"] : ["React Next.js", "Gemini AI API", "Supabase DB", "Tailwind CSS", "Vercel Cloud"]),
        markdown_deliverable: digitalPresence?.markdown_deliverable || `# Digital Presence Specification: ${activeName}\n\n## Website Landing Page Layout\n\n### 1. Hero Section\n- **Heading**: ${isPhysicalProduct ? `Experience superior quality with ${activeName}.` : `Elevate your workflow with ${activeName}.`}\n- **Subheading**: ${activeIdea}\n- **CTA**: ${isPhysicalProduct ? 'Order Now' : 'Get Started Free'}\n\n### 2. Features Grid\n- **Heading**: Tailored for ${activeCountry}\n\n## Recommended Technical Stack\n- Frontend: ${isPhysicalProduct ? 'Shopify / React Next.js Catalog' : 'React Next.js'}\n- Payments: KBZPay & WavePay`
    };

    const fallbackGrowth = {
        channels: Array.isArray(growthPlan?.channels) && growthPlan.channels.length > 0
            ? growthPlan.channels
            : (isPhysicalProduct ? ["TikTok Shop Live Selling & Facebook Commerce", "Influencer Unboxing & Product Reviews", "Supermarket & Retail Store Placement"] : ["TikTok & Facebook Short Video Ads", "Direct B2B/Community Partnerships", "Viral Referral Invite Codes"]),
        acquisitionPlan: growthPlan?.acquisitionPlan || growthPlan?.acquisition_plan || `Target ${activeAudience} via verified CAC ($${activeCAC}) across ${isPhysicalProduct ? 'social commerce live selling and physical store placement' : 'digital social channels and community partnerships'}.`,
        roadmap90Day: Array.isArray(growthPlan?.roadmap90Day || growthPlan?.roadmap_90_day) && (growthPlan.roadmap90Day || growthPlan.roadmap_90_day).length > 0
            ? (growthPlan.roadmap90Day || growthPlan.roadmap_90_day)
            : (Array.isArray(verifiedBlueprint?.actionable_roadmap_milestones) && verifiedBlueprint.actionable_roadmap_milestones.length > 0
                ? verifiedBlueprint.actionable_roadmap_milestones.map(m => `${m.phase || ''} (${m.date || ''}): ${m.title || ''} - ${m.desc || ''}`)
                : (isPhysicalProduct ? [
                    "Days 1-30: Prototype batch sampling (200 units), supplier quality inspection and final packaging box design.",
                    "Days 31-60: Initial production run of 1,000 units, influencer unboxing gifting and social commerce pre-orders.",
                    "Days 61-90: Retail placement in local supermarkets, wholesale restock partnerships across " + activeCountry + "."
                ] : [
                    "Days 1-30: Launch MVP and onboard initial 200 active users to validate core metrics and gather feedback.",
                    "Days 31-60: Run targeted social media video campaigns and activate community referral programs.",
                    "Days 61-90: Scale paid subscription tiers and establish local institutional partnerships across " + activeCountry + "."
                ])),
        markdown_deliverable: growthPlan?.markdown_deliverable || `# Growth & Marketing Plan: ${activeName}\n\n## Acquisition Channels\n1. **${isPhysicalProduct ? 'TikTok Shop Live Selling' : 'TikTok & Facebook Video Ads'}**\n2. **${isPhysicalProduct ? 'Influencer Unboxing Reviews' : 'Community Partnerships'}**\n3. **${isPhysicalProduct ? 'Offline Retail Placement' : 'Referral Invite Codes'}**\n\n## Launch Roadmap (Verified Milestones)\n${Array.isArray(growthPlan?.roadmap90Day || growthPlan?.roadmap_90_day) && (growthPlan.roadmap90Day || growthPlan.roadmap_90_day).length > 0
            ? (growthPlan.roadmap90Day || growthPlan.roadmap_90_day).map(m => `- ${m}`).join('\n')
            : (Array.isArray(verifiedBlueprint?.actionable_roadmap_milestones) && verifiedBlueprint.actionable_roadmap_milestones.length > 0
                ? verifiedBlueprint.actionable_roadmap_milestones.map(m => `- **${m.phase} (${m.date})**: ${m.title} - ${m.desc}`).join('\n')
                : `- **Phase 1 (Days 1-30)**: ${isPhysicalProduct ? 'Prototype sampling & packaging design.' : 'Alpha launch with 200 active users.'}\n- **Phase 2 (Days 31-60)**: ${isPhysicalProduct ? 'Small batch 1,000 units & social commerce.' : 'Push social video content & referrals.'}\n- **Phase 3 (Days 61-90)**: ${isPhysicalProduct ? 'Supermarket retail placement.' : 'Open paid tiers.'}`)
            }`
    };
    const fallbackMarketing = fallbackGrowth;

    const fallbackBusiness = {
        lean_canvas_markdown: businessPlan?.lean_canvas_markdown || `# Business Overview: Lean Canvas (${activeName})
  
| PROBLEM | SOLUTION | UNIQUE VALUE PROP | UNFAIR ADVANTAGE | CUSTOMER SEGMENTS |
|---|---|---|---|---|
| • ${activePain} | • ${activeIdea} | • Modern, localized ${activeType} built specifically for ${activeCountry} at affordable rates. | • ${isPhysicalProduct ? 'Local manufacturing quality control and established wholesale distributor networks.' : 'Proprietary AI matching algorithms & localized workflow integration.'} | • ${activeAudience} |
  
| KEY METRICS | CHANNELS | COST STRUCTURE | REVENUE STREAMS |
|---|---|---|---|
| • ${isPhysicalProduct ? 'Monthly unit sales volume.<br/>• Inventory turnover rate.<br/>• Retail shelf sell-through.' : 'Active daily/monthly users (DAU/MAU).<br/>• Customer conversion rate.<br/>• Monthly recurring revenue (MRR).'} | • ${isPhysicalProduct ? 'TikTok Shop & Facebook Live.<br/>• Supermarket retail placement.<br/>• Wholesale distributors.' : 'TikTok & Facebook Ads.<br/>• Direct Community Partnerships.<br/>• Referral programs.'} | • ${isPhysicalProduct ? 'Raw materials & procurement.<br/>• Manufacturing & packaging.<br/>• Warehousing & logistics.' : 'AI Compute & API tokens.<br/>• Cloud server infrastructure.<br/>• Marketing campaigns.'} ($${activeCAC} CAC) | • ${isPhysicalProduct ? 'Direct DTC retail purchases.<br/>• Wholesale distributor bulk orders.' : `${businessInfo?.revenue_stream || 'Monthly Subscription & Freemium tiers'}.<br/>• Premium add-on features.`} |`
    };

    const handleStartEdit = () => {
        setIsEditing(true);
        setEditConcept(fallbackConcept.concept);
        setEditDifferentiators(fallbackConcept.key_differentiators.join('\n'));
        setEditMarketTam(fallbackMarket.tam);
        setEditMarketSaturation(fallbackMarket.saturation_level);
        setEditMarketCompetitors([...fallbackMarket.competitors]);
        setEditMarketPersonas([...fallbackMarket.target_personas]);
        setEditFinanceBreakeven(fallbackFinance.breakevenMonth);
        setEditFinanceForecast(fallbackFinance.revenueForecast);
        setEditFinanceCosts([...fallbackFinance.costBreakdown]);
        setEditFinancePricing(fallbackFinance.pricingStrategy);
        setEditBrandNames(fallbackBrand.names.join(', '));
        setEditBrandTagline(fallbackBrand.tagline);
        setEditBrandVoice(fallbackBrand.voice);
        setEditDigitalStack(fallbackDigital.stack.join(', '));
        setEditDigitalFeatures(fallbackDigital.features.join(', '));
        setEditGrowthChannels(fallbackGrowth.channels.join(', '));
        setEditGrowthPlanText(fallbackGrowth.acquisitionPlan);
    };

    const handleSaveAndRediscover = async () => {
        setIsSaving(true);
        setSteps([
            { label: language === 'en' ? 'Persisting edited values' : 'ပြင်ဆင်ချက်များကို သိမ်းဆည်းနေသည်', status: 'running' },
            { label: language === 'en' ? 'Re-running dependent agents' : 'ဆက်စပ်အေဂျင့်များကို ပြန်လည်မောင်းနှင်နေသည်', status: 'pending' },
            { label: language === 'en' ? 'Regenerating Lean Canvas integrator' : 'လုပ်ငန်းစီမံချက်အကျဉ်းကို ပြန်လည်ဖန်တီးနေသည်', status: 'pending' }
        ]);
        setStatusMessage(language === 'en' ? 'Saving edited details to your cloud configuration...' : 'ပြင်ဆင်ချက်များကို ဒေတာဘေ့စ်တွင် သိမ်းဆည်းနေပါသည်...');
        await new Promise(r => setTimeout(r, 1000));

        let updatedValue = null;
        try {
            if (activeTab === 'overview') {
                const updatedConcept = {
                    ...fallbackConcept,
                    concept: editConcept,
                    key_differentiators: editDifferentiators.split('\n').filter(Boolean)
                };
                await updateRefinedConceptDirect(updatedConcept);
                updatedValue = updatedConcept;
            } else if (activeTab === 'market') {
                const updatedMarket = {
                    ...fallbackMarket,
                    tam: editMarketTam,
                    saturation_level: Number(editMarketSaturation),
                    competitors: editMarketCompetitors,
                    target_personas: editMarketPersonas
                };
                await updateMarketResearchDirect(updatedMarket);
                updatedValue = updatedMarket;
            } else if (activeTab === 'finance') {
                const updatedFinance = {
                    ...fallbackFinance,
                    breakevenMonth: Number(editFinanceBreakeven),
                    revenueForecast: editFinanceForecast,
                    costBreakdown: editFinanceCosts,
                    pricingStrategy: editFinancePricing
                };
                await updateFinanceModelDirect(updatedFinance);
                updatedValue = updatedFinance;
            } else if (activeTab === 'brand') {
                const updatedBrand = {
                    ...fallbackBrand,
                    names: editBrandNames.split(',').map(s => s.trim()).filter(Boolean),
                    tagline: editBrandTagline,
                    voice: editBrandVoice
                };
                await updateBrandPackageDirect(updatedBrand);
                updatedValue = updatedBrand;
            } else if (activeTab === 'digital') {
                const updatedDigital = {
                    ...fallbackDigital,
                    stack: editDigitalStack.split(',').map(s => s.trim()).filter(Boolean),
                    features: editDigitalFeatures.split(',').map(s => s.trim()).filter(Boolean)
                };
                await updateDigitalPresenceDirect(updatedDigital);
                updatedValue = updatedDigital;
            } else if (activeTab === 'growth') {
                const updatedGrowth = {
                    ...fallbackGrowth,
                    channels: editGrowthChannels.split(',').map(s => s.trim()).filter(Boolean),
                    acquisitionPlan: editGrowthPlanText
                };
                await updateGrowthPlanDirect(updatedGrowth);
                updatedValue = updatedGrowth;
            }

            setSteps([
                { label: language === 'en' ? 'Persisting edited values' : 'ပြင်ဆင်ချက်များကို သိမ်းဆည်းနေသည်', status: 'completed' },
                { label: language === 'en' ? 'Re-running dependent agents' : 'ဆက်စပ်အေဂျင့်များကို ပြန်လည်မောင်းနှင်နေသည်', status: 'running' },
                { label: language === 'en' ? 'Regenerating Lean Canvas integrator' : 'လုပ်ငန်းစီမံချက်အကျဉ်းကို ပြန်လည်ဖန်တီးနေသည်', status: 'pending' }
            ]);
            setStatusMessage(language === 'en' ? 'Triggering downstream AI agent re-analysis pipeline...' : 'အခြားဆက်စပ်နေသော AI အေဂျင့်များကို ပြန်လည်စစ်ဆေးခိုင်းနေပါသည်...');
            await new Promise(r => setTimeout(r, 1200));

            // Re-run downstream agents and integrator
            await triggerRediscovery(activeTab, updatedValue);

            setSteps([
                { label: language === 'en' ? 'Persisting edited values' : 'ပြင်ဆင်ချက်များကို သိမ်းဆည်းနေသည်', status: 'completed' },
                { label: language === 'en' ? 'Re-running dependent agents' : 'ဆက်စပ်အေဂျင့်များကို ပြန်လည်မောင်းနှင်နေသည်', status: 'completed' },
                { label: language === 'en' ? 'Regenerating Lean Canvas integrator' : 'လုပ်ငန်းစီမံချက်အကျဉ်းကို ပြန်လည်ဖန်တီးနေသည်', status: 'completed' }
            ]);
            setStatusMessage(language === 'en' ? 'Sync complete! Blueprint successfully rediscovered.' : 'လုပ်ငန်းစီမံချက်ကို အောင်မြင်စွာ ပြန်လည်ဆန်းစစ်ပြီးပါပြီ।');
            await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
            console.error("Save & Rediscover failed:", err);
            setStatusMessage(`Error: ${err.message}`);
            await new Promise(r => setTimeout(r, 2000));
        } finally {
            setIsSaving(false);
            setIsEditing(false);
        }
    };

    const tabsList = [
        { id: 'overview', label: t('dashboard.tabOverview'), icon: Briefcase, deliverable: fallbackBusiness.lean_canvas_markdown, filename: 'business_overview.md' },
        { id: 'market', label: t('dashboard.tabMarket'), icon: TrendingUp, deliverable: fallbackMarket.markdown_deliverable, filename: 'market_intelligence.md' },
        { id: 'finance', label: t('dashboard.tabFinance'), icon: DollarSign, deliverable: fallbackFinance.markdown_deliverable, filename: 'financial_model.md' },
        { id: 'brand', label: t('dashboard.tabBrand'), icon: Sparkles, deliverable: fallbackBrand.markdown_deliverable, filename: 'brand_package.md' },
        { id: 'digital', label: t('dashboard.tabDigital'), icon: Globe, deliverable: fallbackDigital.markdown_deliverable, filename: 'digital_presence.md' },
        { id: 'growth', label: t('dashboard.tabGrowth'), icon: Megaphone, deliverable: fallbackGrowth.markdown_deliverable, filename: 'growth_plan.md' },
        { id: 'calendar', label: language === 'en' ? 'Roadmap Calendar' : 'တိုးတက်မှု ပြက္ခဒိန်', icon: CalendarIcon, deliverable: '', filename: '' },
        { id: 'investor', label: t('dashboard.tabInvestor'), icon: FileText, deliverable: '', filename: '' }
    ];

    const currentTabInfo = tabsList.find(t => t.id === activeTab);

    return (
        <section className="perplexity-dashboard-container container">
            {/* Background Spotlights */}
            <div className="perplexity-dashboard-glow-1" />
            <div className="perplexity-dashboard-glow-2" />

            <div className="perplexity-dashboard-header">
                <div>
                    <h2 className="perplexity-dashboard-header-title">
                        {fallbackBrand.names[0] || (language === 'en' ? 'Startup Blueprint' : 'လုပ်ငန်းစီမံချက်')}
                    </h2>
                    <p className="perplexity-dashboard-header-subtitle">
                        {fallbackConcept.improved_summary}
                    </p>
                </div>

                <div>
                    <button
                        className="button-secondary"
                        onClick={handleRestart}
                        style={{
                            borderRadius: '12px',
                            padding: '10px 18px',
                            fontSize: '14px',
                            fontWeight: 600,
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#E2E8F0',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
                    >
                        <ArrowLeft size={16} />
                        {t('dashboard.buttonNew')}
                    </button>
                </div>
            </div>

            {/* Main Tabs Layout */}
            <div className="perplexity-dashboard-grid-layout">

                {/* Left Sidebar Navigation */}
                <aside className="perplexity-dashboard-sidebar">
                    {/* Past Ideas History Panel */}
                    <div style={{ borderRadius: '16px', border: '1px solid var(--color-border-light)', background: 'var(--color-surface-card)', overflow: 'hidden' }}>
                        <button
                            onClick={() => setHistoryExpanded(v => !v)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <History size={18} color="var(--color-accent)" />
                                <span style={{ fontWeight: 700, fontSize: '15px' }}>
                                    {language === 'en' ? `Your Past Ideas (${pastIdeas.length})` : `သင်၏ ယမန်ကစိတ်ကူးများ (${pastIdeas.length})`}
                                </span>
                            </div>
                            {historyExpanded ? <ChevronUp size={18} color="var(--color-text-muted)" /> : <ChevronDown size={18} color="var(--color-text-muted)" />}
                        </button>

                        {historyExpanded && (
                            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '600px', overflowY: 'auto' }}>
                                {pastIdeas.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', margin: '10px 0' }}>
                                        {language === 'en' ? 'No past ideas found.' : 'ယခင်စိတ်ကူးများ မရှိသေးပါ။'}
                                    </p>
                                ) : pastIdeas.map((idea, idx) => (
                                    <div
                                        key={`${idea.idea_id}-${idx}`}
                                        onClick={() => {
                                            if (idea.idea_id !== ideaId) {
                                                window.location.href = `/dashboard?ideaId=${idea.idea_id}`;
                                            }
                                        }}
                                        style={{
                                            padding: '12px 14px',
                                            borderRadius: '12px',
                                            border: idea.idea_id === ideaId ? '1px solid var(--color-accent)' : '1px solid var(--color-border-light)',
                                            background: idea.idea_id === ideaId ? 'rgba(0,242,254,0.05)' : 'rgba(255,255,255,0.02)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => {
                                            if (idea.idea_id !== ideaId) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                        }}
                                        onMouseLeave={e => {
                                            if (idea.idea_id !== ideaId) e.currentTarget.style.borderColor = 'var(--color-border-light)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(0,242,254,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Lightbulb size={14} color="var(--color-accent)" />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {idea.improved_summary || 'Untitled Idea'}
                                                </p>
                                                <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                                    {new Date(idea.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Right Tab Panel Content */}
                <main className="perplexity-dashboard-main-card">
                    {/* Top Tab Pagination */}
                    <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '16px', marginBottom: '24px', borderBottom: '1px solid var(--color-border-light)' }} className="hide-scrollbar">
                        {tabsList.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => {
                                    setActiveTab(id);
                                    setPreviewDoc(false);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    borderRadius: '999px',
                                    whiteSpace: 'nowrap',
                                    background: activeTab === id ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
                                    border: activeTab === id ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid transparent',
                                    color: activeTab === id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                    fontWeight: activeTab === id ? 600 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                }}
                                onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                                onMouseLeave={e => { if (activeTab !== id) e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                            >
                                <Icon size={16} />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Glowing Scan Overlay */}
                    <AgentRediscoveryOverlay
                        isVisible={isSaving}
                        statusMessage={statusMessage}
                        steps={steps}
                    />

                    {/* Tab Header Controls */}
                    <div className="perplexity-dashboard-panel-header">
                        <h3 className="perplexity-dashboard-panel-title">
                            {currentTabInfo.label}
                        </h3>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            {!previewDoc && activeTab !== 'investor' && (
                                isEditing ? (
                                    <>
                                        <button
                                            className="button-secondary"
                                            onClick={() => setIsEditing(false)}
                                            style={{
                                                borderRadius: '12px',
                                                fontSize: '13.5px',
                                                fontWeight: 600,
                                                minHeight: '38px',
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                backgroundColor: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                color: '#E2E8F0',
                                                outline: 'none'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                                        >
                                            {language === 'en' ? 'Cancel' : 'မလုပ်တော့ပါ'}
                                        </button>
                                        <button
                                            className="button-primary"
                                            onClick={handleSaveAndRediscover}
                                            style={{
                                                borderRadius: '12px',
                                                fontSize: '13.5px',
                                                fontWeight: 600,
                                                minHeight: '38px',
                                                padding: '8px 16px',
                                                background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
                                                color: '#FFFFFF',
                                                cursor: 'pointer',
                                                border: 'none',
                                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)',
                                                outline: 'none'
                                            }}
                                        >
                                            {language === 'en' ? 'Save & Rediscover' : 'ပြင်ဆင်ချက်သိမ်းပြီး ပြန်လည်မောင်းနှင်ရန်'}
                                        </button>
                                    </>
                                ) : (
                                    activeTab === 'calendar' ? (
                                        <button
                                            className="button-secondary"
                                            onClick={() => setIsEditingCalendarModal(true)}
                                            style={{
                                                borderRadius: '12px',
                                                fontSize: '13.5px',
                                                fontWeight: 600,
                                                minHeight: '38px',
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                backgroundColor: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                color: '#E2E8F0',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                outline: 'none'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                                        >
                                            <span>✏️</span> {language === 'en' ? 'Edit Config' : 'ပြင်ဆင်ရန်'}
                                        </button>
                                    ) : (
                                        <button
                                            className="button-secondary"
                                            onClick={handleStartEdit}
                                            style={{
                                                borderRadius: '12px',
                                                fontSize: '13.5px',
                                                fontWeight: 600,
                                                minHeight: '38px',
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                backgroundColor: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                color: '#E2E8F0',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                outline: 'none'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                                        >
                                            <span>✏️</span> {language === 'en' ? 'Edit Config' : 'ပြင်ဆင်ရန်'}
                                        </button>
                                    )
                                )
                            )}
                        </div>
                    </div>

                    {/* Content Section: Markdown Document Preview vs Styled UI Layout */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab + (previewDoc ? '-preview' : '-view') + (isEditing ? '-edit' : '-read')}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 1 }}
                        >
                            {previewDoc ? (
                                <MarkdownPreviewer
                                    markdown={currentTabInfo.deliverable}
                                    filename={currentTabInfo.filename}
                                />
                            ) : (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                                    {/* 1. BUSINESS OVERVIEW TAB */}
                                    {activeTab === 'overview' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            {isEditing ? (
                                                <>
                                                    <div className="perplexity-dashboard-glass-box-edit">
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>{t('dashboard.concept')}</label>
                                                        <textarea
                                                            value={editConcept}
                                                            onChange={(e) => setEditConcept(e.target.value)}
                                                            className="input-text"
                                                            style={{ width: '100%', minHeight: '140px', outline: 'none' }}
                                                        />
                                                    </div>
                                                    <div className="perplexity-dashboard-glass-box-edit">
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>{t('dashboard.differentiators')} ({language === 'en' ? 'One per line' : 'တစ်ကြောင်းလျှင် တစ်ခု'})</label>
                                                        <textarea
                                                            value={editDifferentiators}
                                                            onChange={(e) => setEditDifferentiators(e.target.value)}
                                                            placeholder={language === 'en' ? 'Line 1\nLine 2...' : 'ပထမအချက်\nဒုတိယအချက်...'}
                                                            className="input-text"
                                                            style={{ width: '100%', minHeight: '120px', outline: 'none' }}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="perplexity-dashboard-glass-box">
                                                        <h4 style={{ fontWeight: 900, fontSize: '18px', color: '#ffffff', marginBottom: '14px', letterSpacing: '-0.01em' }}>{t('dashboard.concept')}</h4>
                                                        <p className="perplexity-dashboard-concept-text">
                                                            {fallbackConcept.concept}
                                                        </p>
                                                    </div>
                                                    <div className="perplexity-dashboard-glass-box">
                                                        <h4 style={{ fontWeight: 900, fontSize: '18px', color: '#ffffff', marginBottom: '20px', letterSpacing: '-0.01em' }}>{t('dashboard.differentiators')}</h4>
                                                        <ul className="perplexity-dashboard-bullet-list">
                                                            {fallbackConcept.key_differentiators.map((diff, idx) => (
                                                                <li key={idx} className="perplexity-dashboard-bullet-item">
                                                                    <span className="perplexity-dashboard-bullet-dot" />
                                                                    <span>{diff}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* 2. MARKET INTELLIGENCE TAB */}
                                    {activeTab === 'market' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                            {isEditing ? (
                                                <>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                        <div className="perplexity-dashboard-glass-box-edit">
                                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                                                                {language === 'en' ? 'Total Addressable Market (TAM)' : 'စုစုပေါင်း TAM'}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={editMarketTam}
                                                                onChange={(e) => setEditMarketTam(e.target.value)}
                                                                className="input-text"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>
                                                        <div className="perplexity-dashboard-glass-box-edit">
                                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                                                                {language === 'en' ? 'Market Saturation Index (%)' : 'ဈေးကွက် ပြည့်နှက်မှု အညွှန်းကိန်း (%)'}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={editMarketSaturation}
                                                                onChange={(e) => setEditMarketSaturation(Number(e.target.value))}
                                                                className="input-text"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Competitors List Table */}
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                                            <h4 style={{ fontWeight: 900, margin: 0, color: '#ffffff' }}>{language === 'en' ? 'Competitor Analysis' : 'ပြိုင်ဘက်များ ဆန်းစစ်ချက်'}</h4>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditMarketCompetitors([...editMarketCompetitors, { name: '', url: '', weakness: '' }])}
                                                                style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                                                            >
                                                                <Plus size={14} /> {language === 'en' ? 'Add' : 'ထည့်ရန်'}
                                                            </button>
                                                        </div>
                                                        <div className="perplexity-dashboard-table-container">
                                                            <table className="perplexity-dashboard-table">
                                                                <thead>
                                                                    <tr className="perplexity-dashboard-table-header-row">
                                                                        <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Competitor' : 'ပြိုင်ဘက်'}</th>
                                                                        <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Domain / URL' : 'ဝဘ်လိပ်စာ / URL'}</th>
                                                                        <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Weak Spot' : 'အားနည်းချက်'}</th>
                                                                        <th style={{ padding: '12px 16px', width: '60px' }}></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {editMarketCompetitors.map((comp, idx) => (
                                                                        <tr key={idx} className="perplexity-dashboard-table-row">
                                                                            <td className="perplexity-dashboard-table-cell" style={{ padding: '8px 12px' }}>
                                                                                <input
                                                                                    type="text"
                                                                                    value={comp.name}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...editMarketCompetitors];
                                                                                        updated[idx].name = e.target.value;
                                                                                        setEditMarketCompetitors(updated);
                                                                                    }}
                                                                                    className="input-text"
                                                                                    style={{ width: '100%', padding: '8px 12px' }}
                                                                                />
                                                                            </td>
                                                                            <td className="perplexity-dashboard-table-cell" style={{ padding: '8px 12px' }}>
                                                                                <input
                                                                                    type="text"
                                                                                    value={comp.url}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...editMarketCompetitors];
                                                                                        updated[idx].url = e.target.value;
                                                                                        setEditMarketCompetitors(updated);
                                                                                    }}
                                                                                    className="input-text"
                                                                                    style={{ width: '100%', padding: '8px 12px' }}
                                                                                />
                                                                            </td>
                                                                            <td className="perplexity-dashboard-table-cell" style={{ padding: '8px 12px' }}>
                                                                                <input
                                                                                    type="text"
                                                                                    value={comp.weakness}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...editMarketCompetitors];
                                                                                        updated[idx].weakness = e.target.value;
                                                                                        setEditMarketCompetitors(updated);
                                                                                    }}
                                                                                    className="input-text"
                                                                                    style={{ width: '100%', padding: '8px 12px' }}
                                                                                />
                                                                            </td>
                                                                            <td className="perplexity-dashboard-table-cell" style={{ padding: '8px 12px', textAlign: 'center' }}>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setEditMarketCompetitors(editMarketCompetitors.filter((_, i) => i !== idx))}
                                                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                                >
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    {/* ICP target personas */}
                                                    <div>
                                                        <h4 style={{ fontWeight: 900, marginBottom: '14px', color: '#ffffff' }}>{language === 'en' ? 'Target Customer Personas' : 'ပစ်မှတ် သုံးစွဲသူအမျိုးအစား'}</h4>
                                                        <div className="perplexity-dashboard-persona-grid">
                                                            {editMarketPersonas.map((pers, idx) => (
                                                                <div key={idx} className="perplexity-dashboard-glass-box-edit" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Persona Name"
                                                                        value={pers.name}
                                                                        onChange={(e) => {
                                                                            const updated = [...editMarketPersonas];
                                                                            updated[idx].name = e.target.value;
                                                                            setEditMarketPersonas(updated);
                                                                        }}
                                                                        className="input-text"
                                                                        style={{ width: '100%', padding: '8px 12px', fontSize: '14.5px', fontWeight: 800 }}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Role/Job"
                                                                        value={pers.role}
                                                                        onChange={(e) => {
                                                                            const updated = [...editMarketPersonas];
                                                                            updated[idx].role = e.target.value;
                                                                            setEditMarketPersonas(updated);
                                                                        }}
                                                                        className="input-text"
                                                                        style={{ width: '100%', padding: '8px 12px', fontSize: '12.5px' }}
                                                                    />
                                                                    <div>
                                                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Pain Points (one per line):</label>
                                                                        <textarea
                                                                            value={pers.pain_points.join('\n')}
                                                                            onChange={(e) => {
                                                                                const updated = [...editMarketPersonas];
                                                                                updated[idx].pain_points = e.target.value.split('\n').filter(Boolean);
                                                                                setEditMarketPersonas(updated);
                                                                            }}
                                                                            className="input-text"
                                                                            style={{ width: '100%', fontSize: '13px', minHeight: '68px', fontFamily: 'var(--font-inter)' }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Price Sensitivity / Limit:</label>
                                                                        <input
                                                                            type="text"
                                                                            value={pers.budget_limit}
                                                                            onChange={(e) => {
                                                                                const updated = [...editMarketPersonas];
                                                                                updated[idx].budget_limit = e.target.value;
                                                                                setEditMarketPersonas(updated);
                                                                            }}
                                                                            className="input-text"
                                                                            style={{ width: '100%', fontSize: '13px' }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                        <div className="perplexity-dashboard-stat-card">
                                                            <p className="perplexity-dashboard-stat-label">{language === 'en' ? 'Total Addressable Market' : 'စုစုပေါင်း TAM'}</p>
                                                            <h4 className="perplexity-dashboard-stat-value">{fallbackMarket.tam}</h4>
                                                        </div>
                                                        <div className="perplexity-dashboard-stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                            <p className="perplexity-dashboard-stat-label" style={{ marginBottom: 0 }}>{language === 'en' ? 'Market Saturation Index' : 'ဈေးကွက် ပြည့်နှက်မှု အညွှန်းကိန်း'}</p>
                                                            <div style={{ height: '140px', width: '100%', marginTop: '10px' }}>
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <PieChart>
                                                                        <Pie
                                                                            isAnimationActive={false}
                                                                            data={[
                                                                                { name: 'Saturated', value: fallbackMarket.saturation_level },
                                                                                { name: 'Available', value: 100 - fallbackMarket.saturation_level }
                                                                            ]}
                                                                            cx="50%" cy="100%"
                                                                            startAngle={180} endAngle={0}
                                                                            innerRadius={70} outerRadius={90}
                                                                            paddingAngle={2}
                                                                            dataKey="value"
                                                                            stroke="none"
                                                                        >
                                                                            <Cell fill="var(--color-primary)" />
                                                                            <Cell fill="rgba(255,255,255,0.05)" />
                                                                        </Pie>
                                                                    </PieChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                            <h4 className="perplexity-dashboard-stat-value" style={{ marginTop: '-40px' }}>{fallbackMarket.saturation_level}%</h4>
                                                        </div>
                                                    </div>

                                                    {/* Competitors List Table */}
                                                    <div>
                                                        <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '16px', color: '#ffffff' }}>{language === 'en' ? 'Competitor Analysis' : 'ပြိုင်ဘက်များ ဆန်းစစ်ချက်'}</h4>
                                                        <div className="perplexity-dashboard-table-container">
                                                            <table className="perplexity-dashboard-table">
                                                                <thead>
                                                                    <tr className="perplexity-dashboard-table-header-row">
                                                                        <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Competitor' : 'ပြိုင်ဘက်'}</th>
                                                                        <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Domain / URL' : 'ဝဘ်လိပ်စာ / URL'}</th>
                                                                        <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Weak Spot' : 'အားနည်းချက်'}</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {fallbackMarket.competitors.map((comp, idx) => (
                                                                        <tr key={idx} className="perplexity-dashboard-table-row">
                                                                            <td className="perplexity-dashboard-table-cell" style={{ fontWeight: 700, color: '#ffffff' }}>{comp.name}</td>
                                                                            <td className="perplexity-dashboard-table-cell">
                                                                                {comp.url.startsWith('http') ? (
                                                                                    <a href={comp.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-link)', textDecoration: 'underline' }}>
                                                                                        {comp.url} <ExternalLink size={12} />
                                                                                    </a>
                                                                                ) : <span style={{ color: 'var(--color-text-muted)' }}>{comp.url}</span>}
                                                                            </td>
                                                                            <td className="perplexity-dashboard-table-cell" style={{ color: 'var(--color-text-secondary)' }}>{comp.weakness}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    {/* ICP target personas */}
                                                    <div>
                                                        <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '16px', color: '#ffffff' }}>{language === 'en' ? 'Target Customer Personas' : 'ပစ်မှတ် သုံးစွဲသူအမျိုးအစား'}</h4>
                                                        <div className="perplexity-dashboard-persona-grid">
                                                            {fallbackMarket.target_personas.map((pers, idx) => (
                                                                <div key={idx} className="perplexity-dashboard-persona-card">
                                                                    <div>
                                                                        <h5 className="perplexity-dashboard-persona-name">{pers.name}</h5>
                                                                        <span className="perplexity-dashboard-persona-role">{pers.role}</span>
                                                                    </div>
                                                                    <div className="perplexity-dashboard-persona-section">
                                                                        <p className="perplexity-dashboard-persona-section-label">{language === 'en' ? 'Key Pain Points' : 'အဓိက အခက်အခဲများ'}</p>
                                                                        <ul className="perplexity-dashboard-persona-list">
                                                                            {pers.pain_points.map((p, i) => <li key={i}>{p}</li>)}
                                                                        </ul>
                                                                    </div>
                                                                    <div className="perplexity-dashboard-persona-footer">
                                                                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{language === 'en' ? 'Price Sensitivity:' : 'စျေးနှုန်းအပေါ် တုံ့ပြန်မှု:'}</span>
                                                                        <span className="perplexity-dashboard-persona-budget">{pers.budget_limit}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* 3. FINANCIAL MODEL TAB */}
                                    {activeTab === 'finance' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                            {isEditing ? (
                                                <>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                        <div className="perplexity-dashboard-glass-box-edit">
                                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 850, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>{t('dashboard.breakeven')} ({t('dashboard.months')})</label>
                                                            <input
                                                                type="number"
                                                                value={editFinanceBreakeven}
                                                                onChange={(e) => setEditFinanceBreakeven(Number(e.target.value))}
                                                                className="input-text"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>
                                                        <div className="perplexity-dashboard-glass-box-edit">
                                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 850, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>{t('dashboard.monthlyRevenue')}</label>
                                                            <input
                                                                type="text"
                                                                value={editFinanceForecast}
                                                                onChange={(e) => setEditFinanceForecast(e.target.value)}
                                                                className="input-text"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Cost table */}
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                                            <h4 style={{ fontWeight: 900, margin: 0, color: '#ffffff' }}>{t('dashboard.initialCost')}</h4>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditFinanceCosts([...editFinanceCosts, { item: '', cost: 0 }])}
                                                                style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                                                            >
                                                                <Plus size={14} /> {language === 'en' ? 'Add' : 'ထည့်ရန်'}
                                                            </button>
                                                        </div>
                                                        <div className="perplexity-dashboard-table-container">
                                                            <table className="perplexity-dashboard-table">
                                                                <thead>
                                                                    <tr className="perplexity-dashboard-table-header-row">
                                                                        <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Expense Item' : 'အသုံးစရိတ် အမျိုးအစား'}</th>
                                                                        <th className="perplexity-dashboard-table-header-cell" style={{ textAlign: 'right', width: '180px' }}>{language === 'en' ? 'Cost' : 'ကုန်ကျစရိတ်'} (MMK)</th>
                                                                        <th style={{ padding: '12px 16px', width: '60px' }}></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {editFinanceCosts.map((item, idx) => (
                                                                        <tr key={idx} className="perplexity-dashboard-table-row">
                                                                            <td className="perplexity-dashboard-table-cell" style={{ padding: '8px 12px' }}>
                                                                                <input
                                                                                    type="text"
                                                                                    value={item.item}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...editFinanceCosts];
                                                                                        updated[idx].item = e.target.value;
                                                                                        setEditFinanceCosts(updated);
                                                                                    }}
                                                                                    className="input-text"
                                                                                    style={{ width: '100%' }}
                                                                                />
                                                                            </td>
                                                                            <td className="perplexity-dashboard-table-cell" style={{ padding: '8px 12px' }}>
                                                                                <input
                                                                                    type="number"
                                                                                    value={item.cost}
                                                                                    onChange={(e) => {
                                                                                        const updated = [...editFinanceCosts];
                                                                                        updated[idx].cost = Number(e.target.value);
                                                                                        setEditFinanceCosts(updated);
                                                                                    }}
                                                                                    className="input-text"
                                                                                    style={{ width: '100%', textAlign: 'right' }}
                                                                                />
                                                                            </td>
                                                                            <td className="perplexity-dashboard-table-cell" style={{ padding: '8px 12px', textAlign: 'center' }}>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setEditFinanceCosts(editFinanceCosts.filter((_, i) => i !== idx))}
                                                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                                >
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    <div className="perplexity-dashboard-glass-box-edit">
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>{language === 'en' ? 'Pricing & Subscription Tiers' : 'စျေးနှုန်းနှင့် လစဉ်ကြေး သတ်မှတ်ချက်များ'}</label>
                                                        <textarea
                                                            value={editFinancePricing}
                                                            onChange={(e) => setEditFinancePricing(e.target.value)}
                                                            className="input-text"
                                                            style={{ width: '100%', minHeight: '90px', fontFamily: 'var(--font-inter)' }}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                        <div className="perplexity-dashboard-stat-card" style={{ gridColumn: 'span 2' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                <div>
                                                                    <p className="perplexity-dashboard-stat-label">{t('dashboard.breakeven')} Timeline</p>
                                                                    <h4 className="perplexity-dashboard-stat-value" style={{ fontSize: '20px' }}>{fallbackFinance.breakevenMonth} {t('dashboard.months')}</h4>
                                                                </div>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <p className="perplexity-dashboard-stat-label">{t('dashboard.monthlyRevenue')}</p>
                                                                    <p style={{ margin: 0, fontSize: '14px', color: '#ffffff', fontWeight: 700 }}>{fallbackFinance.revenueForecast}</p>
                                                                </div>
                                                            </div>
                                                            <div style={{ height: '200px', width: '100%', marginTop: '20px' }}>
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <AreaChart data={Array.from({ length: (Number(fallbackFinance.breakevenMonth) || 12) + 4 }, (_, i) => ({ month: i === 0 ? 'Start' : `M${i}`, cash: i < (Number(fallbackFinance.breakevenMonth) || 12) ? -2500 * ((Number(fallbackFinance.breakevenMonth) || 12) - i) : 2500 * (i - (Number(fallbackFinance.breakevenMonth) || 12)) }))}>
                                                                        <defs>
                                                                            <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                                                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.6} />
                                                                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                                                            </linearGradient>
                                                                        </defs>
                                                                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                                                                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val === 0 ? '0' : val > 0 ? `+${val}` : val} />
                                                                        <RechartsTooltip contentStyle={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-light)', borderRadius: '12px', color: '#fff' }} />
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                                        <Area isAnimationActive={false} type="monotone" dataKey="cash" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCash)" />
                                                                    </AreaChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Cost table */}
                                                    <div>
                                                        <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '16px', color: '#ffffff' }}>{t('dashboard.initialCost')}</h4>
                                                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                                            <div style={{ flex: '1 1 300px', height: '300px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px', padding: '20px', border: '1px solid var(--color-border-light)' }}>
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <PieChart>
                                                                        <Pie
                                                                            isAnimationActive={false}
                                                                            data={fallbackFinance.costBreakdown.map(i => ({ name: i.item, value: Number(i.cost) || 0 }))}
                                                                            cx="50%" cy="50%"
                                                                            innerRadius={70} outerRadius={95}
                                                                            paddingAngle={4}
                                                                            dataKey="value"
                                                                            stroke="none"
                                                                        >
                                                                            {fallbackFinance.costBreakdown.map((_, index) => (
                                                                                <Cell key={`cell-${index}`} fill={['#6366F1', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#3B82F6'][index % 6]} />
                                                                            ))}
                                                                        </Pie>
                                                                        <RechartsTooltip
                                                                            contentStyle={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-light)', borderRadius: '12px', color: '#fff' }}
                                                                            itemStyle={{ color: '#fff' }}
                                                                        />
                                                                    </PieChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                            <div className="perplexity-dashboard-table-container" style={{ flex: '2 1 400px' }}>
                                                                <table className="perplexity-dashboard-table">
                                                                    <thead>
                                                                        <tr className="perplexity-dashboard-table-header-row">
                                                                            <th className="perplexity-dashboard-table-header-cell">{language === 'en' ? 'Expense Item' : 'အသုံးစရိတ် အမျိုးအစား'}</th>
                                                                            <th className="perplexity-dashboard-table-header-cell" style={{ textAlign: 'right' }}>{language === 'en' ? 'Cost' : 'ကုန်ကျစရိတ်'} ({getCurrencySymbol() === 'MMK' ? 'MMK' : '$'})</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {fallbackFinance.costBreakdown.map((item, idx) => (
                                                                            <tr key={idx} className="perplexity-dashboard-table-row">
                                                                                <td className="perplexity-dashboard-table-cell" style={{ color: 'var(--color-text-secondary)' }}>{item.item}</td>
                                                                                <td className="perplexity-dashboard-table-cell" style={{ textAlign: 'right', fontWeight: 700, color: '#ffffff' }}>{formatCost(item.cost)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="perplexity-dashboard-glass-box">
                                                        <h4 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '12px', color: '#ffffff' }}>{language === 'en' ? 'Pricing & Subscription Tiers' : 'စျေးနှုန်းနှင့် လစဉ်ကြေး သတ်မှတ်ချက်များ'}</h4>
                                                        <p style={{ margin: 0, fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{fallbackFinance.pricingStrategy}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* 4. BRAND PACKAGE TAB */}
                                    {activeTab === 'brand' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                            {isEditing ? (
                                                <>
                                                    {/* Suggested Name badges */}
                                                    <div className="perplexity-dashboard-glass-box-edit">
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>{language === 'en' ? 'Brainstormed Brand Names' : 'အမှတ်တံဆိပ် အမည်များ'}</label>
                                                        <input
                                                            type="text"
                                                            value={editBrandNames}
                                                            onChange={(e) => setEditBrandNames(e.target.value)}
                                                            placeholder="Name 1, Name 2, Name 3"
                                                            className="input-text"
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>

                                                    {/* Tagline & Voice */}
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                        <div className="perplexity-dashboard-glass-box-edit">
                                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{language === 'en' ? 'Marketing Tagline' : 'ဆောင်ပုဒ် (Tagline)'}</label>
                                                            <input
                                                                type="text"
                                                                value={editBrandTagline}
                                                                onChange={(e) => setEditBrandTagline(e.target.value)}
                                                                className="input-text"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>
                                                        <div className="perplexity-dashboard-glass-box-edit">
                                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{language === 'en' ? 'Brand Voice' : 'အမှတ်တံဆိပ် ပြောဆိုပုံ (Brand Voice)'}</label>
                                                            <input
                                                                type="text"
                                                                value={editBrandVoice}
                                                                onChange={(e) => setEditBrandVoice(e.target.value)}
                                                                className="input-text"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Logo Concept */}
                                                    <div className="perplexity-dashboard-glass-box-edit">
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>{language === 'en' ? 'Visual Logo Concept' : 'လိုဂို ပုံရိပ် Concept'}</label>
                                                        <textarea
                                                            value={editBrandVoice}
                                                            onChange={(e) => setEditBrandVoice(e.target.value)}
                                                            className="input-text"
                                                            style={{ width: '100%', minHeight: '90px', fontFamily: 'var(--font-inter)' }}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Suggested Name badges */}
                                                    <div>
                                                        <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '16px', color: '#ffffff' }}>{language === 'en' ? 'Brainstormed Brand Names' : 'အမှတ်တံဆိပ် အမည်များ'}</h4>
                                                        <div className="perplexity-dashboard-names-container">
                                                            {fallbackBrand.names.map((name, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className={`perplexity-dashboard-name-badge ${idx === 0 ? 'primary' : ''}`}
                                                                >
                                                                    {name} {idx === 0 && '✦'}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Tagline & Voice */}
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                        <div className="perplexity-dashboard-glass-box">
                                                            <h4 style={{ fontWeight: 900, marginBottom: '8px', fontSize: '15.5px', color: '#ffffff' }}>{language === 'en' ? 'Marketing Tagline' : 'ဆောင်ပုဒ် (Tagline)'}</h4>
                                                            <p style={{ margin: 0, fontStyle: 'italic', fontSize: '15px', color: 'var(--color-text-secondary)' }}>"{fallbackBrand.tagline}"</p>
                                                        </div>
                                                        <div className="perplexity-dashboard-glass-box">
                                                            <h4 style={{ fontWeight: 900, marginBottom: '8px', fontSize: '15.5px', color: '#ffffff' }}>{language === 'en' ? 'Brand Voice' : 'အမှတ်တံဆိပ် ပြောဆိုပုံ (Brand Voice)'}</h4>
                                                            <p style={{ margin: 0, fontSize: '14.5px', color: 'var(--color-text-secondary)' }}>{fallbackBrand.voice}</p>
                                                        </div>
                                                    </div>

                                                    {/* Color palette */}
                                                    <div className="perplexity-dashboard-glass-box">
                                                        <h4 style={{ fontWeight: 900, marginBottom: '16px', color: '#ffffff' }}>{language === 'en' ? 'Hex Color Palette' : 'အရောင်အသွေး သတ်မှတ်ချက်'}</h4>
                                                        <div className="perplexity-dashboard-color-palette">
                                                            {[
                                                                { label: language === 'en' ? 'Primary Brand Color' : 'အဓိက အရောင်', hex: fallbackBrand.palette.primary },
                                                                { label: language === 'en' ? 'Secondary Accent' : 'တွဲဖက် အရောင်', hex: fallbackBrand.palette.secondary },
                                                                { label: language === 'en' ? 'Canvas Background' : 'နောက်ခံ အရောင်', hex: fallbackBrand.palette.background }
                                                            ].map((color, i) => (
                                                                <div key={i} className="perplexity-dashboard-color-item">
                                                                    <div
                                                                        className="perplexity-dashboard-color-swatch"
                                                                        style={{ backgroundColor: color.hex }}
                                                                    />
                                                                    <div>
                                                                        <p className="perplexity-dashboard-color-label">{color.label}</p>
                                                                        <code className="perplexity-dashboard-color-hex">{color.hex}</code>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Logo Concept */}
                                                    <div className="perplexity-dashboard-glass-box">
                                                        <h4 style={{ fontWeight: 900, marginBottom: '8px', color: '#ffffff', fontSize: '15.5px' }}>{language === 'en' ? 'Visual Logo Concept' : 'လိုဂို ပုံရိပ် Concept'}</h4>
                                                        <p style={{ margin: 0, fontSize: '14.5px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{fallbackBrand.logoConcept}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* 5. DIGITAL PRESENCE TAB */}
                                    {activeTab === 'digital' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                            {isEditing ? (
                                                <div className="perplexity-dashboard-glass-box-edit" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Proposed Tech Stack (comma separated)</label>
                                                        <input
                                                            type="text"
                                                            value={editDigitalStack}
                                                            onChange={(e) => setEditDigitalStack(e.target.value)}
                                                            className="input-text"
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Core Capabilities (comma separated)</label>
                                                        <input
                                                            type="text"
                                                            value={editDigitalFeatures}
                                                            onChange={(e) => setEditDigitalFeatures(e.target.value)}
                                                            className="input-text"
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>

                                                    {/* Wireframe Outline */}
                                                    <div>
                                                        <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '16px', color: '#ffffff' }}>{language === 'en' ? 'Landing Page Wireframe Elements' : 'ဝဘ်ဆိုက် Layout Wireframe အစိတ်အပိုင်းများ'}</h4>
                                                        <div className="perplexity-dashboard-wireframe-grid">
                                                            {fallbackDigital.landingPageOutline.map((sec, idx) => (
                                                                <div key={idx} className="perplexity-dashboard-wireframe-card">
                                                                    <div className="perplexity-dashboard-wireframe-header">
                                                                        <strong className="perplexity-dashboard-wireframe-section-id">{sec.section_id} {language === 'en' ? 'section' : 'အပိုင်း'}</strong>
                                                                        {sec.cta_text && sec.cta_text !== 'None' && (
                                                                            <span className="perplexity-dashboard-wireframe-cta">
                                                                                CTA: {sec.cta_text}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <h5 className="perplexity-dashboard-wireframe-title">{sec.title}</h5>
                                                                    <p className="perplexity-dashboard-wireframe-body">{sec.body}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Capabilities & Stack */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                                        <div className="perplexity-dashboard-glass-box">
                                                            <h4 style={{ fontWeight: 900, marginBottom: '14px', fontSize: '15.5px', color: '#ffffff' }}>Core Capabilities</h4>
                                                            <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--color-text-secondary)', listStyleType: 'circle' }}>
                                                                {fallbackDigital.features.map((feat, i) => <li key={i}>{feat}</li>)}
                                                            </ul>
                                                        </div>
                                                        <div className="perplexity-dashboard-glass-box">
                                                            <h4 style={{ fontWeight: 900, marginBottom: '14px', fontSize: '15.5px', color: '#ffffff' }}>Proposed Tech Stack</h4>
                                                            <div className="perplexity-dashboard-tech-stack-container">
                                                                {fallbackDigital.stack.map((tech, i) => (
                                                                    <span key={i} className="perplexity-dashboard-tech-pill">
                                                                        {tech}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 6. GROWTH & MARKETING TAB */}
                                    {activeTab === 'growth' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                            {isEditing ? (
                                                <div className="perplexity-dashboard-glass-box-edit" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Acquisition Channels (comma separated)</label>
                                                        <input
                                                            type="text"
                                                            value={editGrowthChannels}
                                                            onChange={(e) => setEditGrowthChannels(e.target.value)}
                                                            className="input-text"
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Acquisition Plan</label>
                                                        <textarea
                                                            value={editGrowthPlanText}
                                                            onChange={(e) => setEditGrowthPlanText(e.target.value)}
                                                            className="input-text"
                                                            style={{ width: '100%', minHeight: '130px', fontFamily: 'var(--font-inter)' }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Channels list */}
                                                    <div className="perplexity-dashboard-glass-box">
                                                        <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '14px', color: '#ffffff' }}>Acquisition Channels</h4>
                                                        <div className="perplexity-dashboard-growth-channels">
                                                            {fallbackGrowth.channels.map((chan, idx) => (
                                                                <span key={idx} className="perplexity-dashboard-channel-pill">
                                                                    {chan}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <p style={{ margin: '20px 0 0 0', fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                                                            {fallbackGrowth.acquisitionPlan}
                                                        </p>
                                                    </div>

                                                    {/* 90-day Roadmap list */}
                                                    <div>
                                                        <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px', color: '#ffffff' }}>First 90-Day Execution Roadmap</h4>
                                                        <div className="perplexity-dashboard-timeline">
                                                            {fallbackGrowth.roadmap90Day.map((step, idx) => {
                                                                const phaseTitle = idx === 0 ? 'Month 1' : (idx === 1 ? 'Month 2' : 'Month 3');
                                                                return (
                                                                    <div key={idx} style={{ position: 'relative' }}>
                                                                        {/* Timeline dot */}
                                                                        <div className="perplexity-dashboard-timeline-dot" />
                                                                        <div className="perplexity-dashboard-timeline-card">
                                                                            <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{phaseTitle}</span>
                                                                            <p style={{ margin: '8px 0 0 0', fontSize: '14.5px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                                                                                {step}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* 7. ROADMAP CALENDAR TAB */}
                                    {activeTab === 'calendar' && (
                                        <RoadmapCalendar
                                            growthPlan={growthPlan || fallbackGrowth}
                                            businessInfo={businessInfo}
                                            refinedConcept={refinedConcept || fallbackConcept}
                                            ideaId={ideaId || currentIdeaId}
                                            externalIsEditing={isEditingCalendarModal}
                                            externalSetIsEditing={setIsEditingCalendarModal}
                                        />
                                    )}

                                    {/* 8. GO TO INVESTOR TAB */}
                                    {activeTab === 'investor' && (
                                        <div className="perplexity-investor-suite">
                                            {/* Suite Banner */}
                                            <div className="perplexity-investor-banner">
                                                <div className="perplexity-investor-banner-info">
                                                    <h4 className="perplexity-investor-banner-title">
                                                        {language === 'en' ? 'Investor Relations Pitch Deck & Reports' : 'ရင်းနှီးမြှုပ်နှံသူထံ တင်ပြရန် အစီရင်ခံစာများ'}
                                                    </h4>
                                                    <p className="perplexity-investor-banner-desc">
                                                        {language === 'en' ? 'Export individual business segments or generate a single cohesive investor prospectus PDF.' : 'လုပ်ငန်းကဏ္ဍတစ်ခုချင်းစီအလိုက် သို့မဟုတ် စုစည်းထားသော ရင်းနှီးမြှုပ်နှံမှု အဆိုပြုလွှာ PDF စာအုပ်ကို တစ်ပြိုင်နက် ထုတ်ယူနိုင်ပါသည်'}
                                                    </p>
                                                </div>
                                                <div className="perplexity-investor-banner-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                    <button
                                                        className="button-secondary"
                                                        onClick={() => setEmailModal({ isOpen: true, docTitle: language === 'en' ? 'Complete Startup Prospectus' : 'အပြည့်အစုံ ရင်းနှီးမြှုပ်နှံမှု အဆိုပြုလွှာ PDF စာအုပ်', docContent: (fallbackConcept.concept || '') + '\n\n' + (fallbackBusiness.lean_canvas_markdown || '') })}
                                                        style={{ borderRadius: '12px', fontSize: '13.5px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '38px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#FFF', cursor: 'pointer' }}
                                                    >
                                                        <Mail size={16} color="#00F2FE" />
                                                        <span>{language === 'en' ? 'Email Prospectus Draft' : '📧 အီးမေးလ်ဖြင့် ကြမ်းခင်းပို့ရန်'}</span>
                                                    </button>
                                                    <button className="button-primary" onClick={handleDownloadAllPDF} style={{ borderRadius: '12px', fontSize: '13.5px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '38px', background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)', border: 'none', color: '#FFF' }}>
                                                        <FileText size={16} />
                                                        <span>{language === 'en' ? 'Download Prospectus (PDF)' : 'Prospectus PDF ဒေါင်းလုဒ်လုပ်ရန်'}</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Unified Document Grid */}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '24px' }}>
                                                {[
                                                    { id: 'overview', title: language === 'en' ? 'Business Overview (Lean Canvas)' : 'ခြုံငုံသုံးသပ်ချက် (Lean Canvas)', filename: 'business_overview.md', content: fallbackBusiness.lean_canvas_markdown },
                                                    { id: 'market', title: language === 'en' ? 'Market Intelligence Report' : 'ဈေးကွက်ဆန်းစစ်ချက် အစီရင်ခံစာ', filename: 'market_intelligence.md', content: fallbackMarket.markdown_deliverable },
                                                    { id: 'finance', title: language === 'en' ? 'Financial Model & Projections' : 'ဘဏ္ဍာရေးပုံစံနှင့် ခန့်မှန်းချက်များ', filename: 'financial_model.md', content: fallbackFinance.markdown_deliverable },
                                                    { id: 'brand', title: language === 'en' ? 'Brand Identity & Style Guide' : 'အမှတ်တံဆိပ်ပုံဖော်မှု လမ်းညွှန်', filename: 'brand_package.md', content: fallbackBrand.markdown_deliverable },
                                                    { id: 'digital', title: language === 'en' ? 'Digital Presence & Website Specs' : 'ဒီဂျစ်တယ်တည်ရှိမှုနှင့် ဝဘ်ဆိုက်ပုံစံ', filename: 'digital_presence.md', content: fallbackDigital.markdown_deliverable },
                                                    { id: 'growth', title: language === 'en' ? 'Growth & Marketing Strategy' : 'တိုးတက်မှုစီမံချက်နှင့် မားကက်တင်း', filename: 'growth_plan.md', content: fallbackGrowth.markdown_deliverable }
                                                ].map((docItem) => (
                                                    <div key={docItem.id} style={{
                                                        background: 'var(--color-surface-card)',
                                                        border: '1px solid var(--color-border-light)',
                                                        borderRadius: '16px',
                                                        padding: '24px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '16px',
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <FileText size={20} color="var(--color-accent)" />
                                                            </div>
                                                            <div>
                                                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>{docItem.title}</h4>
                                                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{docItem.filename}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                                                            <button 
                                                                className="button-secondary"
                                                                onClick={() => handleDownloadPDF(docItem.title, docItem.content, docItem.filename)}
                                                                style={{ flex: 1, padding: '10px', fontSize: '13px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600, border: '1px solid var(--color-border-light)', backgroundColor: 'transparent', color: 'var(--color-text-primary)', cursor: 'pointer' }}
                                                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                            >
                                                                <Download size={14} />
                                                                {language === 'en' ? 'Download PDF' : 'PDF ဒေါင်းလုဒ်'}
                                                            </button>
                                                            <button 
                                                                className="button-secondary"
                                                                onClick={() => setEmailModal({ isOpen: true, docTitle: docItem.title, docContent: docItem.content })}
                                                                style={{ flex: 1, padding: '10px', fontSize: '13px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600, border: '1px solid rgba(0, 242, 254, 0.3)', background: 'rgba(0, 242, 254, 0.08)', color: '#00F2FE', cursor: 'pointer' }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0, 242, 254, 0.15)'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0, 242, 254, 0.08)'; }}
                                                            >
                                                                <Mail size={14} />
                                                                {language === 'en' ? 'Email Draft' : '📧 အီးမေးလ်ပို့ရန်'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* AI Investor Email Drafter Modal */}
                                            <InvestorEmailModal
                                                isOpen={emailModal.isOpen}
                                                onClose={() => setEmailModal({ isOpen: false, docTitle: '', docContent: '' })}
                                                docTitle={emailModal.docTitle}
                                                docContent={emailModal.docContent}
                                                businessName={fallbackBrand?.names?.[0] || 'Our Startup'}
                                            />
                                        </div>
                                    )}

                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </section>
    );
}
