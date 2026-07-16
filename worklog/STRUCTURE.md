# Worklog Structure Reference

> **Quick visual guide to the worklog folder structure**

---

## 📁 Complete Structure

```
worklog/
├── README.md              # 📖 Main documentation - START HERE
├── QUICK_START.md         # 🎯 Current status & next steps
├── SUCCESS_LOG.md         # ✅ Master log of ALL completed work
├── CHECKLIST.md           # 📋 Daily workflow checklist
├── STRUCTURE.md           # 🗺️ This file - folder structure reference
│
├── phases/                # 📊 Phase-by-phase tracking
│   ├── .gitkeep           # Preserves empty directory in git
│   ├── phase-0/          # Phase 0: Scaffolding
│   │   ├── completed.md   # Tasks completed in this phase
│   │   ├── notes.md       # Technical insights & learnings
│   │   └── issues.md      # Problems & solutions encountered
│   ├── phase-1/          # Phase 1: Idea Validation
│   │   ├── completed.md
│   │   ├── notes.md
│   │   └── issues.md
│   ├── phase-2/          # Phase 2: Business Form
│   │   ├── completed.md
│   │   ├── notes.md
│   │   └── issues.md
│   ├── phase-3/          # Phase 3: Agents Setup
│   │   ├── completed.md
│   │   ├── notes.md
│   │   └── issues.md
│   ├── phase-4/          # Phase 4: Streaming UI
│   │   ├── completed.md
│   │   ├── notes.md
│   │   └── issues.md
│   ├── phase-5/          # Phase 5: Dashboard
│   │   ├── completed.md
│   │   ├── notes.md
│   │   └── issues.md
│   ├── phase-6/          # Phase 6: Refinement
│   │   ├── completed.md
│   │   ├── notes.md
│   │   └── issues.md
│   └── phase-7/          # Phase 7: Export
│       ├── completed.md
│       ├── notes.md
│       └── issues.md
│   └── phase-8/          # Phase 8: Production
│       ├── completed.md
│       ├── notes.md
│       └── issues.md
│
├── decisions/             # 🏛️ Architecture Decision Records
│   ├── .gitkeep           # Preserves empty directory in git
│   ├── ADR-001-title.md  # First architecture decision
│   ├── ADR-002-title.md  # Second architecture decision
│   └── ADR-003-title.md  # etc.
│
├── templates/             # 📄 Reusable markdown templates
│   ├── .gitkeep           # Preserves empty directory in git
│   ├── adr-template.md    # Template for ADR files
│   ├── phase-template.md  # Template for phase tracking
│   └── issue-template.md  # Template for issue logging
│
└── assets/                # 🎨 Supporting files
    └── .gitkeep           # Preserves empty directory in git
    # Future: diagrams/, screenshots/, etc.
```

---

## 🎯 File Purpose Summary

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `README.md` | How to use the worklog system | Rarely |
| `QUICK_START.md` | Current focus, next steps | Daily |
| `SUCCESS_LOG.md` | **ALL completed work** | **After EVERY task** |
| `CHECKLIST.md` | Daily workflow guide | Rarely |
| `STRUCTURE.md` | This reference file | Rarely |
| `phases/phase-N/completed.md` | Phase-specific completions | Per phase |
| `phases/phase-N/notes.md` | Technical learnings | As needed |
| `phases/phase-N/issues.md` | Problems & solutions | When issues arise |
| `decisions/ADR-XXX.md` | Architecture decisions | When major decisions made |
| `templates/*.md` | Reusable templates | Never (reference only) |

---

## 📌 Color Coding & Status Icons

| Icon | Meaning | Usage |
|------|---------|-------|
| ✅ | Complete | Completed tasks, resolved issues |
| 🚧 | In Progress | Current work |
| ❌ | Failed/Blocked | Issues, blocked tasks |
| ⏳ | Not Started | Future work |
| 🟢 | Low Severity | Issues |
| 🟡 | Medium Severity | Issues |
| 🔴 | High Severity | Issues |
| 🔴🔴 | Critical Severity | Issues |

---

## 🔍 Navigation Guide

### "I want to..."

| Goal | Where to Look | What to Do |
|------|---------------|------------|
| **Start working** | `QUICK_START.md` | Read current focus, then start |
| **See what's done** | `SUCCESS_LOG.md` | Scroll or search for entries |
| **See current phase** | `QUICK_START.md` | Check "CURRENT FOCUS" section |
| **Start a new phase** | Create `phases/phase-N/` | Copy templates, update QUICK_START |
| **Record completion** | `SUCCESS_LOG.md` | Append new entry at top |
| **Record an issue** | `phases/phase-N/issues.md` | Add issue entry |
| **Make a decision** | `decisions/ADR-XXX.md` | Create new ADR file |
| **Find past work** | `SUCCESS_LOG.md` or phase files | Search with grep |
| **Review progress** | `QUICK_START.md` + `SUCCESS_LOG.md` | Check both |

---

## 🔧 Maintenance Commands

```bash
# Create a new phase folder
mkdir -p worklog/phases/phase-3

# Create phase files from templates
cp worklog/templates/phase-template.md worklog/phases/phase-3/completed.md
cp worklog/templates/issue-template.md worklog/phases/phase-3/issues.md
touch worklog/phases/phase-3/notes.md

# Create a new ADR
cp worklog/templates/adr-template.md worklog/decisions/ADR-001-title.md
# Then edit the new file

# Search all worklog for a specific tag
grep -r "#phase-3" worklog/

# Search for all completed entries today
grep "2026-07-16.*✅" worklog/SUCCESS_LOG.md

# Count entries by phase
grep -c "#phase-0" worklog/SUCCESS_LOG.md
```

---

## 📊 Phase Reference

| Phase | Name | Duration | Folder |
|-------|------|----------|--------|
| 0 | Scaffolding | 1-2 days | `phases/phase-0/` |
| 1 | Idea Validation | 3-4 days | `phases/phase-1/` |
| 2 | Business Form | 2-3 days | `phases/phase-2/` |
| 3 | Agents Setup | 4-5 days | `phases/phase-3/` |
| 4 | Streaming UI | 3-4 days | `phases/phase-4/` |
| 5 | Dashboard | 2-3 days | `phases/phase-5/` |
| 6 | Refinement | 4-5 days | `phases/phase-6/` |
| 7 | Export | 2-3 days | `phases/phase-7/` |
| 8 | Production | 3-4 days | `phases/phase-8/` |

---

## 💡 Pro Tips

1. **Bookmark these files:**
   - Keep `QUICK_START.md` open in one tab
   - Keep `SUCCESS_LOG.md` open in another tab

2. **Use the CHECKLIST:**
   - Follow the daily checklist to build good habits

3. **Search efficiently:**
   - Use the tag system (#phase-N, #backend, #frontend, etc.)
   - Use grep to find related entries

4. **Keep it updated:**
   - Update SUCCESS_LOG.md **immediately** after completing any task
   - Don't wait until end of day - you might forget

5. **Be consistent:**
   - Follow the templates
   - Use consistent formatting
   - Include dates on everything

---

## 📝 File Templates Quick Reference

### SUCCESS_LOG.md Entry
```markdown
### [YYYY-MM-DD] [Phase N | Category] Task Description

**Status:** ✅ Complete
**Duration:** X minutes
**Files Changed:**
- `path/to/file.ext` - Description

**Commands Run:**
```bash
commands
```

**Verification:**
- [x] Test 1
- [x] Test 2

**Notes:**
- Insights

**Tags:** #phase-N #backend
```

### Issue Entry
```markdown
### [YYYY-MM-DD] [Priority] Issue Title

**Status:** ❌ Open
**Severity:** 🟡 Medium
**Category:** #bug

**Description:** Problem description

**Solution:** How it was fixed

**Resolution Date:** YYYY-MM-DD
**Resolved By:** Name
```

### ADR Entry
```markdown
# ADR-XXX: Short Title

> **Status:** ✅ Accepted
> **Date:** YYYY-MM-DD
> **Author:** Name

## 📌 Context
What problem are we solving?

## 🎯 Decision
What did we decide?

## ⚖️ Considered Alternatives
- Alternative 1: Pros/Cons
- Alternative 2: Pros/Cons

## 🏗️ Implementation
How was it implemented?
```

---

## 🎯 Remember

> **"Document as you go, or you'll regret it later."**

This worklog system is designed to be:
- **Easy to use** - Simple templates, clear structure
- **Easy to search** - Consistent tags and formatting
- **Easy to maintain** - Append-only, never edit old entries
- **Helpful for agents** - Clear structure that agents can understand

---

*Last updated: 2026-07-16*
