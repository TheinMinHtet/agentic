# Issues Log

> **Purpose:** Track problems encountered and their solutions during development.
> **Format:** Add new issues at the top, never edit existing entries.
> **Phase:** [Specify phase number]

---

## 📝 Issue Template

```markdown
### [YYYY-MM-DD] [Priority] Issue Title

**Status:** ❌ Open | 🚧 In Progress | ✅ Resolved | ⏳ On Hold
**Severity:** 🟢 Low | 🟡 Medium | 🔴 High | 🔴🔴 Critical
**Category:** #bug #blocker #question #improvement #technical-debt

**Description:**
Clear description of the problem.

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen?

**Actual Behavior:**
What actually happens?

**Environment:**
- OS: Windows/Linux/macOS
- Node version: 
- Browser: (if frontend)
- Other relevant details:

**Files Involved:**
- `path/to/file1.ext` - Description
- `path/to/file2.ext` - Description

**Error Messages/Screenshots:**
```
Error stack trace or console output
```

**Investigation:**
- What was tried
- What was learned
- Possible root causes

**Solution:**
How was it fixed? Include code snippets if helpful.

**Workaround:**
Temporary solution until proper fix is implemented.

**Related:**
- Links to ADRs, documentation, or other issues
- [ADR-001](../decisions/ADR-001-title.md)

**Resolution Date:** YYYY-MM-DD
**Resolved By:** Name or Agent ID
```

---

## 🐛 Open Issues

*(None yet - add as they arise)*

---

## ✅ Resolved Issues

### [2026-07-16] [Low] Example Issue - Template Validation

**Status:** ✅ Resolved
**Severity:** 🟢 Low
**Category:** #improvement

**Description:**
Needed to create a standard template for tracking issues across all phases.

**Solution:**
Created this issue-template.md with a comprehensive format.

**Resolution Date:** 2026-07-16
**Resolved By:** Agent

---

## 🔍 Search Tips

**Find all open issues:**
```bash
grep "❌ Open\|🚧 In Progress" worklog/phases/phase-N/issues.md
```

**Find all high/critical severity issues:**
```bash
grep "🔴" worklog/phases/phase-N/issues.md
```

**Find all bugs:**
```bash
grep "#bug" worklog/phases/phase-N/issues.md
```

---

## 📌 Best Practices for Logging Issues

1. **Be specific** - "Button doesn't work" → "Submit button on BusinessInfoPage doesn't trigger form submission"
2. **Include reproduction steps** - How can someone else see this issue?
3. **Capture error messages** - Copy the exact error text
4. **Link to related files** - Which files are involved?
5. **Document the fix** - What changed to resolve it?
6. **Mark as resolved** - Update status when fixed
7. **Use consistent formatting** - Follow the template

---

*Template: Use this format for all issue tracking files.*
