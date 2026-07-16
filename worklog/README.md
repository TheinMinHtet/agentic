# Worklog & Knowledge Base

> **Purpose:** Document completed work, decisions, and progress to avoid re-working successful paths.

---

## 📁 Structure Overview

```
worklog/
├── README.md              # This file - how to use the worklog
├── QUICK_START.md         # Get oriented fast
├── SUCCESS_LOG.md         # 🎯 Append-only record of ALL completed work
│
├── phases/                # Phase-by-phase tracking (matches IMPLEMENTATION_PLAN.md)
│   ├── phase-0/
│   │   ├── completed.md   # Completed tasks for Phase 0
│   │   ├── notes.md       # Technical notes, learnings
│   │   └── issues.md      # Problems & solutions encountered
│   ├── phase-1/
│   │   ├── completed.md
│   │   ├── notes.md
│   │   └── issues.md
│   └── ...
│
├── decisions/             # Architectural & technical decisions
│   ├── ADR-001-title.md   # Architecture Decision Records
│   └── ADR-002-title.md
│
├── assets/                # Supporting files (diagrams, screenshots)
│   └── diagrams/
│
└── templates/             # Reusable templates
    ├── adr-template.md
    └── phase-template.md
```

---

## 🎯 Quick Navigation

| File | Purpose | When to Use |
|------|---------|--------------|
| [`QUICK_START.md`](QUICK_START.md) | Get oriented | Start here if new to the project |
| [`SUCCESS_LOG.md`](SUCCESS_LOG.md) | Master completion log | **Append here after every success** |
| `phases/phase-N/completed.md` | Phase-specific completions | Track phase progress |
| `phases/phase-N/notes.md` | Technical learnings | Document insights, patterns |
| `phases/phase-N/issues.md` | Problems & fixes | Record blockers & solutions |
| `decisions/ADR-XXX.md` | Architecture decisions | Major technical choices |

---

## 📝 Usage Guidelines

### 1. **After Completing ANY Task**
   - ✅ Append to [`SUCCESS_LOG.md`](SUCCESS_LOG.md) with:
     ```markdown
     - [YYYY-MM-DD] [Phase N] Description of what was completed
       - Details
       - Files changed
       - Commands run
       - Verification steps
     ```
   
### 2. **Starting a New Phase**
   - ✅ Create phase folder if it doesn't exist
   - ✅ Copy `templates/phase-template.md` → `phases/phase-N/completed.md`
   - ✅ Update `QUICK_START.md` with current focus

### 3. **Encountering a Problem**
   - ✅ Record in `phases/phase-N/issues.md`:
     ```markdown
     ### [Problem Title]
     **Date:** YYYY-MM-DD
     **Description:** What happened
     **Solution:** How it was fixed
     **Files:** Related files
     ```

### 4. **Making a Major Decision**
   - ✅ Create new ADR in `decisions/`:
     - Copy `templates/adr-template.md`
     - Number sequentially (ADR-001, ADR-002, ...)
     - Keep decisions immutable (don't edit, supersede with new ADR if needed)

---

## 🔄 Workflow

```
Start Work → Update QUICK_START.md (current focus)
          → Work on task
          → On Success: Append to SUCCESS_LOG.md
          → On Issue: Record in phases/phase-N/issues.md
          → On Decision: Create ADR in decisions/
          → On Phase Complete: Update phase-N/completed.md
```

---

## 🏷️ Tagging System

Use these tags in your entries for easy searching:

| Tag | Meaning | Example |
|-----|---------|---------|
| `✅` | Completed | `✅ Idea validation API implemented` |
| `🚧` | In Progress | `🚧 Working on agent orchestration` |
| `❌` | Failed/Blocked | `❌ Tavily API key missing` |
| `💡` | Insight/Learning | `💡 DeepAgents needs explicit type imports` |
| `🔧` | Fix/Apply | `🔧 Applied ADR-001 pattern` |
| `📚` | Documentation | `📚 Updated DESIGN.md with new tokens` |
| `🐛` | Bug | `🐛 Fixed SSE connection leak` |
| `⚡` | Performance | `⚡ Optimized agent response parsing` |

---

## 🎯 Phase Reference

This worklog follows the **8-phase implementation plan** from [`docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md):

| Phase | Name | Duration | Focus |
|-------|------|----------|-------|
| 0 | Scaffolding | 1-2 days | Server setup, proxy config |
| 1 | Idea Validation | 3-4 days | LLM scoring, decision engine |
| 2 | Business Form | 2-3 days | 8-field questionnaire |
| 3 | Agents Setup | 4-5 days | Startup Manager + 5 subagents |
| 4 | Streaming UI | 3-4 days | SSE, agent progress UI |
| 5 | Dashboard | 2-3 days | 6-section blueprint display |
| 6 | Refinement | 4-5 days | Chat, versioning, rollback |
| 7 | Export | 2-3 days | Markdown/HTML/PDF generation |
| 8 | Production | 3-4 days | Auth, polish, Docker |

---

## 🔍 Search Tips

**Find completed work:**
```bash

grep -r "✅" worklog/
```

**Find issues:**
```bash
grep -r "❌\|🐛" worklog/
```

**Find decisions:**
```bash
ls worklog/decisions/
```

**Find phase-specific notes:**
```bash
cat worklog/phases/phase-3/notes.md
```

---

## 📌 Best Practices

1. **Always append, rarely edit** - Keep history intact
2. **Date everything** - Use `YYYY-MM-DD` format
3. **Link to files** - Reference exact file paths
4. **Include commands** - Copy-pasteable terminal commands
5. **Note verification** - How you confirmed it works
6. **Be specific** - "Fixed bug" → "Fixed SSE disconnect on page navigate"
7. **Use consistent formatting** - Follow the templates

---

## 📞 For Agents

When assisting with this project:

1. **Always check SUCCESS_LOG.md first** - See what's already done
2. **Check the current phase** in QUICK_START.md
3. **Review relevant ADRs** before making architectural changes
4. **Update SUCCESS_LOG.md** after completing any task
5. **Create/Update phase folders** when starting new phases
6. **Record issues** in the appropriate phase/issues.md

---

## 📁 File Index

- [QUICK_START.md](QUICK_START.md) - Current status & next steps
- [SUCCESS_LOG.md](SUCCESS_LOG.md) - Complete history of all work
- [phases/](phases/) - Phase-by-phase tracking
- [decisions/](decisions/) - Architecture Decision Records
- [templates/](templates/) - Reusable markdown templates

---

*Last updated: 2026-07-16*
