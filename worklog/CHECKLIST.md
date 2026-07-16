# Daily Work Checklist

> **Purpose:** A quick reference for what to do before, during, and after working on the project.

---

## ⏰ START OF DAY

- [ ] ✅ Check [`QUICK_START.md`](QUICK_START.md) for current focus
- [ ] ✅ Review [`SUCCESS_LOG.md`](SUCCESS_LOG.md) - what was completed yesterday?
- [ ] ✅ Read phase-specific files if in middle of a phase
- [ ] ✅ Check for open issues in current phase folder
- [ ] ✅ Update QUICK_START.md with today's goals

---

## 🎯 BEFORE STARTING A TASK

- [ ] ✅ Understand the task from IMPLEMENTATION_PLAN.md
- [ ] ✅ Check if it's already done (search SUCCESS_LOG.md)
- [ ] ✅ Review relevant ADRs in decisions/
- [ ] ✅ Check for related issues in phase issues.md
- [ ] ✅ Identify files that need to be changed

---

## 🚀 DURING DEVELOPMENT

- [ ] ✅ Follow DESIGN.md for all UI work
- [ ] ✅ Follow AGENT.md guidelines
- [ ] ✅ Use consistent code patterns from existing files
- [ ] ✅ Test as you go (manual testing at minimum)
- [ ] ✅ If encountering an issue, record it in phase-N/issues.md

---

## ✅ AFTER COMPLETING A TASK

**This is the most important part - document your success!**

- [ ] ✅ **Append to SUCCESS_LOG.md** (most important!)
  ```markdown
  ### [YYYY-MM-DD] [Phase N | Category] Task Description
  
  **Status:** ✅ Complete
  **Duration:** X minutes
  **Files Changed:**
  - `path/to/file.ext` - What changed
  
  **Commands Run:**
  ```bash
  commands here
  ```
  
  **Verification:**
  - [x] Test passed
  
  **Notes:**
  - Important insights
  
  **Tags:** #phase-N #backend #frontend
  ```

- [ ] ✅ Update phase-N/completed.md if applicable
- [ ] ✅ Update QUICK_START.md if phase status changed
- [ ] ✅ Create ADR if a major architectural decision was made
- [ ] ✅ Commit changes with descriptive message

---

## 📝 END OF DAY

- [ ] ✅ Update QUICK_START.md with tomorrow's focus
- [ ] ✅ Review SUCCESS_LOG.md - all tasks documented?
- [ ] ✅ Check all phase folders have proper documentation
- [ ] ✅ Verify no tasks were forgotten

---

## 🎯 WEEKLY REVIEW

- [ ] ✅ Review all entries in SUCCESS_LOG.md
- [ ] ✅ Check phase progress against IMPLEMENTATION_PLAN.md
- [ ] ✅ Resolve any open issues or document as blockers
- [ ] ✅ Review ADRs for consistency
- [ ] ✅ Clean up and organize worklog files

---

## 💡 PRO TIPS

### Quick Commands

```bash
# Search for completed work on a specific phase
grep "#phase-3" worklog/SUCCESS_LOG.md

# Find all backend work
grep "#backend" worklog/SUCCESS_LOG.md

# See what was done today
grep "2026-07-16" worklog/SUCCESS_LOG.md

# Check current phase status
cat worklog/QUICK_START.md | grep -A 5 "CURRENT FOCUS"

# List all decisions made
ls worklog/decisions/

# Check for open issues in current phase
cat worklog/phases/phase-3/issues.md | grep "❌ Open"
```

### Documentation Order of Importance

1. **SUCCESS_LOG.md** - ALWAYS update after every task
2. **QUICK_START.md** - Update when focus changes
3. **phase-N/completed.md** - Update when phase tasks complete
4. **phase-N/issues.md** - Update when encountering problems
5. **decisions/ADR-XXX.md** - Create for major architectural decisions
6. **phase-N/notes.md** - Update with technical insights

---

## ❓ FAQ

### Q: What if I forget to document something?
A: Add it to SUCCESS_LOG.md as soon as you remember. It's better late than never!

### Q: Should I edit old entries?
A: No! Never edit existing entries - only append new ones. This preserves history.

### Q: What if a task spans multiple days?
A: Create one entry when it's complete. Optionally, add progress notes in phase-N/notes.md.

### Q: What if I encounter a blocking issue?
A: Document it in phase-N/issues.md with status "❌ Open" and include as much detail as possible.

### Q: How detailed should my entries be?
A: Be specific enough that you or another agent could reproduce or understand what was done. Include:
- What was changed
- Why it was changed
- How it was verified
- Any gotchas or lessons learned

### Q: Should I document failed attempts?
A: Yes! Document them in phase-N/issues.md or phase-N/notes.md. This prevents repeating the same mistakes.

---

## 📌 Remember

> **"If it's not in SUCCESS_LOG.md, it didn't happen."**

Documenting your work saves time in the long run and helps agents (and your future self) avoid re-working successful paths.

---

*Last updated: 2026-07-16*
