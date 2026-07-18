# SYSTEM WORKFLOW & ARCHITECTURE SPECIFICATION (FOR AI CODING AGENTS)

This document provides a comprehensive, end-to-end technical breakdown of the **Agentic Workflow** project (`temp-app` / `agentic`). It is specifically structured for AI coding assistants (e.g., Antigravity, Claude, Cursor, GPT-4, Gemini) to quickly understand the user interface (UI/UX) journey, state orchestration, multi-agent pipeline design, and backend database schema.

---

## 1. System Overview & Purpose

**Agentic Workflow** is a multi-agent startup blueprint generator built on **Next.js 15.5 (App Router)**. It transforms a user's raw, unstructured business idea into an enterprise-grade, 9-box Lean Canvas and comprehensive startup blueprint (Market Intelligence, Financial Model, Brand Identity, Digital Presence, and 90-Day Growth Roadmap).

* **Frontend:** React 19, Next.js 15 App Router, Tailwind CSS / Vanilla CSS (`src/App.css`), Framer Motion.
* **Orchestration & State:** React Context API (`WorkflowContext.jsx` & `AuthContext.tsx`), LocalStorage persistence, Client-side sequential & parallel orchestrator (`src/agents/orchestrator.js`).
* **AI & Agent Layer:** `@langchain/google-genai` (`ChatGoogleGenerativeAI` targeting `gemini-3.1-flash-lite`), LangChain structured output parsing (`withStructuredOutput`), dual-mode fallback logic (AI vs local heuristics), and `deepagents/browser` wrapper.
* **Backend & Database:** Supabase (`@supabase/ssr` & `@supabase/supabase-js`) for user authentication (`auth.users`) and relational storage across specialized agent tables.

---

## 2. End-to-End User Journey & UI/UX Flow

The application is organized into a linear, step-by-step wizard flow that culminates in an interactive dashboard:

```
[Step 0: Landing Page (/)]
        │
        ▼
[Step 1: Idea Prompt (/idea-prompt)] ──(Validation Score < 50)──► [Clarification / Auto-Refine Loop]
        │
        ▼ (Score >= 50)
[Step 2: Business Questionnaire (/business-info)] ──► (Inserts `ideas` table in Supabase)
        │
        ▼
[Step 3: Sequential Planning (/planning)] ──► (Refinement Agent ➔ Market Research Agent)
        │
        ▼
[Step 4: Specialized Planning (/specialized-agents)] ──► (Parallel: Finance, Brand, Website, Marketing)
        │                                                     ▼
        │                                              (Synthesis: Business Plan / Lean Canvas Agent)
        ▼
[Step 5: Dashboard & Blueprint Studio (/dashboard)] ──► [Interactive Refinement Chat (/dashboard/refinement)]
```

### Step 0: Landing Page (`src/app/page.jsx`)
* **Visual Theme:** High-contrast dark mode (`#0c0513`), glowing cyan/purple gradients (`#00F2FE`, `#A78BFA`), glassmorphism, typewriter terminal effects.
* **User Action:** Explores features and clicks **"Start Generating Free"** or **"Launch Blueprint Studio"**, redirecting to `/idea-prompt`.

### Step 1: Idea Prompt & Gatekeeper Validation (`src/app/idea-prompt/page.jsx`)
* **User Action:** Enters a raw startup concept/pitch (or selects a pre-defined example prompt) into a text area and submits for validation.
* **Agent Trigger:** Invokes `evaluateIdeaAsync(rawIdea)` (`src/agents/ideaUnderstandingAgent.js`).
* **Validation Criteria:** Evaluates **Clarity** (0-100), **Actionability** (0-100), and **Uniqueness** (0-100).
* **Routing Decision:**
  * **If Composite Score >= 50 (`is_valid: true`):** The idea is saved to `WorkflowContext` (`updateStartupIdea`), and the user is routed to Step 2 (`/business-info`).
  * **If Composite Score < 50 (`is_valid: false`):** The UI displays constructive weaknesses (`constructive_feedback`) and up to 3 targeted clarification questions (`clarificationQuestions`). The user can manually edit or trigger `autoRefineIdeaAsync()` (`src/agents/autoRefineAgent.js`) to automatically expand and rewrite the pitch before proceeding.

### Step 2: Business Information Collection (`src/app/business-info/page.jsx`)
* **User Action:** Fills out a 9-field Business Context Questionnaire:
  1. `title` (Idea Name)
  2. `business_type` (e.g., SaaS, E-commerce, Agency)
  3. `goal` (Local, Global, Scalable)
  4. `target_customers` (e.g., NPOs, B2B, Students)
  5. `revenue_stream` (e.g., Subscription, One-time, Ads)
  6. `location` (e.g., Online-only, Physical, Hybrid)
  7. `budget` (Initial setup budget, e.g., `$1000`)
  8. `experience_level` (Beginner, Intermediate, Expert)
  9. `launch_timeline` (e.g., 3 months) and `core_painpoint` (Exact problem solved).
* **Backend Action:**
  * Verifies active authenticated session via `useAuth()`.
  * Inserts a record into the Supabase `ideas` table (`status: 'processing'`).
  * Calls `updateCurrentIdeaId(savedIdea.id)` and `updateBusinessInfo(formData)` on `WorkflowContext`.
  * Routes to `/planning`.

### Step 3: Sequential Planning (`src/app/planning/page.jsx`)
* **Visual Theme:** Renders `WarRoomNodeGraph.jsx` (`AI WarRoom Orchestrator / Real-time Consensus Protocol`) showcasing nodes connecting to a central consensus core.
* **Orchestration:** Calls `runSequentialPlanning()` inside `WorkflowContext.jsx`:
  1. **Refinement Agent (`runRefinementAgent`):** Synthesizes raw pitch + questionnaire into `refinedConcept` (Concept summary, one-sentence improved summary, 3 key differentiators, refined target audience). Persists to `agent_refinements` table.
  2. **Market Research Agent (`runMarketResearchAgent`):** Takes `refinedConcept` + `businessInfo` to compute `tam`, `saturation_level` (0-100%), `competitors` (3 mapped domains/weaknesses), `opportunities`, `target_personas` (2 detailed ICPs), and a full `markdown_deliverable`. Persists to `agent_market_research` table.
* **Transition:** Upon sequential completion, updates active step and routes to `/specialized-agents`.

### Step 4: Parallel Specialized Planning & Synthesis (`src/app/specialized-agents/page.jsx`)
* **Visual Theme:** Displays real-time parallel progress bars and live thinking logs (`agentThinking`) across specialized execution units.
* **Orchestration:** Calls `runParallelSpecializedPlanning()` inside `WorkflowContext.jsx`:
  * **Parallel Phase (`Promise.all`):**
    1. **Finance Agent (`runFinanceAgent`):** Computes `costBreakdown` (itemized expenses bounded by user budget), `revenueForecast`, `pricingStrategy`, `breakevenMonth`, and `markdown_deliverable`. Persists to `agent_finance_models`.
    2. **Brand Agent (`runBrandAgent`):** Generates 5 `names`, `tagline`, `voice`, `palette` (`#HEX` tokens for primary/secondary/background), `logoConcept`, and `markdown_deliverable`. Persists to `agent_brand_packages`.
    3. **Website Agent (`runWebsiteAgent`):** Drafts `landingPageOutline` (Hero, Features, Pricing copy), `features` (core capabilities), `stack` (tech stack recommendations), and `markdown_deliverable`. Persists to `agent_digital_presence`.
    4. **Marketing Agent (`runMarketingAgent`):** Formulates `channels`, `acquisitionPlan`, `roadmap90Day` (3-phase launch schedule), and `markdown_deliverable`. Persists to `agent_growth_plans`.
  * **Synthesis Phase (Integrator):**
    5. **Business Plan Agent (`runBusinessAgent`):** Receives the outputs of all 6 prior agents and compiles a unified, 9-box Lean Canvas document (`lean_canvas_markdown`). Persists to `agent_business_plans`.
* **Transition:** Routes to `/dashboard`.

### Step 5: Dashboard & Blueprint Studio (`src/app/dashboard/page.jsx` & `/dashboard/refinement`)
* **UI Structure:**
  * **Header Metric Ribbon:** Displays live TAM, Saturation Level, Breakeven Timeline, and Primary Brand Color badge.
  * **Navigation Tabs:**
    * `lean_canvas`: Interactive 9-box grid (Problem, Solution, UVP, Unfair Advantage, Customer Segments, Channels, Key Metrics, Cost Structure, Revenue Streams).
    * `market`: Market Intelligence Report & Persona cards.
    * `finance`: Financial Model tables & cost charts.
    * `brand`: Brand style guide, color swatches, and name suggestions.
    * `website`: Landing page layout & tech stack specifications.
    * `growth`: 90-Day marketing roadmap.
* **Interactive Refinement Chat (`/dashboard/refinement` / `executeRefinementChat`):**
  * Allows the user to send natural language feedback (e.g., *"Change our pricing to $29/month and target academic labs instead"*).
  * Invokes `runRefinementChatAgent(userMessage, currentBlueprint, businessInfo, apiKey)`.
  * The agent selectively returns updated JSON objects (`updated_financeModel`, `updated_marketResearch`, etc.).
  * `WorkflowContext` updates state locally and automatically re-runs `runBusinessAgent` to regenerate the Lean Canvas.

---

## 3. Agent Implementation & Architectural Design

All agent logic resides in `src/agents/`. When modifying or adding agents, adhere to the following architectural patterns:

### A. Role-Based Structured LLM Chains vs. Autonomous Tool Agents
* Currently, all agents in `src/agents/` operate as **Role-Based Structured LLM Chains**. They use `@langchain/google-genai` with `model.withStructuredOutput(Schema)` to guarantee strict JSON schema adherence without manual parsing errors.
* **Why called "Agents":** Each module is assigned a distinct domain persona, system prompt, guardrails, and explicit responsibility within a coordinated multi-agent pipeline (`orchestrator.js`).
* **Future Tool Calling (`bindTools` / `deepagents`):** The project includes dependencies (`deepagents: ^1.11.0`, `@langchain/langgraph: ^1.4.8`) to allow upgrading these chains into true autonomous agents equipped with tools (e.g., `GoogleSearchTool` for live competitor scraping, `PythonCodeEngine` for exact math in `financeAgent`, `DomainCheckTool` in `brandAgent`).

### B. Agent Directory Roster (`src/agents/`)
| File Name | Exported Function | Primary Responsibilities & Key Guardrails |
| :--- | :--- | :--- |
| `ideaUnderstandingAgent.js` | `evaluateIdeaAsync(rawIdea)` | **The Gatekeeper.** Dual-mode: uses Gemini when `GOOGLE_API_KEY` is present; falls back to local heuristic token math (`computeClarityScore`, etc.) if offline or unconfigured. Rejects random gibberish. |
| `autoRefineAgent.js` | `autoRefineIdeaAsync(rawIdea, questions)` | Uses `createDeepAgent` (`deepagents/browser`) to automatically expand vague ideas into structured 2-3 sentence pitches addressing target audience, problem, and solution. |
| `refinementAgent.js` | `runRefinementAgent(rawIdea, businessInfo, apiKey)` | Synthesizes pitch + questionnaire into `RefinedConceptSchema`. Outputs `concept`, `improved_summary`, 3 `key_differentiators`, and `target_audience_refined`. |
| `marketResearchAgent.js` | `runMarketResearchAgent(refinedConcept, businessInfo, apiKey)` | Computes `MarketIntelligenceSchema`. Guardrail: Must use *"Not Publicly Available"* for unknown competitor domains rather than hallucinating URLs. Saturation bounded 0-100. |
| `financeAgent.js` | `runFinanceAgent(refinedConcept, businessInfo, marketResearch, apiKey)` | Computes `FinancialModelSchema`. Guardrail: All numbers strictly positive. Total itemized startup costs must align within the user's declared `budget` limit. |
| `brandAgent.js` | `runBrandAgent(refinedConcept, businessInfo, apiKey)` | Computes `BrandPackageSchema`. Outputs 5 candidate `names`, `tagline`, `voice`, `logoConcept`, and `palette` with valid `#HEX` codes. |
| `websiteAgent.js` | `runWebsiteAgent(refinedConcept, businessInfo, brandPackage, apiKey)` | Computes `DigitalPresenceSchema`. Outputs `landingPageOutline` (Hero, Features, Pricing sections), core `features`, and recommended `stack`. |
| `marketingAgent.js` | `runMarketingAgent(refinedConcept, businessInfo, marketResearch, apiKey)` | Computes `GrowthPlanSchema`. Outputs acquisition `channels`, `acquisitionPlan`, and a structured `roadmap90Day` array. |
| `businessAgent.js` | `runBusinessAgent(refinedConcept, marketResearch, financeModel, brandPackage, digitalPresence, growthPlan, apiKey)` | **The Master Integrator.** Synthesizes all 6 domain deliverables into `BusinessPlanSchema` containing a complete 9-box `lean_canvas_markdown` document. |
| `refinementChatAgent.js` | `runRefinementChatAgent(userMessage, currentBlueprint, businessInfo, apiKey)` | Processes natural language user edits against `currentBlueprint`. Returns partial updates to any sub-model (`updated_financeModel`, `updated_brandPackage`, etc.) along with a conversational `reply_message`. |

---

## 4. State Management & Data Flow (`WorkflowContext.jsx`)

`WorkflowContext` (`src/app/context/WorkflowContext.jsx`) serves as the single source of truth for the active session.

### Core State Variables
* **Inputs & Identifiers:** `rawUserIdea` (string), `validationResult` (object), `businessInfo` (object), `currentIdeaId` (UUID string mapped to Supabase `ideas.id`).
* **Agent Outputs:** `refinedConcept`, `marketResearch`, `financeModel`, `brandPackage`, `digitalPresence`, `growthPlan`, `businessPlan`.
* **Telemetry & UI Progress:**
  * `activeStep`: `'idea' | 'business-info' | 'planning' | 'specialized-agents' | 'dashboard'`
  * `agentProgress`: Object mapping keys (`refinement`, `market`, `finance`, `brand`, `website`, `marketing`, `business`) to `'idle' | 'running' | 'completed' | 'failed'`.
  * `agentThinking`: Object containing arrays of timestamped thinking logs for real-time UI display.

### Hydration & LocalStorage Keys
To prevent data loss on browser refresh, `WorkflowContext` syncs critical state to `localStorage`:
* `'agentic:startupIdea'` ➔ `rawUserIdea`
* `'agentic:businessInfo'` ➔ `businessInfo`
* `'agentic:currentIdeaId'` ➔ `currentIdeaId`
* `'agentic:isAuthenticated'` ➔ Forced to `'true'` during workflow execution.

---

## 5. Supabase Database Schema & Persistence

When an authenticated user generates a blueprint, all agent deliverables are persisted to Supabase via `persistAgentOutput(table, output, mapOutput)` in `WorkflowContext.jsx`.

### Relational Schema Diagram
All specialized tables link back to `ideas.id` (`idea_id`) and `auth.users.id` (`user_id`).

```
+-----------------------------------------------------------------------+
| ideas                                                                 |
|-----------------------------------------------------------------------|
| id (UUID, PK) | user_id (UUID, FK) | title | budget | location |      |
| target_customers | business_type | status ('processing'/'completed')  |
+-----------------------------------------------------------------------+
        │ 1:N
        ├─────────────────────────────┬─────────────────────────────┐
        ▼                             ▼                             ▼
+-----------------------+     +-----------------------+     +-----------------------+
| agent_refinements     |     | agent_market_research |     | agent_finance_models  |
|-----------------------|     |-----------------------|     |-----------------------|
| idea_id (FK)          |     | idea_id (FK)          |     | idea_id (FK)          |
| user_id (FK)          |     | user_id (FK)          |     | user_id (FK)          |
| thinking              |     | tam                   |     | cost_breakdown (JSON) |
| concept               |     | improved_summary      |     | saturation_level      |     | revenue_forecast      |
| key_differentiators   |     | competitors (JSON)    |     | pricing_strategy      |
| target_audience_refined|    | opportunities (JSON)  |     | breakeven_month       |
| raw_output (JSON)     |     | target_personas (JSON)|     | markdown_deliverable  |
+-----------------------+     | markdown_deliverable  |     | raw_output (JSON)     |
                              +-----------------------+     +-----------------------+
        │                             │                             │
        ├─────────────────────────────┼─────────────────────────────┘
        ▼                             ▼
+-----------------------+     +-----------------------+     +-----------------------+
| agent_brand_packages  |     | agent_digital_presence|     | agent_growth_plans    |
|-----------------------|     |-----------------------|     |-----------------------|
| idea_id (FK)          |     | idea_id (FK)          |     | idea_id (FK)          |
| names (JSON)          |     | landing_page_outline  |     | channels (JSON)       |
| tagline               |     | features (JSON)       |     | acquisition_plan      |
| voice                 |     | stack (JSON)          |     | roadmap_90_day (JSON) |
| palette (JSON)        |     | markdown_deliverable  |     | markdown_deliverable  |
| logo_concept          |     | raw_output (JSON)     |     | raw_output (JSON)     |
+-----------------------+     +-----------------------+     +-----------------------+
                                      │
                                      ▼
                              +-----------------------+
                              | agent_business_plans  |
                              |-----------------------|
                              | idea_id (FK)          |
                              | user_id (FK)          |
                              | thinking              |
                              | lean_canvas_markdown  |
                              | raw_output (JSON)     |
                              +-----------------------+
```

---

## 6. Guidelines for AI Coding Agents Modifying This Codebase

When pair programming or executing automated edits on `temp-app` (`agentic`), adhere strictly to these rules:

1. **Prioritize Specific Tooling Over Shell Commands:**
   * Never execute `cat` or `echo` via `run_command` to inspect or write files. Always use `view_file`, `replace_file_content`, or `write_to_file`.
   * Use `grep_search` instead of running `grep` or `find` in terminal commands.
2. **Preserve Dual-Mode Fallbacks (`ideaUnderstandingAgent.js`):**
   * Do not remove local heuristic/rule-based fallback scoring functions (`tokenize`, `computeClarityScore`). They guarantee offline reliability when `GOOGLE_API_KEY` is missing or when rate limits trigger.
3. **Structured Output Guardrails:**
   * Whenever adding or modifying an agent prompt in `src/agents/`, ensure that a matching Zod or JSON Schema (`*Schema`) is defined and passed to `model.withStructuredOutput(Schema)`. Never rely on unparsed markdown text inside execution loops.
4. **Context Destructuring Discipline (`WorkflowContext.jsx`):**
   * When creating new pages or components that consume `useWorkflow()`, explicitly verify that every function or state property invoked (e.g., `updateCurrentIdeaId`, `setActiveStep`) is destructured on import to avoid `ReferenceError` exceptions.
5. **UI Aesthetics & Styling (`src/App.css`):**
   * Maintain the established rich visual identity: vibrant neon gradients (`#00F2FE`, `#A78BFA`), modern typography (`var(--typography-heading-family)`), dark mode backgrounds (`#0c0513`), and subtle micro-animations (`framer-motion`). Do not degrade layouts into generic or unstyled structure.
