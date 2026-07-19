'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Circle, AlertCircle, Sparkles, Bot, Wrench, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useWorkflow } from '../context/WorkflowContext';
import { runRoadmapBreakdownAgent } from '../../agents/roadmapBreakdownAgent';

export default function RoadmapCalendar({ growthPlan, businessInfo, refinedConcept, ideaId, externalIsEditing, externalSetIsEditing }) {
    const { language } = useLanguage();
    const { verifiedBlueprint, executeCalendarUpdate, updateRoadmapMilestonesDirect } = useWorkflow();
    
    const [isEditingCalendar, setIsEditingCalendar] = useState(false);
    const isModalOpen = externalIsEditing !== undefined ? externalIsEditing : isEditingCalendar;
    const setIsModalOpen = externalSetIsEditing || setIsEditingCalendar;
    const [editPrompt, setEditPrompt] = useState('');
    const [isRunningAgent, setIsRunningAgent] = useState(false);
    const [agentFeedback, setAgentFeedback] = useState(null);
    const [agentError, setAgentError] = useState(null);
    
    // Default launch date to today (or when the dashboard loaded)
    const [launchDate] = useState(() => {
        const key = ideaId ? `agentic:launchDate:${ideaId}` : `agentic:launchDate:default`;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(key);
            if (stored) return new Date(stored);
            const today = new Date();
            localStorage.setItem(key, today.toISOString());
            return today;
        }
        return new Date();
    });

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [completedTasks, setCompletedTasks] = useState({});
    
    // State variables for Gemini-driven breakdown
    const [roadmapBreakdown, setRoadmapBreakdown] = useState(null);
    const [loadingBreakdown, setLoadingBreakdown] = useState(false);
    const [breakdownError, setBreakdownError] = useState(null);

    // Fetch and break down 90-day roadmap with Gemini API client-side
    useEffect(() => {
        const fetchBreakdown = async () => {
            const key = ideaId ? `agentic:roadmapBreakdown:${ideaId}` : `agentic:roadmapBreakdown:default`;
            
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem(key);
                if (stored) {
                    try {
                        setRoadmapBreakdown(JSON.parse(stored));
                        return;
                    } catch (e) {
                        console.error("Failed to parse cached roadmap breakdown:", e);
                    }
                }
            }

            // Fallback to fetch from process.env variables
            const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
            
            if (!apiKey || !growthPlan) {
                return;
            }

            setLoadingBreakdown(true);
            setBreakdownError(null);
            try {
                const result = await runRoadmapBreakdownAgent(refinedConcept, businessInfo, growthPlan, apiKey, language);
                setRoadmapBreakdown(result);
                if (typeof window !== 'undefined') {
                    localStorage.setItem(key, JSON.stringify(result));
                }
            } catch (err) {
                console.error("Roadmap breakdown agent failed:", err);
                setBreakdownError(language === 'en' 
                    ? "Failed to compile detailed tasks. Please reload to try again."
                    : "လုပ်ငန်းစဉ်များ ဖန်တီးရာတွင် အမှားအယွင်းရှိနေပါသည်။ ကျေးဇူးပြု၍ ပြန်လည်လုပ်ဆောင်ပေးပါ။"
                );
            } finally {
                setLoadingBreakdown(false);
            }
        };

        fetchBreakdown();
    }, [ideaId, growthPlan, refinedConcept, businessInfo, language]);

    // Hydrate completed tasks from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const key = ideaId ? `agentic:completedTasks:${ideaId}` : `agentic:completedTasks:default`;
            const stored = localStorage.getItem(key);
            if (stored) {
                try {
                    setCompletedTasks(JSON.parse(stored));
                } catch (e) {
                    console.error("Error parsing completed tasks:", e);
                }
            }
        }
    }, [ideaId]);

    const saveCompletedTasks = (updated) => {
        setCompletedTasks(updated);
        if (typeof window !== 'undefined') {
            const key = ideaId ? `agentic:completedTasks:${ideaId}` : `agentic:completedTasks:default`;
            localStorage.setItem(key, JSON.stringify(updated));
        }
    };

    const handleRunCalendarAgent = async () => {
        if (!editPrompt.trim() || !executeCalendarUpdate) return;
        setIsRunningAgent(true);
        setAgentFeedback(null);
        setAgentError(null);

        const currentMilestones = Array.isArray(verifiedBlueprint?.actionable_roadmap_milestones) && verifiedBlueprint.actionable_roadmap_milestones.length > 0
            ? verifiedBlueprint.actionable_roadmap_milestones
            : (Array.isArray(growthPlan?.roadmap90Day || growthPlan?.roadmap_90_day)
                ? (growthPlan.roadmap90Day || growthPlan.roadmap_90_day).map((m, idx) => {
                    if (typeof m === 'object' && m.title) return m;
                    const text = typeof m === 'string' ? m : JSON.stringify(m);
                    return {
                        phase: `Phase ${idx + 1}`,
                        date: new Date(Date.now() + (idx + 1) * 30 * 86400000).toISOString().split('T')[0],
                        title: text.slice(0, 60),
                        desc: text
                    };
                })
                : [
                    { phase: "Phase 1", date: new Date().toISOString().split('T')[0], title: "Alpha Launch MVP", desc: "Initial launch testing with early cohort." },
                    { phase: "Phase 2", date: new Date(Date.now() + 30*86400000).toISOString().split('T')[0], title: "Growth & Scaling", desc: "Customer acquisition and channel scaling." },
                    { phase: "Phase 3", date: new Date(Date.now() + 60*86400000).toISOString().split('T')[0], title: "Market Expansion", desc: "Retail placement and regional scaling." }
                ]);

        try {
            const res = await executeCalendarUpdate(editPrompt, currentMilestones);
            if (res && res.success && res.updated_milestones) {
                setAgentFeedback({
                    status: 'success',
                    message: res.message,
                    toolCalled: res.tool_called,
                    milestones: res.updated_milestones
                });
                if (updateRoadmapMilestonesDirect) {
                    await updateRoadmapMilestonesDirect(res.updated_milestones);
                }
                const key = ideaId ? `agentic:roadmapBreakdown:${ideaId}` : `agentic:roadmapBreakdown:default`;
                if (typeof window !== 'undefined') localStorage.removeItem(key);
            } else {
                setAgentFeedback({
                    status: 'rejected',
                    message: res?.message || "Invalid or unrelated prompt rejected by agent.",
                    toolCalled: null
                });
            }
        } catch (err) {
            setAgentError(err.message || "An error occurred while running the Calendar Update Agent.");
        } finally {
            setIsRunningAgent(false);
        }
    };

    // Calculate days/weeks/months layout
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNamesEN = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];
    const monthNamesMY = [
        "ဇန်နဝါရီ", "ဖေဖော်ဝါရီ", "မတ်", "ဧပြီ", "မေ", "ဇွန်", 
        "ဇူလိုင်", "သြဂုတ်", "စက်တင်ဘာ", "အောက်တိုဘာ", "နိုဝင်ဘာ", "ဒီဇင်ဘာ"
    ];

    const monthName = language === 'en' ? monthNamesEN[month] : monthNamesMY[month];

    // Helper: Days in month
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    // Helper: First day of week index
    const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);

    const prevMonthDays = getDaysInMonth(year, month - 1);
    
    // Calendar days compilation
    const daysGrid = [];
    
    // Prev month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        daysGrid.push({
            day: prevMonthDays - i,
            isCurrentMonth: false,
            date: new Date(year, month - 1, prevMonthDays - i)
        });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        daysGrid.push({
            day: i,
            isCurrentMonth: true,
            date: new Date(year, month, i)
        });
    }

    // Next month padding days to fill 42 cells grid
    const totalCells = 42;
    const remainingCells = totalCells - daysGrid.length;
    for (let i = 1; i <= remainingCells; i++) {
        daysGrid.push({
            day: i,
            isCurrentMonth: false,
            date: new Date(year, month + 1, i)
        });
    }

    // Dynamic Task mapping from parsed Gemini Agent breakdown response
    const getTasksForDate = (date) => {
        const dateCopy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const launchCopy = new Date(launchDate.getFullYear(), launchDate.getMonth(), launchDate.getDate());
        
        const diffTime = dateCopy.getTime() - launchCopy.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Bounded within 90 days from launch
        if (diffDays < 0 || diffDays >= 90) return [];
        const currentDayIndex = diffDays + 1;

        // Fallback to static rule layout if Gemini agent fails, is loading, or has syntax error
        if (!roadmapBreakdown?.weeks) {
            const dayOfWeek = date.getDay();
            const isSaaS = businessInfo?.business_type?.toLowerCase().includes('saas') || 
                           businessInfo?.business_type?.toLowerCase().includes('tech') ||
                           businessInfo?.business_type?.toLowerCase().includes('software');
            const isFandB = businessInfo?.business_type?.toLowerCase().includes('food') || 
                            businessInfo?.business_type?.toLowerCase().includes('kitchen') ||
                            businessInfo?.business_type?.toLowerCase().includes('beverage');
            const isEcom = businessInfo?.business_type?.toLowerCase().includes('commerce') || 
                           businessInfo?.business_type?.toLowerCase().includes('drop') ||
                           businessInfo?.business_type?.toLowerCase().includes('retail');
            const phaseIndex = Math.floor(diffDays / 30);
            const phaseStr = growthPlan?.roadmap90Day?.[phaseIndex] || "Launch Phase";
            const tasks = [];

            if (dayOfWeek === 1) { // Monday: Weekly Sprint Planning
                tasks.push({
                    id: `task-${currentDayIndex}-1`,
                    title: language === 'en' ? `Phase ${phaseIndex + 1} Weekly Alignment` : `အဆင့် ${phaseIndex + 1} စီစဉ်ခြင်း`,
                    desc: language === 'en' 
                        ? `Align weekly objectives: "${phaseStr}". Schedule sprints and assign targets.` 
                        : `ရက်သတ္တပတ် လုပ်ငန်းစဉ် ညှိနှိုင်းခြင်း - "${phaseStr}"။ စွမ်းဆောင်ရည် ရည်မှန်းချက်များ သတ်မှတ်ပါ။`,
                    type: 'planning',
                    dayIndex: currentDayIndex
                });
            } else if (dayOfWeek === 3) { // Wednesday: Execution task
                let titleText = language === 'en' ? 'Launch Execution Step' : 'လုပ်ငန်းအကောင်အထည်ဖော်မှု';
                let descText = language === 'en' 
                    ? `Execute operations for targets in Phase ${phaseIndex + 1}: ${phaseStr}`
                    : `အဆင့် ${phaseIndex + 1} အကောင်အထည်ဖော်မှု လုပ်ငန်းများ - ${phaseStr}`;

                if (isSaaS) {
                    titleText = language === 'en' ? 'SaaS Tech Setup & Landing Page' : 'နည်းပညာစနစ်နှင့် ဝဘ်ဆိုက်ပြင်ဆင်ခြင်း';
                    descText = language === 'en'
                        ? `Configure API endpoints, verify SSL domain certificates, and deploy landing page forms.`
                        : `API စနစ်များ စမ်းသပ်ခြင်း၊ ဝဘ်ဆိုက်လုံခြုံရေးပြင်ဆင်ခြင်းနှင့် Landing Page လွှင့်တင်ခြင်း ပြုလုပ်ပါ။`;
                } else if (isFandB) {
                    titleText = language === 'en' ? 'Supply & Kitchen Setup' : 'ကုန်ကြမ်းစီစဉ်ခြင်းနှင့် မီးဖိုချောင်ပြင်ဆင်ခြင်း';
                    descText = language === 'en'
                        ? `Establish supplier agreements, organize inventory space, and check commercial equipment.`
                        : `ကုန်ကြမ်းပေးသွင်းသူများနှင့် ညှိနှိုင်းခြင်း၊ ပစ္စည်းစာရင်းစစ်ဆေးခြင်းနှင့် လုပ်ငန်းသုံးပစ္စည်းများ နေရာချခြင်း။`;
                } else if (isEcom) {
                    titleText = language === 'en' ? 'Store & Product Integration' : 'ဝဘ်ဆိုင်နှင့် ကုန်ပစ္စည်း ပေါင်းစပ်ပြင်ဆင်ခြင်း';
                    descText = language === 'en'
                        ? `Integrate payment checkout gateways, configure product catalog listings, and sync vendor portals.`
                        : `ငွေပေးချေမှုစနစ်များ ချိတ်ဆက်ခြင်း၊ ကုန်ပစ္စည်းစာရင်းတင်ခြင်းနှင့် ပို့ဆောင်ရေးစနစ်များ ချိတ်ဆက်ခြင်း။`;
                }

                tasks.push({
                    id: `task-${currentDayIndex}-3`,
                    title: titleText,
                    desc: descText,
                    type: 'execution',
                    dayIndex: currentDayIndex
                });
            } else if (dayOfWeek === 5) { // Friday: Metrics & Review
                tasks.push({
                    id: `task-${currentDayIndex}-5`,
                    title: language === 'en' ? `Performance Audit & Retro` : `ရလဒ်ဆန်းစစ်ချက် အကဲဖြတ်ခြင်း`,
                    desc: language === 'en'
                        ? `Analyze traffic logs, count new signups/sales, check budget spend constraints, and resolve roadmap bottlenecks.`
                        : `လည်ပတ်မှု ကုန်ကျစရိတ်များကို စစ်ဆေးခြင်း၊ သုံးစွဲသူအသစ်ရရှိမှု အညွှန်းကိန်းများကို ဆန်းစစ်ခြင်းနှင့် အခက်အခဲများ ဖြေရှင်းခြင်း။`,
                    type: 'review',
                    dayIndex: currentDayIndex
                });
            }
            return tasks;
        }

        const tasks = [];
        
        // Search the weeks generated by the breakdown agent
        for (const week of roadmapBreakdown.weeks) {
            if (week.tasks) {
                for (const t of week.tasks) {
                    if (Number(t.dayOffset) === currentDayIndex) {
                        tasks.push({
                            id: `task-${currentDayIndex}-${t.title}`,
                            title: t.title,
                            desc: t.desc,
                            type: t.type,
                            dayIndex: currentDayIndex
                        });
                    }
                }
            }
        }

        return tasks;
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const toggleTaskCompletion = (taskId) => {
        const updated = { ...completedTasks, [taskId]: !completedTasks[taskId] };
        saveCompletedTasks(updated);
    };

    const getTaskTypeStyles = (type) => {
        switch (type) {
            case 'planning': return { bg: 'rgba(0, 242, 254, 0.1)', border: 'rgba(0, 242, 254, 0.3)', text: '#00F2FE' };
            case 'execution': return { bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.3)', text: '#818CF8' };
            case 'review': return { bg: 'rgba(20, 184, 166, 0.1)', border: 'rgba(20, 184, 166, 0.3)', text: '#14b8a6' };
            default: return { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', text: '#fff' };
        }
    };

    // 1. Loading UI state (Gemini Agent Running)
    if (loadingBreakdown) {
        return (
            <div className="card" style={{ padding: '48px', borderRadius: '32px', backgroundColor: 'var(--color-surface-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', gap: '24px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: 'var(--elevation-card)', backdropFilter: 'blur(20px)' }}>
                <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: '3px solid rgba(0, 242, 254, 0.1)',
                    borderTopColor: '#00F2FE',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
                <div style={{ textAlign: 'center' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#F8FAFC', marginBottom: '8px', fontFamily: 'var(--typography-heading-family)' }}>
                        {language === 'en' ? "Compiling Daily Milestones..." : "ရက်စဉ်လုပ်ငန်းစဉ်များ ပြင်ဆင်နေပါသည်..."}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                        {language === 'en' ? "Gemini is building your detailed 90-day task list..." : "Gemini သည် သင့်အတွက် ရက် ၉၀ လုပ်ငန်းအသေးစိတ်များကို ဖန်တီးပေးနေပါသည်။"}
                    </p>
                </div>
            </div>
        );
    }

    // 2. Error State UI
    if (breakdownError) {
        return (
            <div className="card" style={{ padding: '32px', borderRadius: '32px', backgroundColor: 'var(--color-surface-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <AlertCircle size={36} style={{ color: '#F59E0B' }} />
                <p style={{ fontSize: '14px', color: '#F8FAFC', textAlign: 'center', margin: 0, fontWeight: 600 }}>
                    {breakdownError}
                </p>
                <button type="button" className="button-secondary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }} onClick={() => window.location.reload()}>
                    {language === 'en' ? "Retry" : "ပြန်လည်လုပ်ဆောင်ရန်"}
                </button>
            </div>
        );
    }

    // 3. Main Calendar UI
    return (
        <div style={{ width: '100%', position: 'relative' }}>
            {/* Calendar monthly grid card */}
            <div className="card calendar-card" style={{ padding: '28px', borderRadius: '32px', backgroundColor: 'var(--color-surface-medium)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                    <button type="button" className="button-secondary" style={{ padding: '6px 12px', minWidth: '40px', minHeight: '34px', borderRadius: '8px', cursor: 'pointer' }} onClick={handlePrevMonth}>
                        <ChevronLeft size={16} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: '#00F2FE', display: 'inline-flex', alignItems: 'center' }}><CalendarIcon size={20} /></span>
                        <h4 style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'var(--typography-heading-family)', color: '#F8FAFC', margin: 0 }}>
                            {monthName} {year}
                        </h4>
                    </div>
                    <button type="button" className="button-secondary" style={{ padding: '6px 12px', minWidth: '40px', minHeight: '34px', borderRadius: '8px', cursor: 'pointer' }} onClick={handleNextMonth}>
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Days of Week headers */}
                <div className="calendar-week-headers" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', textAlign: 'center', fontWeight: 700, fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px', paddingBottom: '8px' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <div key={idx}>{day}</div>
                    ))}
                </div>

                {/* Calendar Days cells grid (uniform cell heights like Google Calendar) */}
                <div className="calendar-days-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(7, 1fr)', 
                    gridAutoRows: '110px', 
                    gap: '1px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    overflow: 'hidden'
                }}>
                    {daysGrid.map((cell, idx) => {
                        const cellTasks = getTasksForDate(cell.date);
                        const hasTask = cellTasks.length > 0;
                        const allTasksDone = hasTask && cellTasks.every(t => completedTasks[t.id]);
                        
                        const isSelected = selectedDate && selectedDate.toDateString() === cell.date.toDateString();
                        const isToday = new Date().toDateString() === cell.date.toDateString();

                        return (
                            <div
                                key={idx}
                                onClick={() => setSelectedDate(cell.date)}
                                className="calendar-day-cell"
                                style={{
                                    height: '110px',
                                    padding: '10px',
                                    background: isSelected 
                                        ? 'rgba(99, 102, 241, 0.15)' 
                                        : (cell.isCurrentMonth ? '#0E131F' : '#080B11'),
                                    opacity: cell.isCurrentMonth ? 1 : 0.4,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start',
                                    alignItems: 'stretch',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ 
                                        fontSize: '12px', 
                                        fontWeight: isToday ? 900 : 500, 
                                        color: isToday ? '#080B11' : '#F8FAFC',
                                        backgroundColor: isToday ? '#00F2FE' : 'transparent',
                                        borderRadius: '50%',
                                        width: '22px',
                                        height: '22px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: isToday ? '0 0 10px rgba(0, 242, 254, 0.4)' : 'none'
                                    }}>
                                        {cell.day}
                                    </span>
                                    {hasTask && (
                                        <span style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: allTasksDone ? '#14b8a6' : '#6366F1',
                                            boxShadow: allTasksDone ? '0 0 8px #14b8a6' : '0 0 8px #6366F1'
                                        }} />
                                    )}
                                </div>

                                {/* Task badges inside cell */}
                                {hasTask && (
                                    <div className="calendar-task-badge-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden', flex: 1 }}>
                                        {cellTasks.slice(0, 2).map((t, index) => {
                                            const colors = getTaskTypeStyles(t.type);
                                            const isDone = completedTasks[t.id];
                                            return (
                                                <div 
                                                    key={index} 
                                                    style={{ 
                                                        fontSize: '9.5px', 
                                                        fontWeight: 700, 
                                                        padding: '2px 6px', 
                                                        borderRadius: '4px',
                                                        backgroundColor: colors.bg,
                                                        color: colors.text,
                                                        border: `1px solid ${colors.border}`,
                                                        textDecoration: isDone ? 'line-through' : 'none',
                                                        opacity: isDone ? 0.6 : 1,
                                                        overflow: 'hidden',
                                                        whiteSpace: 'nowrap',
                                                        textOverflow: 'ellipsis',
                                                        lineHeight: '1.2'
                                                    }}
                                                >
                                                    {t.title}
                                                </div>
                                            );
                                        })}
                                        {cellTasks.length > 2 && (
                                            <div style={{ fontSize: '8px', color: 'var(--color-text-muted)', textAlign: 'right', paddingRight: '2px' }}>
                                                +{cellTasks.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal Overlay: Selected day details popup */}
            {selectedDate && (
                <div 
                    style={{ 
                        position: 'fixed', 
                        inset: 0, 
                        backgroundColor: 'rgba(8, 11, 17, 0.7)', 
                        backdropFilter: 'blur(8px)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        zIndex: 1000 
                    }}
                    onClick={() => setSelectedDate(null)}
                >
                    <div 
                        className="card calendar-details-modal" 
                        style={{ 
                            width: '450px', 
                            maxWidth: '92%', 
                            maxHeight: '85vh', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            backgroundColor: 'rgba(20, 23, 31, 0.95)', 
                            border: '1px solid rgba(255, 255, 255, 0.1)', 
                            boxShadow: 'var(--elevation-overlay)',
                            borderRadius: '28px',
                            padding: '32px'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '16px' }}>
                            <h5 style={{ fontSize: '16px', fontWeight: 900, color: '#F8FAFC', margin: 0 }}>
                                {selectedDate.toLocaleDateString(language === 'en' ? 'en-US' : 'my-MM', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </h5>
                            <button type="button" className="button-secondary" style={{ padding: '6px 12px', minWidth: '60px', minHeight: '30px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }} onClick={() => setSelectedDate(null)}>
                                {language === 'en' ? 'Close' : 'ပိတ်ရန်'}
                            </button>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '4px' }}>
                            {(() => {
                                const dateTasks = getTasksForDate(selectedDate);
                                if (dateTasks.length === 0) {
                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', color: 'var(--color-text-muted)', textAlign: 'center', gap: '12px' }}>
                                            <AlertCircle size={32} style={{ color: 'var(--color-text-muted)' }} />
                                            <div>
                                                <p style={{ fontSize: '14px', margin: '0 0 4px 0', fontWeight: 600, color: '#F8FAFC' }}>
                                                    {language === 'en' ? "No core launch tasks scheduled." : "လုပ်ငန်းစီမံချက်များ မရှိသေးပါ။"}
                                                </p>
                                                <p style={{ fontSize: '12px', margin: 0, color: '#64748B', lineHeight: 1.4 }}>
                                                    {language === 'en' 
                                                        ? "Tasks are mapped on Mondays, Wednesdays, and Fridays relative to your launch date." 
                                                        : "လုပ်ငန်းစဉ်များကို တနင်္လာ၊ ဗုဒ္ဓဟူးနှင့် သောကြာနေ့များတွင် တွေ့ရှိနိုင်ပါသည်။"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }

                                return dateTasks.map((t, idx) => {
                                    const isDone = completedTasks[t.id];
                                    const typeColors = getTaskTypeStyles(t.type);
                                    return (
                                        <div key={idx} style={{ 
                                            backgroundColor: 'rgba(8, 11, 17, 0.6)', 
                                            padding: '16px', 
                                            borderRadius: '16px', 
                                            border: isDone ? '1px solid rgba(20, 184, 166, 0.3)' : `1px solid ${typeColors.border}`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ 
                                                    fontSize: '10px', 
                                                    fontWeight: 800, 
                                                    textTransform: 'uppercase', 
                                                    padding: '2px 6px', 
                                                    borderRadius: '4px', 
                                                    backgroundColor: typeColors.bg, 
                                                    color: typeColors.text, 
                                                    border: `1px solid ${typeColors.border}` 
                                                }}>
                                                    Day {t.dayIndex} &bull; {t.type}
                                                </span>
                                                
                                                <button 
                                                    type="button" 
                                                    onClick={() => toggleTaskCompletion(t.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: isDone ? '#14b8a6' : 'var(--color-text-light-muted)' }}
                                                >
                                                    {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                                </button>
                                            </div>

                                            <div>
                                                <h6 style={{ fontSize: '14px', fontWeight: 950, color: isDone ? 'var(--color-text-muted)' : '#F8FAFC', textDecoration: isDone ? 'line-through' : 'none', margin: '0 0 6px 0' }}>
                                                    {t.title}
                                                </h6>
                                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                                                    {t.desc}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>

                        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            <Sparkles size={13} className="text-purple-400" />
                            <span>Timeline maps relative to the proposal launch setup.</span>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Calendar Editor Modal (True Tool-Calling Agent Modal) */}
            {isModalOpen && (
                <div 
                    style={{ 
                        position: 'fixed', 
                        inset: 0, 
                        backgroundColor: 'rgba(8, 11, 17, 0.8)', 
                        backdropFilter: 'blur(10px)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        zIndex: 1100 
                    }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="card calendar-agent-modal" 
                        style={{ 
                            width: '620px', 
                            maxWidth: '94%', 
                            maxHeight: '90vh', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            backgroundColor: 'rgba(15, 19, 29, 0.98)', 
                            border: '1px solid rgba(0, 242, 254, 0.3)', 
                            boxShadow: '0 20px 60px rgba(0, 242, 254, 0.15)',
                            borderRadius: '32px',
                            padding: '32px',
                            overflowY: 'auto'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid #00F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bot size={22} color="#00F2FE" />
                                </div>
                                <div>
                                    <h5 style={{ fontSize: '17px', fontWeight: 900, color: '#F8FAFC', margin: 0 }}>
                                        {language === 'en' ? 'AI Roadmap Calendar Editor' : '🤖 AI ပြက္ခဒိန်နှင့် ရက်ချိန်း ပြင်ဆင်ရေး System'}
                                    </h5>
                                    <span style={{ fontSize: '11px', color: '#00F2FE', fontWeight: 700 }}>
                                        True Tool-Calling ReAct Agent &bull; LangChain / Gemini
                                    </span>
                                </div>
                            </div>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tool Definition Card (As requested: "ဘာ tool ကိုခေါ်မယ်ဆိုတာ define လုပ်ပေး") */}
                        <div style={{
                            background: 'rgba(99, 102, 241, 0.08)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            borderRadius: '16px',
                            padding: '16px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#818CF8', fontWeight: 800, fontSize: '13px' }}>
                                <Wrench size={16} />
                                <span>{language === 'en' ? 'Bound Tool Definition: schedule_calendar_tool' : 'အသုံးပြုမည့် AI Tool အဓိပ္ပာယ်သတ်မှတ်ချက် - schedule_calendar_tool'}</span>
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                                {language === 'en'
                                    ? 'This agent enforces strict tool calling. When you instruct dates shifts or milestone updates, the agent evaluates the prompt and invokes `schedule_calendar_tool` (`{ milestones: [...] }`) to calculate standardized YYYY-MM-DD dates, build one-click Google Calendar links, and re-sync the entire UI.'
                                    : 'ဤ Agent သည် Tool-Calling ReAct Agent အစစ်အမှန် ဖြစ်ပါသည်။ သင်၏ ညွှန်ကြားချက်ကို ဖတ်ရှုပြီး ပြက္ခဒိန်ရက်ပြောင်းလဲခြင်း (ရက်ရွှေ့ဆိုင်းခြင်း) နှင့် ဆိုင်ပါက `schedule_calendar_tool` ကို မဖြစ်မနေ ခေါ်ဆိုပြီး ရက်စွဲ (YYYY-MM-DD)၊ Google Calendar One-click Links များနှင့် ၉၀-ရက် ပြက္ခဒိန်တစ်ခုလုံးကို Auto-sync ပြုလုပ်ပေးပါမည်။'}
                            </p>
                            <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 700 }}>
                                ⚠️ {language === 'en' ? 'Strict Guardrail: Any non-calendar or unrelated instruction will be rejected instantly.' : 'သတိပြုရန် - ပြက္ခဒိန်ရက်ချိန်းနှင့် မဆိုင်သော ပြင်ပမေးခွန်းများ၊ ဟာသများ၊ ညွှန်ကြားချက်များကို Agent က လက်ခံမည် မဟုတ်ပါ။'}
                            </div>
                        </div>

                        {/* Prompt Input Area */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#F8FAFC', marginBottom: '8px' }}>
                                {language === 'en' ? 'Enter Calendar Edit Instructions:' : 'ပြက္ခဒိန် ပြင်ဆင်လိုသည့် ညွှန်ကြားချက် ထည့်သွင်းပါ -'}
                            </label>
                            <textarea
                                value={editPrompt}
                                onChange={e => setEditPrompt(e.target.value)}
                                placeholder={language === 'en' 
                                    ? 'e.g., "Shift Phase 1 Alpha Launch 2 weeks later to 2026-09-01, and reschedule Phase 2 Beta Launch to October 15th with 100 testers..."'
                                    : 'ဥပမာ - "Phase 1 Alpha Launch ရက်စွဲကို နောက် ၂ ပတ်ဆွဲဆန့်ပြီး ၂၀၂၆ စက်တင်ဘာ ၁ ရက်နေ့သို့ ရွှေ့ပေးပါ။ Phase 2 Beta Launch ကို အောက်တိုဘာ ၁၅ ရက်သို့ ပြောင်းပေးပါ။"'}
                                rows={4}
                                disabled={isRunningAgent}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '16px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#FFF',
                                    fontSize: '13.5px',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        {/* Feedback / Error display */}
                        {agentFeedback && (
                            <div style={{
                                padding: '16px',
                                borderRadius: '16px',
                                marginBottom: '20px',
                                background: agentFeedback.status === 'success' ? 'rgba(20, 184, 166, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                                border: agentFeedback.status === 'success' ? '1px solid rgba(20, 184, 166, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px'
                            }}>
                                {agentFeedback.status === 'success' ? <CheckCircle size={22} color="#14b8a6" /> : <AlertTriangle size={22} color="#f43f5e" />}
                                <div>
                                    <h6 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: 800, color: agentFeedback.status === 'success' ? '#14b8a6' : '#f43f5e' }}>
                                        {agentFeedback.status === 'success' ? '✅ Tool Executed & Calendar Saved!' : '❌ Prompt Rejected by Agent'}
                                    </h6>
                                    <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                                        {agentFeedback.message}
                                    </p>
                                    {agentFeedback.toolCalled && (
                                        <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(0, 242, 254, 0.1)', color: '#00F2FE', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                                            Tool Invoked: {agentFeedback.toolCalled}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {agentError && (
                            <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', fontSize: '13px', marginBottom: '20px' }}>
                                {agentError}
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
                            <button
                                type="button"
                                className="button-secondary"
                                onClick={() => setIsModalOpen(false)}
                                disabled={isRunningAgent}
                                style={{ padding: '10px 18px', borderRadius: '12px', fontSize: '13px' }}
                            >
                                {language === 'en' ? 'Close' : 'ပိတ်ရန်'}
                            </button>
                            <button
                                type="button"
                                className="button-primary"
                                onClick={handleRunCalendarAgent}
                                disabled={isRunningAgent || !editPrompt.trim()}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 22px',
                                    borderRadius: '12px',
                                    fontSize: '13.5px',
                                    fontWeight: 700,
                                    background: isRunningAgent ? 'var(--color-surface-medium)' : 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)',
                                    color: isRunningAgent ? 'var(--color-text-muted)' : '#080B11',
                                    border: 'none',
                                    cursor: isRunningAgent || !editPrompt.trim() ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isRunningAgent ? (
                                    <>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#080B11', animation: 'spin 1s linear infinite' }} />
                                        <span>{language === 'en' ? 'Invoking schedule_calendar_tool...' : 'AI Tool ခေါ်ပြီး တွက်ချက်နေသည်...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Bot size={16} />
                                        <span>{language === 'en' ? 'Run Calendar Agent & Save' : '🚀 Agent မောင်းနှင်ပြီး သိမ်းဆည်းရန်'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
