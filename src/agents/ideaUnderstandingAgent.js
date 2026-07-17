import { createDeepAgent } from 'deepagents/browser';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'to',
  'for',
  'of',
  'in',
  'on',
  'with',
  'is',
  'are',
  'be',
  'this',
  'that',
  'it',
  'as',
  'at',
  'by',
  'from',
  'we',
  'our',
  'you',
  'your',
]);

const ACTION_KEYWORDS = [
  'subscription',
  'pricing',
  'market',
  'customer',
  'budget',
  'revenue',
  'launch',
  'mvp',
  'pilot',
  'plan',
  'b2b',
  'b2c',
  'saas',
  'app',
  'platform',
  'service',
  'strategy',
  'distribution',
  'sales',
  'acquisition',
];

const CLARITY_HINTS = ['for', 'who', 'because', 'helps', 'solve', 'problem', 'target'];

const UNIQUENESS_HINTS = [
  'unique',
  'first',
  'differentiated',
  'niche',
  'specialized',
  'local',
  'ai-powered',
  'automation',
  'community',
  'real-time',
];

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function countMatches(tokens, dictionary) {
  return tokens.reduce((count, token) => {
    // Check exact match
    if (dictionary.includes(token)) {
      return count + 1;
    }
    // Check if plural 's' ends the token and singular matches
    if (token.endsWith('s') && dictionary.includes(token.slice(0, -1))) {
      return count + 1;
    }
    // Check if plural 'es' ends the token and singular matches
    if (token.endsWith('es') && dictionary.includes(token.slice(0, -2))) {
      return count + 1;
    }
    // Check if any keyword in the dictionary is a substring/part of the token
    const hasMatch = dictionary.some(keyword => {
      if (keyword.length > 3) {
        return token.includes(keyword) || keyword.includes(token);
      }
      return false;
    });
    if (hasMatch) {
      return count + 1;
    }
    return count;
  }, 0);
}

function hasRandomCharacterPattern(rawInput) {
  const cleaned = rawInput.trim();
  if (cleaned.length < 10) {
    return true;
  }

  // Must have at least one vowel/y character
  if (!/[aeiouy]/i.test(cleaned)) {
    return true;
  }

  const tokens = tokenize(cleaned);
  const longTokenCount = tokens.filter((token) => token.length >= 3).length;
  const meaningfulTokens = tokens.filter((token) => !STOPWORDS.has(token));

  // Catch gibberish if it doesn't have at least 1 long token or 2 meaningful tokens
  return longTokenCount < 1 || meaningfulTokens.length < 2;
}

function computeClarityScore(rawInput, tokens) {
  const sentenceCount = rawInput.split(/[.!?]/).filter((part) => part.trim().length > 0).length;
  const tokenCount = tokens.length;
  const hintCount = countMatches(tokens, CLARITY_HINTS);

  const lengthFactor = Math.min(tokenCount / 35, 1) * 35;
  const structureFactor = Math.min(sentenceCount / 2, 1) * 25;
  const hintFactor = Math.min(hintCount / 4, 1) * 25;
  const specificityFactor = Math.min(
    tokens.filter((token) => token.length > 5 && !STOPWORDS.has(token)).length / 8,
    1,
  ) * 15;

  return clampScore(lengthFactor + structureFactor + hintFactor + specificityFactor);
}

function computeActionabilityScore(tokens) {
  const actionableHits = countMatches(tokens, ACTION_KEYWORDS);
  const numericSignal = tokens.some((token) => /^\d+$/.test(token));

  const keywordFactor = Math.min(actionableHits / 6, 1) * 80;
  const numericFactor = numericSignal ? 20 : 0;

  return clampScore(keywordFactor + numericFactor);
}

function computeUniquenessScore(tokens) {
  const uniquenessHits = countMatches(tokens, UNIQUENESS_HINTS);
  const specificityHits = tokens.filter((token) => token.length >= 8 && !STOPWORDS.has(token)).length;

  const uniquenessFactor = Math.min(uniquenessHits / 3, 1) * 70;
  const specificityFactor = Math.min(specificityHits / 4, 1) * 30;

  return clampScore(uniquenessFactor + specificityFactor);
}

function buildFeedback(result) {
  if (result.is_valid) {
    return 'Strong foundation. Proceed to business information collection and provide budget, target users, and launch timeline for sharper planning outputs.';
  }

  const weaknesses = [];

  if (result.clarity_score < 50) {
    weaknesses.push('clarity');
  }

  if (result.actionability_score < 50) {
    weaknesses.push('actionability');
  }

  if (result.uniqueness_score < 50) {
    weaknesses.push('uniqueness');
  }

  if (weaknesses.length === 0) {
    weaknesses.push('specific details');
  }

  return `Please refine your idea with better ${weaknesses.join(', ')}. Include who you serve, the exact problem, why your approach is different, and how you will monetize.`;
}

function generateClarificationQuestions(result) {
  const questions = [];
  if (result.clarity_score < 50) {
    questions.push('Could you specify who your primary target audience or customer is?');
    questions.push('What specific problem does your product or service solve for them?');
  }
  if (result.actionability_score < 50) {
    questions.push('How do you plan to monetize this idea (e.g., subscription, transaction fee, ads)?');
    questions.push('What is your immediate plan or timeline to launch a minimum viable product (MVP)?');
  }
  if (result.uniqueness_score < 50) {
    questions.push('What makes your product or service unique compared to existing competitors?');
    questions.push('Are there any specific technologies or business model features that differentiate you?');
  }

  if (questions.length === 0) {
    questions.push('Could you provide more specific details about how your service will operate?');
    questions.push('What are the key benefits or value propositions for your users?');
  }
  return questions.slice(0, 3);
}

function extractStructuredIdea(rawInput) {
  const lowerStr = rawInput.toLowerCase();
  let targetAudience = '';
  let problem = '';

  const forIndex = lowerStr.indexOf(' for ');
  if (forIndex !== -1) {
    const afterFor = rawInput.substring(forIndex + 5).trim();
    const clauseEnd = afterFor.search(/[,.;]/);
    targetAudience = clauseEnd !== -1 ? afterFor.substring(0, clauseEnd).trim() : afterFor;
  }

  const helpsIndex = lowerStr.indexOf(' helps ');
  const solveIndex = lowerStr.indexOf(' solve ');
  const problemIndex = lowerStr.indexOf(' problem ');
  if (helpsIndex !== -1) {
    const afterHelps = rawInput.substring(helpsIndex + 7).trim();
    const clauseEnd = afterHelps.search(/[,.;]/);
    problem = clauseEnd !== -1 ? afterHelps.substring(0, clauseEnd).trim() : afterHelps;
  } else if (solveIndex !== -1) {
    const afterSolve = rawInput.substring(solveIndex + 7).trim();
    const clauseEnd = afterSolve.search(/[,.;]/);
    problem = clauseEnd !== -1 ? afterSolve.substring(0, clauseEnd).trim() : afterSolve;
  } else if (problemIndex !== -1) {
    const afterProblem = rawInput.substring(problemIndex + 9).trim();
    const clauseEnd = afterProblem.search(/[,.;]/);
    problem = clauseEnd !== -1 ? afterProblem.substring(0, clauseEnd).trim() : afterProblem;
  }

  return {
    concept: rawInput,
    targetAudience: targetAudience || undefined,
    problem: problem || undefined,
  };
}

export function getCompositeValidationScore(validationResult) {
  const clarity = validationResult.clarity_score ?? validationResult.clarity ?? 0;
  const actionability = validationResult.actionability_score ?? validationResult.actionability ?? 0;
  const uniqueness = validationResult.uniqueness_score ?? validationResult.uniqueness ?? 0;
  return Math.round((clarity + actionability + uniqueness) / 3);
}

export function getIdeaRouteDecision(validationResult) {
  return getCompositeValidationScore(validationResult) < 50 ? 'clarify' : 'collect-business-info';
}

export function evaluateIdea(rawIdeaInput) {
  const rawInput = (rawIdeaInput ?? '').trim();

  if (!rawInput) {
    const defaultFeedback = 'Idea is empty. Please describe your startup concept in at least 1-2 clear sentences.';
    return {
      clarity_score: 0,
      actionability_score: 0,
      uniqueness_score: 0,
      is_valid: false,
      constructive_feedback: defaultFeedback,
      score: 0,
      decision: 'clarify',
      clarity: 0,
      actionability: 0,
      uniqueness: 0,
      feedback: defaultFeedback,
      clarificationQuestions: [
        'Could you specify who your primary target audience or customer is?',
        'What specific problem does your product or service solve for them?'
      ],
      structuredIdea: { concept: '' }
    };
  }

  if (hasRandomCharacterPattern(rawInput)) {
    const gibberishFeedback = 'Input looks too short or random. Explain your target customer, core problem, and the solution you plan to offer.';
    return {
      clarity_score: 10,
      actionability_score: 10,
      uniqueness_score: 10,
      is_valid: false,
      constructive_feedback: gibberishFeedback,
      score: 10,
      decision: 'clarify',
      clarity: 10,
      actionability: 10,
      uniqueness: 10,
      feedback: gibberishFeedback,
      clarificationQuestions: [
        'Explain your target customer, core problem, and the solution you plan to offer.'
      ],
      structuredIdea: { concept: rawInput }
    };
  }

  const tokens = tokenize(rawInput);
  const clarityScore = computeClarityScore(rawInput, tokens);
  const actionabilityScore = computeActionabilityScore(tokens);
  const uniquenessScore = computeUniquenessScore(tokens);

  const compositeScore = Math.round((clarityScore + actionabilityScore + uniquenessScore) / 3);
  const isValid = compositeScore >= 50;
  const feedbackText = buildFeedback({ is_valid: isValid, clarity_score: clarityScore, actionability_score: actionabilityScore, uniqueness_score: uniquenessScore });

  const legacyResult = {
    clarity_score: clarityScore,
    actionability_score: actionabilityScore,
    uniqueness_score: uniquenessScore,
    is_valid: isValid,
    constructive_feedback: feedbackText
  };

  const decisionValue = compositeScore < 50 ? 'clarify' : (compositeScore <= 80 ? 'collect_more' : 'proceed');

  return {
    ...legacyResult,
    score: compositeScore,
    decision: decisionValue,
    clarity: clarityScore,
    actionability: actionabilityScore,
    uniqueness: uniquenessScore,
    feedback: feedbackText,
    clarificationQuestions: !isValid ? generateClarificationQuestions(legacyResult) : undefined,
    structuredIdea: extractStructuredIdea(rawInput)
  };
}

const ValidationResultSchema = {
  type: "object",
  properties: {
    clarity_score: {
      type: "integer",
      description: "Coherence score out of 100"
    },
    actionability_score: {
      type: "integer",
      description: "Viability score out of 100"
    },
    uniqueness_score: {
      type: "integer",
      description: "Differentiation score out of 100"
    },
    is_valid: {
      type: "boolean",
      description: "True if average score >= 50"
    },
    constructive_feedback: {
      type: "string",
      description: "Helpful tips for refining the idea"
    }
  },
  required: [
    "clarity_score",
    "actionability_score",
    "uniqueness_score",
    "is_valid",
    "constructive_feedback"
  ]
};

const SYSTEM_PROMPT = `You are the Idea Understanding Agent (The Gatekeeper). Your job is to analyze and validate startup ideas.
You possess and must apply the "validation-skill" (Structural validation, semantic analysis, and rating raw textual pitches to translate free-form ideas into highly structured, evaluative metrics) as defined in docs/Agents_skills/Validation/SKILL.md.

Apply the following skill execution steps:
1. Structural Validation: Check the raw pitch for required elements and overall structure (concept description, target audience, problem, solution, uniqueness).
2. Semantic Analysis: Analyze the meaning, coherence, and clarity of the content.
3. Rating: Assign scores based on clarity_score, actionability_score, and uniqueness_score.

Evaluation Criteria:
1. Clarity & Coherence (clarity_score): Is the idea easy to understand? (0-100)
2. Actionability & Relevance (actionability_score): Is the idea practical, commercial, and actionable? (0-100)
3. Competitive Uniqueness (uniqueness_score): Is there a unique selling proposition or distinct differentiator? (0-100)

CRITICAL GUARDRAIL - INPUT SANITY:
- If the raw idea is empty, vague, a joke, gibberish, a random character string (e.g., "asdfgh"), or lacks any actual business substance (e.g., "A mobile app that work like ha ha he he ho ho"), you MUST reject it.
- In such cases, score all criteria (clarity_score, actionability_score, uniqueness_score) as 0, set is_valid to false, and provide constructive_feedback explaining that the idea is too vague or random and requires concrete detail (such as who it serves, what problem it solves, and how it works).

Calculate the average of clarity_score, actionability_score, and uniqueness_score.
- If the average is >= 50, then is_valid should be true.
- If the average is < 50, then is_valid should be false.

Write constructive_feedback based on your reasoning. If the idea is invalid or weak, provide detailed, actionable, and specific feedback on how to refine it, explaining what details are missing (e.g. who they serve, the exact problem, why their approach is different, how they will monetize) and suggesting how they can address them.
Do not use a generic or hardcoded template; customize your reasoning and constructive feedback to the specific startup idea provided.`;

async function evaluateIdeaWithGemini(rawInput, apiKey) {
  const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: 'gemini-3.1-flash-lite',
    maxOutputTokens: 2048,
  });

  const agent = createDeepAgent({
    model: model,
    systemPrompt: SYSTEM_PROMPT,
    responseFormat: ValidationResultSchema,
  });

  console.log('Invoking Deep Agent...');
  const result = await agent.invoke({
    messages: [
      { role: 'user', content: `Evaluate this startup idea:\n\n"${rawInput}"` }
    ]
  });

  const parsed = result.structuredResponse;
  if (!parsed) {
    throw new Error('No structured response returned from Deep Agent');
  }

  const clarityVal = typeof parsed.clarity_score === 'number' ? parsed.clarity_score : 0;
  const actionabilityVal = typeof parsed.actionability_score === 'number' ? parsed.actionability_score : 0;
  const uniquenessVal = typeof parsed.uniqueness_score === 'number' ? parsed.uniqueness_score : 0;
  const scoreVal = Math.round((clarityVal + actionabilityVal + uniquenessVal) / 3);
  const isValid = typeof parsed.is_valid === 'boolean' ? parsed.is_valid : (scoreVal >= 50);

  const constructiveFeedback = parsed.constructive_feedback || '';

  const mappedResult = {
    // Exact schema fields from AGENT_HARNESS.md
    clarity_score: clarityVal,
    actionability_score: actionabilityVal,
    uniqueness_score: uniquenessVal,
    is_valid: isValid,
    constructive_feedback: constructiveFeedback,

    // UI rendering fields
    score: scoreVal,
    decision: scoreVal < 50 ? 'clarify' : (scoreVal <= 80 ? 'collect_more' : 'proceed'),
    clarity: clarityVal,
    actionability: actionabilityVal,
    uniqueness: uniquenessVal,
    feedback: constructiveFeedback,
    clarificationQuestions: isValid ? undefined : generateClarificationQuestions({
      clarity_score: clarityVal,
      actionability_score: actionabilityVal,
      uniqueness_score: uniquenessVal
    }),
    structuredIdea: extractStructuredIdea(rawInput),
    evaluatedBy: 'gemini'
  };

  return mappedResult;
}

export async function evaluateIdeaAsync(rawIdeaInput) {
  const rawInput = (rawIdeaInput ?? '').trim();
  const apiKey = process.env.GOOGLE_API_KEY;

  if (apiKey && apiKey.trim()) {
    try {
      console.log('Evaluating idea with Gemini Deep Agent...');
      const result = await evaluateIdeaWithGemini(rawInput, apiKey);
      console.log('Gemini Deep Agent evaluation succeeded.');
      return result;
    } catch (error) {
      console.warn('Gemini Deep Agent evaluation failed, falling back to local engine:', error.message || error);
    }
  } else {
    console.warn('No GOOGLE_API_KEY configured. Using local rules-based engine.');
  }

  // Fallback to local rule-based evaluation when no API key is present
  if (!rawInput) {
    return { ...evaluateIdea(rawInput), evaluatedBy: 'local' };
  }

  if (hasRandomCharacterPattern(rawInput)) {
    return { ...evaluateIdea(rawInput), evaluatedBy: 'local' };
  }

  await new Promise((resolve) => setTimeout(resolve, 850));
  return { ...evaluateIdea(rawIdeaInput), evaluatedBy: 'local' };
}
