---
name: validation-skill
description: Structural validation, semantic analysis, and rating raw textual pitches. It translates free-form ideas into highly structured, evaluative metrics.
---

## Overview
This skill provides a framework for robust validation and analysis of raw textual pitches, transforming unstructured ideas into a set of evaluative metrics. It focuses on structural integrity, semantic coherence, and comprehensive rating to ensure high-quality and actionable insights.

## Usage
To use this skill, invoke it with a textual pitch as input. The skill will perform the following high-level steps:

1.  **Structural Validation**: Checks the input pitch for required elements and overall structure.
2.  **Semantic Analysis**: Analyzes the meaning and coherence of the content.
3.  **Rating**: Assigns scores based on predefined evaluative metrics.

## Steps
1.  **Input**: Provide the raw textual pitch to the skill.
2.  **Process**: The skill will internally perform structural validation, semantic analysis, and rating.
3.  **Output**: Receive a structured output containing validation results, semantic insights, and quantitative ratings.

## Example (Conceptual)
```
Input: "My idea is a social network for pets. It connects owners and helps them find playdates for their animals. It's unique because it uses AI to suggest compatible pet personalities."

Output:
{
  "validation": {
    "structural_integrity": "Pass",
    "required_elements_present": ["idea_description", "problem_statement", "solution_overview", "unique_selling_proposition"],
    "missing_elements": []
  },
  "semantic_analysis": {
    "clarity": "High",
    "coherence": "High",
    "keywords": ["social network", "pets", "playdates", "AI", "compatible personalities"]
  },
  "rating": {
    "innovation_score": 8,
    "market_potential_score": 7,
    "feasibility_score": 6,
    "overall_score": 7
  }
}
```

## Pitfalls
*   **Ambiguous Inputs**: The quality of the output heavily depends on the clarity and completeness of the input pitch. Vague or overly short pitches may lead to less accurate analysis.
*   **Metric Definition**: The underlying evaluative metrics need to be well-defined and adjusted to the specific context of the pitches being analyzed.
*   **Scalability**: For very large volumes of pitches, consider optimizing the semantic analysis component for performance.
