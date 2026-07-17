---
name: Agentic Studio (AI-Native Sleek Dark Mode & Neon Glass)
url: https://agentic-studio.ai/
colors:
  primary: '#6366F1'
  primary-hover: '#4F46E5'
  accent: '#00F2FE'
  background: '#080B11'
  surface-light: 'rgba(255, 255, 255, 0.08)'
  surface-medium: 'rgba(20, 23, 31, 0.85)'
  surface-card: 'rgba(18, 24, 38, 0.65)'
  text-primary: '#F8FAFC'
  text-secondary: '#94A3B8'
  text-muted: '#64748B'
  text-light-muted: '#475569'
  text-inverse: '#080B11'
  link: '#818CF8'
  link-hover: '#C4B5FD'
  border-light: 'rgba(255, 255, 255, 0.08)'
  border-dark: 'rgba(255, 255, 255, 0.22)'
  border-accent: 'rgba(0, 242, 254, 0.4)'
typography:
  display:
    family: 'Plus Jakarta Sans'
    size: clamp(28px, 4.2vw, 52px)
    weight: 800
    line-height: 1.2
  heading:
    family: 'Plus Jakarta Sans'
    size: 26px
    weight: 700
    line-height: 1.25
  body:
    family: 'Inter'
    size: 15px
    weight: 400
    line-height: 1.6
  caption:
    family: 'Inter'
    size: 13px
    weight: 500
    line-height: 1.5
spacing:
  base: 4px
  scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96, 110]
radius:
  sm: 8px
  md: 12px
  lg: 24px
  xl: 28px
  full: 999px
elevation:
  navbar: '0 16px 40px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
  card: '0 24px 60px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
  hover: '0 30px 70px rgba(0, 0, 0, 0.75), 0 0 40px rgba(56, 189, 248, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
  glow: '0 0 15px rgba(139, 92, 246, 0.35)'
motion:
  duration-base: '0.35s'
  easing-standard: 'cubic-bezier(0.16, 1, 0.3, 1)'
components:
  navbar-floating:
    bg: 'rgba(20, 23, 31, 0.85)'
    border: '1px solid rgba(255, 255, 255, 0.1)'
    border-top: 'rgba(255, 255, 255, 0.22)'
    radius: '12px'
    blur: '20px'
  button-primary:
    bg: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)'
    text: '#FFFFFF'
    radius: '8px'
    padding: '7px 16px'
    border: '1px solid rgba(255, 255, 255, 0.22)'
  button-secondary:
    bg: 'rgba(255, 255, 255, 0.04)'
    text: '#E2E8F0'
    radius: '8px'
    padding: '7px 14px'
    border: '1px solid rgba(255, 255, 255, 0.15)'
  glass-panel:
    bg: 'rgba(18, 24, 38, 0.65)'
    border: '1px solid rgba(255, 255, 255, 0.08)'
    radius: '28px'
    blur: '20px'
---

# Design System Specification: AI-Native Sleek Dark Mode & Neon Glass

## 1. Visual Theme & Atmosphere
The **Agentic Workflow** design system embodies a state-of-the-art, AI-native aesthetic inspired by top tier platforms such as **pi.dev**, **Linear**, **Vercel**, and **Perplexity**. It relies on an deep space black canvas (`#080B11`), dual radial neon glow gradients (`#6366F1` indigo and `#00F2FE` cyan), and a subtle high-tech fine grid overlay (`22px x 22px`).

Typography is paired intentionally:
- **`Plus Jakarta Sans`** is used for all brand titles, hero headlines, and card headings to deliver high-impact, geometric, modern character curves (`a`, `g`, `e`).
- **`Inter`** is used for all UI text, navigation items, buttons, badges, and body descriptions to ensure crisp antialiased rendering and maximum legibility.

**Key Architectural & Visual Characteristics**
* **Floating Glass Navbar (`pi.dev` specification):** A centered floating pill bar at `top: 14px` (`z-index: 50`) with `backdrop-filter: blur(20px)`, subtle dual border lighting (`rgba(255, 255, 255, 0.22)` top border highlight), and centered uppercase navigation items (`HOME`, `DASHBOARD`).
* **Active Stripe Neon Glow:** Active navigation items display a razor-sharp bottom stripe (`::after`) in cyan (`#00F2FE`) with neon box-shadow diffusion.
* **Negative Margin Shell Integration:** The floating navbar uses `margin-bottom: -66px` so that the underlying hero section starts directly at viewport top (`y = 0`), creating an uninterrupted background gradient across the top edge.
* **Glassmorphic Cards:** Translucent panels (`rgba(18, 24, 38, 0.65)`) with `20px` background blur and reactive hover states (border illumination with `#38BDF8` and subtle elevation shift).

---

## 2. Color Palette & Tokens
All components MUST strictly consume these color tokens to maintain visual cohesion across future specialized agent rooms and dashboard pages.

### Backgrounds & Surfaces
- `background: #080B11` — Deep space dark navy/black. The foundational canvas of the entire application.
- `surface-medium: rgba(20, 23, 31, 0.85)` — Used for sticky navigation bars and floating toolbars.
- `surface-card: rgba(18, 24, 38, 0.65)` — Used for main hero panels, interactive boardroom widgets, and feature cards.
- `surface-light: rgba(255, 255, 255, 0.08)` — Used for button hover states, active list item backgrounds, and pill badges.

### Brand & Accents
- `primary: #6366F1` (Indigo Neon) — Primary accent for linear gradients, primary buttons, and radar highlights.
- `primary-hover: #4F46E5` — Interactive hover target for indigo elements.
- `accent: #00F2FE` (Cyan Neon) — High-energy accent used for active navigation underlines, financial metrics, and verification highlights.
- `gradient-metallic: linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 45%, #818CF8 80%, #38BDF8 100%)` — The signature metallic gradient applied via `-webkit-background-clip: text` to primary display headlines.

### Typography Colors
- `text-primary: #F8FAFC` — Crisp white/off-white for headings, active labels, and primary outcomes.
- `text-secondary: #94A3B8` — Slate blue-grey for navigation links, subtitles, and standard descriptions (`clamp(14.5px, 1.6vw, 16.5px)`).
- `text-muted: #64748B` — Muted slate for secondary metadata, feature card descriptions, and timestamps.
- `text-light-muted: #475569` — Disabled text and placeholder text.

### Borders & Dividers
- `border-light: rgba(255, 255, 255, 0.08)` — Standard delicate border for cards and panels.
- `border-dark: rgba(255, 255, 255, 0.22)` — Top illumination highlight for floating navigation and primary buttons.
- `border-accent: rgba(0, 242, 254, 0.4)` — Active focus ring and illuminated hover border.

---

## 3. Typography Hierarchy & Rules
The application uses two Google Fonts configured cleanly via `next/font/google`:

```css
/* Configured in root layout via CSS variables */
--font-jakarta: 'Plus Jakarta Sans', system-ui, sans-serif;
--font-inter: 'Inter', system-ui, -apple-system, sans-serif;
```

### Hierarchy Rules
1. **Display / Hero Headline (`.landing-title`)**
   - Font Family: `var(--font-jakarta)`
   - Size: `clamp(28px, 4.2vw, 52px)` (Desktop) / `26px` (Mobile)
   - Weight: `800`
   - Line-Height: `1.2`
   - Letter-Spacing: `-0.03em`
   - Note: Fixed `min-height: 80px` (`68px` on mobile) ensures stability during dynamic Typewriter animations without vertical layout shifts.
2. **Section Headings / Panel Titles (`.landing-panel-title`)**
   - Font Family: `var(--font-jakarta)`
   - Size: `26px`
   - Weight: `700`
   - Color: `#F8FAFC`
   - Letter-Spacing: `-0.02em`
3. **Subtitles & Descriptions (`.landing-copy`)**
   - Font Family: `var(--font-inter)`
   - Size: `clamp(14.5px, 1.6vw, 16.5px)`
   - Weight: `400`
   - Color: `#94A3B8`
   - Line-Height: `1.6`
   - Max-Width: `620px`
4. **Navigation Items (`.nav-link`)**
   - Font Family: `var(--font-inter)`
   - Size: `13px`
   - Weight: `600`
   - Text-Transform: `uppercase`
   - Letter-Spacing: `0.08em`
5. **Feature Card Titles & Body**
   - Title: `16px/600` (`#F1F5F9`)
   - Description: `13.5px/400` (`#64748B`), Line-Height `1.5`

---

## 4. Component Standards & Code Recipes

### Floating Glass Navbar (`pi.dev` Style)
The navigation bar MUST be rendered as a floating pill inside a full-height dark layout wrapper (`#080B11` root background when `pathname === '/'`).

```css
.navbar.navbar-dark-landing {
  position: sticky !important;
  top: 14px !important;
  z-index: 50 !important;
  width: min(100% - 48px, 960px) !important;
  margin: 14px auto -66px auto !important; /* -66px cancels vertical flow height */
  min-height: 52px !important;
  padding: 8px 20px !important;
  background: rgba(20, 23, 31, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-top-color: rgba(255, 255, 255, 0.22) !important;
  border-radius: 12px !important;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
}

/* Centered Uppercase Links */
.navbar.navbar-dark-landing .nav-center-links {
  position: absolute !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  display: flex !important;
  align-items: center !important;
  gap: clamp(14px, 2.5vw, 28px) !important;
}

.navbar.navbar-dark-landing .nav-link {
  color: #94A3B8 !important;
  font-family: var(--font-inter, 'Inter', system-ui, sans-serif) !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  padding: 6px 4px !important;
  position: relative !important;
}

.navbar.navbar-dark-landing .nav-link.active::after {
  content: "" !important;
  position: absolute !important;
  right: 0 !important;
  bottom: -4px !important;
  left: 0 !important;
  height: 2px !important;
  background: #00F2FE !important;
  box-shadow: 0 0 8px rgba(0, 242, 254, 0.8) !important;
}
```

### Primary & Secondary Auth Buttons
```css
.navbar.navbar-dark-landing .nav-auth-button.button-primary {
  background: linear-gradient(135deg, #6366F1 0%, #3B82F6 100%) !important;
  color: #FFFFFF !important;
  font-family: var(--font-inter, 'Inter', system-ui, sans-serif) !important;
  font-size: 13.5px !important;
  font-weight: 600 !important;
  padding: 7px 16px !important;
  border-radius: 8px !important;
  border: 1px solid rgba(255, 255, 255, 0.22) !important;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.35) !important;
}

.navbar.navbar-dark-landing .nav-auth-button.button-secondary {
  background: rgba(255, 255, 255, 0.04) !important;
  color: #E2E8F0 !important;
  font-family: var(--font-inter, 'Inter', system-ui, sans-serif) !important;
  font-size: 13.5px !important;
  font-weight: 500 !important;
  padding: 7px 14px !important;
  border-radius: 8px !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
}
```

### Hero Section Layout Container (`.landing-dark-theme-wrapper`)
```css
.landing-dark-theme-wrapper {
  min-height: 100vh;
  background-color: #080B11;
  background-image: 
    radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.18) 0%, rgba(8, 11, 17, 0) 70%),
    radial-gradient(circle at 85% 30%, rgba(0, 242, 254, 0.08) 0%, rgba(8, 11, 17, 0) 50%),
    linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 22px 22px, 22px 22px;
  color: #F8FAFC;
  font-family: var(--font-inter, 'Inter', system-ui, -apple-system, sans-serif);
  padding: 110px 24px 80px; /* Pulls hero container up right under navbar */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  overflow: hidden;
}
```

### WarRoom Primary CTA (`.warroom-primary-cta`)
```css
.warroom-primary-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #0D121C;
  color: #FFFFFF;
  font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
  font-size: 16.5px;
  font-weight: 700;
  padding: 16px 38px;
  border-radius: 999px;
  border: 1.5px solid rgba(0, 242, 254, 0.5);
  box-shadow: 
    0 12px 30px rgba(0, 0, 0, 0.8),
    0 0 25px rgba(0, 242, 254, 0.25),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.warroom-primary-cta:hover {
  background: #131B2A;
  border-color: #00F2FE;
  box-shadow: 
    0 20px 45px rgba(0, 0, 0, 0.9),
    0 0 40px rgba(0, 242, 254, 0.45),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
  transform: translateY(-2px) scale(1.02);
}
```

### Bottom Half: Framer Motion Node Graph (`WarRoomNodeGraph.jsx`)
The landing page replaces static feature cards and vertical chat boxes with a dynamic, highly modular **AI Node Graph** powered by `framer-motion`:
1. **Circular Agent Nodes (`5 Outer Nodes + 1 Center Core`):**
   - Market Intelligence (`#00F2FE`), Technical Architect (`#818CF8`), Brand Identity (`#A78BFA`), Financial Modeling (`#38BDF8`), Growth Strategy (`#34D399`).
   - Central Core: **WarRoom Synthesis Engine** (`#F8FAFC`).
2. **Connecting SVG Lines:**
   - Thin, light gray SVG paths (`stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.2" strokeDasharray="4 4"`) connecting outer nodes to the central WarRoom core.
3. **Continuous Data Flow Animation (`Framer Motion`):**
   - Small glowing dots (`<motion.circle filter="url(#packet-glow)" />`) continuously travel along connecting lines (`cx/cy animation with repeat: Infinity`) to simulate real-time inter-agent communication and synthesis.
4. **Active Pulsing Rings & Floating Tooltips:**
   - Concentric outer rings (`<motion.circle r={[34, 48, 34]} />`) pulse gently around each node. Hovering over any node triggers a sleek floating glass card (`.node-insight-card`) displaying real-time agent metrics (`e.g., CAC/LTV targets, TAM size, stack specs`).

---

## 5. Guidelines for Future Specialized Agents & Pages
When developing subsequent phases (e.g., **Phase 3 Dashboard**, **Live Boardroom Meeting Room**, **Idea Prompt Questionnaire**, or **Financial Modeling View**):
1. **Never Revert to Legacy White/Beige (`#1b0624` / `#aeec1d`) or Clunky Stacked Boxes:** Always inherit the `#080B11` background, clean typography (`Plus Jakarta Sans` / `Inter`), and high-tech circular `Node Graph` visualizations (`framer-motion`).
2. **Encapsulate or Extend Globally:** For application-wide screens, utilize modular components like `WarRoomNodeGraph.jsx` and `ClientShell.jsx`.
3. **Interactive Micro-animations:** Ensure interactive elements include subtle transitions (`duration: 0.3s cubic-bezier(0.16, 1, 0.3, 1)`), neon border highlights on hover (`#00F2FE` or `#38BDF8`), and continuous SVG/canvas data flow effects.