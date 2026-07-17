---
name: lean-canvas-compilation
description: Consolidates outputs from market research, finance, brand, website, and marketing agents to compile a unified, 9-box Lean Canvas in Markdown format.
---

## Overview
This skill provides a framework for integrating multiple specialized domain outputs into a structured business model using the Lean Canvas methodology. It takes the output of various upstream agents (Market Research, Finance, Branding, Website/Product, and Marketing) and compiles them into a clean, presentation-ready 9-box Lean Canvas in Markdown.

## Usage
To use this skill, feed the outputs of all active upstream agents (Market Research, Finance, Branding, Website/Product, and Marketing) into the Business Agent. The skill will perform the following actions:

1. **Information Extraction**: Read key findings (Problem, Solution, Key Metrics, Channels, Customer Segments, Cost Structure, Revenue Streams, Unique Value Proposition, Unfair Advantage) from the respective agent packages.
2. **Cross-Domain Synthesis**: Map and align the extracted data points so that the value proposition matches the customer segments, costs align with financial estimates, and channels match the marketing plan.
3. **Markdown Compilation**: Formats the compiled data into a standard 9-box Lean Canvas layout using Markdown tables and sections.

## Steps
1. **Input**: Collect and pass the following structures:
   - `market_intelligence` (Competitors, Persona targets, trends, saturation)
   - `financial_model` (Costs, pricing tiers, break-even timeline)
   - `brand_package` (Name suggestions, tagline, color palette, tone of voice)
   - `digital_presence` (Layout structure, key product features)
   - `growth_plan` (Acquisition channels, 90-day execution steps)
2. **Process**:
   - Extract the 9 core Lean Canvas boxes.
   - Populate the boxes ensuring high fidelity and alignment (e.g. Unique Value Proposition is derived from the Brand tagline/product features, Cost Structure is derived from Setup/Operating costs, etc.).
3. **Output**: Receive a structured JSON output containing the complete formatted Markdown text representing the 9-box Lean Canvas.

## Example (Conceptual)
```
Input:
- market_intelligence: target_personas = [{"name": "Busy Tech Professionals"}], trends = ["Remote-first workflow"]
- financial_model: setup_costs = [{"hardware": 1200}], pricing_tiers = [{"tier": "Pro", "price": 19}]
- brand_package: tagline = "Streamline your remote work focus in one click."
- digital_presence: key_features = ["Focus Mode Timer", "Integrations Panel"]
- growth_plan: channels = ["ProductHunt launch", "LinkedIn Content"]

Output:
{
  "lean_canvas_markdown": "# Lean Canvas\n\n| **PROBLEM** | **SOLUTION** | **UNIQUE VALUE PROP** |\n| --- | --- | --- |\n| Remote work distractions | Focus Mode Timer & Integrations Panel | Streamline your remote work focus |\n\n..."
}
```

## Pitfalls
* **Data Mismatch**: Ensure the inputs from upstream agents are fully populated before running this skill to avoid blank/uninformative Lean Canvas segments.
* **Information Overload**: Summarize dense data blocks (like comprehensive financial lists) into key takeaways (e.g. major cost categories) so the canvas remains readable.
* **Lack of Alignment**: Double-check that the marketing channels proposed match the target personas specified in the market intelligence input.
