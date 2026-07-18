# Agentic Workflow: UI Enhancement & Design System Guide

This document serves as the design system manual and enhancement guide for developers and AI agents working on the **Agentic Workflow** user interface.

---

## 1. Visual Aesthetics & Philosophy

The application's UI embodies a premium **AI-Native Sleek Dark Mode & Neon Glass** aesthetic, combined with a minimalist **Perplexity-style** structure:
* **Background & Contrast:** Always start with a deep space black canvas (`#080B11`) with subtle, fine grid lines (`22px` mesh) and radial neon glow spots (indigo/cyan) to create depth.
* **Minimalist Whitespace:** Give layouts substantial breathing room. Avoid clustered text blocks; separate panels and logical sections with ample space (`gap: 32px` or `margin-bottom: 48px`).
* **High-Contrast Bold Headings:** Use geometric, clean title fonts (e.g. `Plus Jakarta Sans`) with heavy weights (`800` or `900` / font-black) to anchor sections.
* **Rounded Glass Containers:** Use `32px` border radius (`rounded-[32px]`) for main wizard panels, metrics boxes, and dashboard cards. Backed by translucent backgrounds (`rgba(18, 24, 38, 0.65)`), background blur (`20px`), and thin top-border highlights.
* **Micro-animations & Focus:** Incorporate smooth reactive elements (scale transforms, border illumination on focus, cursor-following neon spot lighting, dynamic log scroll).

---

## 2. Core Tokens & CSS Custom Variables

Defined globally in [index.css](file:///D:/agentic/agentic/src/index.css) under `:root`. Please utilize these variables directly rather than hardcoding colors.

### Colors
* `--color-background`: `#080B11` — Foundational space canvas
* `--color-surface-light`: `rgba(255, 255, 255, 0.08)` — Button hover/badges
* `--color-surface-medium`: `rgba(20, 23, 31, 0.85)` — Navbars and sticky headers
* `--color-surface-card`: `rgba(18, 24, 38, 0.65)` — Glassmorphic cards and containers
* `--color-text-primary`: `#F8FAFC` — Clear high-contrast body/heading text
* `--color-text-secondary`: `#94A3B8` — Slate text for descriptions and labels
* `--color-text-muted`: `#64748B` — Muted slate for metadata and helper notes
* `--color-accent`: `#00F2FE` (Cyan Neon) — Highlight lines, active status indicators, and focus states
* `--color-primary`: `#6366F1` (Indigo Neon) — Brand actions, tags, and progress highlights
* `--color-border-light`: `rgba(255, 255, 255, 0.08)` — Standard delicate borders
* `--color-border-dark`: `rgba(255, 255, 255, 0.22)` — Top-border highlights for glass elements

### Typography
* `--font-jakarta`: `'Plus Jakarta Sans', system-ui, sans-serif`
* `--font-inter`: `'Inter', system-ui, sans-serif`

---

## 3. UI Component Recipes & Style Rules

### A. Perplexity-Style Glass Container
Always use these CSS properties for cards and main modules:
```css
.card-glass {
  background: rgba(18, 24, 38, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top-color: rgba(255, 255, 255, 0.22); /* Subtly reflects overhead light */
  border-radius: 32px; /* rounded-[32px] */
  padding: 40px;
  box-shadow: 
    0 24px 60px rgba(0, 0, 0, 0.65),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-glass:hover {
  border-color: rgba(0, 242, 254, 0.3); /* Subtle neon highlight on hover */
  transform: translateY(-2px);
  box-shadow: 
    0 30px 70px rgba(0, 0, 0, 0.75), 
    0 0 30px rgba(99, 102, 241, 0.08);
}
```

### B. High-Contrast Text Field Inputs
Text fields must be dark and transparent with high-focus glows:
```css
.input-text {
  background-color: rgba(255, 255, 255, 0.03) !important;
  color: #F8FAFC !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.input-text:focus {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: #00F2FE !important; /* Cyan active ring */
  box-shadow: 
    0 0 0 4px rgba(0, 242, 254, 0.15),
    0 10px 25px rgba(0, 0, 0, 0.4);
  outline: none;
}
```

### C. Active Stripe Neon Effect
Used to highlight active links, selected phases, or key metrics:
```css
.nav-link.active::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: -4px;
  left: 0;
  height: 2px;
  background: #00F2FE;
  box-shadow: 0 0 8px rgba(0, 242, 254, 0.8);
}
```

---

## 4. Multi-Language & Technical Architecture

* **Translation Discipline:** Always wrap text UI labels inside the `t()` helper from `useLanguage()` (defined in `LanguageContext.jsx`), supporting English and Myanmar translations.
* **Client-State Preservation:** Form and state parameters destructured from `useWorkflow()` (in `WorkflowContext.jsx`) sync automatically to local storage and Supabase. Keep handlers thin and let context manage asynchronous operations.
* **Component Safety:** When adding styling elements, ensure they do not truncate container height or break layout calculations (e.g. active dynamic elements must maintain appropriate min-heights).
