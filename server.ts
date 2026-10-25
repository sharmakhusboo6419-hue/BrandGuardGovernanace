import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI SDK if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Default Brand Guidelines & Approved Fact Base
const BRAND_KNOWLEDGE_BASE = `
Brand: Aegis Enterprise Technologies
Brand Positioning: "Dependable, human-guided enterprise intelligence for modern operations."
Approved Pillars:
1. Security & Sovereignty: Enterprise data remains private, verifiable, and customer-owned.
2. Human-in-the-Loop Governance: Automation augments human judgment without replacing accountability.
3. Radical Transparency & Truthfulness: No unsubstantiated superlatives; every claim backed by verified metrics.
4. Inclusive Accessibility: High contrast, jargon-conscious, WCAG AAA-first design principles.

Terminology & Nomenclature:
- DO USE: "Aegis Nexus Platform", "Aegis Sentinel™", "Verified Trust Protocol", "Human-Governed Workflow", "Enterprise Guardrails"
- DO NOT USE (Deprecated/Banned): "Aegis OldCore", "Magic AI", "Fully Autonomous Brain", "SyncTool", "Blackbox", "Foolproof Engine", "Hack-proof"
- TRADEMARK RULES: Always affix ™ to "Aegis Sentinel™" on first mention in any press release or landing page.

Forbidden Promotional Claims (Unsubstantiated):
- "100% bug-free", "100% unhackable", "zero human error possible", "infinitely scalable"
- "the undisputed #1 in the universe", "crushes legacy rivals", "revolutionary miraculous results"
- Claims of cost reduction (e.g., "slashes costs by 80%") MUST specify: "based on internal benchmarks across enterprise deployments with 10k+ nodes".

Tone & Voice Guidelines:
- Primary tone: Authoritative, considerate, precise, grounded.
- Avoid: Hyperbolic tech-hype, condescending technical gatekeeping, alarmist fear-mongering.

Visual Consistency Guidelines:
- Primary Brand Navy: #0F172A
- Brand Cobalt Blue: #2563EB
- Verification Teal: #0D9488
- Warning Amber: #D97706
- High Contrast text on dark/light backgrounds (minimum 4.5:1 ratio).
- Visual assets require clear descriptive alt-text, no stock clichés, clean margin safety around brand logo.
`;

// Helper: Rule-based heuristic fallback if AI key is missing or calls fail
function runDeterministicAudit(content: {
  title: string;
  format: string;
  text: string;
  visualAssets?: Array<{ id: string; name: string; altText?: string; colorPalette?: string[] }>;
  confidentialMode?: boolean;
}) {
  const issues: Array<{
    id: string;
    category: 'tone' | 'terminology' | 'messaging' | 'unsupported_claims' | 'accessibility' | 'visual_consistency' | 'confidentiality';
    severity: 'critical' | 'warning' | 'suggestion';
    headline: string;
    flaggedText: string;
    explanation: string;
    suggestedReplacement: string;
    brandRuleReference: string;
    applied?: boolean;
  }> = [];

  const text = content.text;

  // 1. Unsupported Claims & Superlatives
  const claimPatterns = [
    { regex: /100%\s*(bug-free|unhackable|uptime|secure|foolproof)/gi, rep: 'enterprise-grade reliability with 99.99% tested availability', ref: 'Claim Guideline #4.1: Absolute claims strictly prohibited' },
    { regex: /crushes\s+(all\s+)?competitors/gi, rep: 'outperforms conventional benchmark baselines', ref: 'Tone Guideline #2.3: Respectful comparative positioning' },
    { regex: /revolutionary\s+(miraculous|breakthrough\s+magic)/gi, rep: 'significant advancement in governance engineering', ref: 'Tone Guideline #1.2: Avoid hyperbole and empty superlatives' },
    { regex: /guaranteed\s+(zero\s+errors|perfection)/gi, rep: 'engineered for continuous error reduction through active human review', ref: 'Claim Guideline #4.2: Guarantee liability standards' },
    { regex: /slashes\s+costs\s+by\s+80%/gi, rep: 'can reduce compliance cycle times by up to 40% in audited multi-team pilots', ref: 'Fact Vault #8: Validated cost & efficiency claims' }
  ];

  claimPatterns.forEach((p, idx) => {
    const match = text.match(p.regex);
    if (match) {
      issues.push({
        id: `det-claim-${idx}`,
        category: 'unsupported_claims',
        severity: 'critical',
        headline: `Unsubstantiated promotional claim: "${match[0]}"`,
        flaggedText: match[0],
        explanation: 'Absolute claims like guarantees and unsubstantiated percentage cuts violate regulatory standards and create brand liability without cited audited data.',
        suggestedReplacement: p.rep,
        brandRuleReference: p.ref,
        applied: false,
      });
    }
  });

  // 2. Terminology & Deprecated Names
  const termPatterns = [
    { regex: /Aegis\s+OldCore/gi, rep: 'Aegis Nexus Platform', ref: 'Nomenclature Matrix: Deprecated legacy product names' },
    { regex: /Magic\s+AI/gi, rep: 'Aegis Sentinel™ AI Engine', ref: 'Nomenclature Matrix: No colloquial or magical descriptions of AI' },
    { regex: /Blackbox/gi, rep: 'Transparent Governance Model', ref: 'Brand Messaging: Aegis is built on explainability, not blackbox systems' },
    { regex: /SyncTool/gi, rep: 'Verified Trust Protocol', ref: 'Nomenclature Matrix: Renamed in 2025' },
    { regex: /\bAegis\s+Sentinel\b(?!\u2122)/g, rep: 'Aegis Sentinel™', ref: 'Trademark Guidelines: Trademark symbol required on first reference' }
  ];

  termPatterns.forEach((p, idx) => {
    const match = text.match(p.regex);
    if (match) {
      issues.push({
        id: `det-term-${idx}`,
        category: 'terminology',
        severity: 'warning',
        headline: `Off-brand terminology: "${match[0]}"`,
        flaggedText: match[0],
        explanation: 'Using retired or inconsistent nomenclature erodes customer recognition and disrupts trademark protection.',
        suggestedReplacement: p.rep,
        brandRuleReference: p.ref,
        applied: false,
      });
    }
  });

  // 3. Tone & Voice
  const tonePatterns = [
    { regex: /act\s+now\s+or\s+get\s+left\s+in\s+the\s+dust/gi, rep: 'explore how modern governance empowers forward-looking teams', ref: 'Voice & Tone: No predatory FOMO or aggressive sales pressure' },
    { regex: /obviously|any\s+idiot\s+knows/gi, rep: 'as demonstrated across modern enterprise deployments', ref: 'Voice & Tone: Empathetic, respectful, customer-first prose' }
  ];

  tonePatterns.forEach((p, idx) => {
    const match = text.match(p.regex);
    if (match) {
      issues.push({
        id: `det-tone-${idx}`,
        category: 'tone',
        severity: 'warning',
        headline: `Aggressive/informal tone detected: "${match[0]}"`,
        flaggedText: match[0],
        explanation: 'Our brand voice is confident, calm, and supportive, rejecting pressure-tactics and condescending phrasing.',
        suggestedReplacement: p.rep,
        brandRuleReference: p.ref,
        applied: false,
      });
    }
  });

  // 4. Confidentiality check
  if (content.confidentialMode) {
    const confPatterns = [
      { regex: /Project\s+Titan/gi, rep: '[CONFIDENTIAL-INITIATIVE]', ref: 'Confidentiality Protocol: Unreleased Q4 architecture codename' },
      { regex: /Codename\s+Bluebird/gi, rep: '[CONFIDENTIAL-PARTNER]', ref: 'Confidentiality Protocol: Secret hardware partner initiative' },
      { regex: /\$45M\s+(ARR|revenue|pre-seed)/gi, rep: 'significant annual recurring growth', ref: 'Disclosure Policy: Non-public financial figures' }
    ];

    confPatterns.forEach((p, idx) => {
      const match = text.match(p.regex);
      if (match) {
        issues.push({
          id: `det-conf-${idx}`,
          category: 'confidentiality',
          severity: 'critical',
          headline: `Potential confidential disclosure: "${match[0]}"`,
          flaggedText: match[0],
          explanation: 'Detected internal project codenames or non-public financial data that have not received executive disclosure clearance.',
          suggestedReplacement: p.rep,
          brandRuleReference: p.ref,
          applied: false,
        });
      }
    });
  }

  // 5. Accessibility & Readability
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  if (avgWordsPerSentence > 28) {
    issues.push({
      id: 'det-acc-sentence-length',
      category: 'accessibility',
      severity: 'suggestion',
      headline: 'Dense sentence structure hinders readability',
      flaggedText: sentences[0]?.trim() || '',
      explanation: 'Average sentence length exceeds 28 words. Break complex sentences into shorter, scannable units to adhere to WCAG AAA cognitive accessibility standards.',
      suggestedReplacement: 'Keep sentences under 22 words where possible for clearer executive absorption.',
      brandRuleReference: 'Accessibility Standard #1.4: Plain language & scannable editorial cadence',
      applied: false,
    });
  }

  // 6. Visual consistency check
  if (content.visualAssets && content.visualAssets.length > 0) {
    content.visualAssets.forEach((asset, idx) => {
      if (!asset.altText || asset.altText.trim().length < 5) {
        issues.push({
          id: `det-vis-alt-${idx}`,
          category: 'accessibility',
          severity: 'critical',
          headline: `Missing descriptive Alt-Text on visual asset: "${asset.name}"`,
          flaggedText: asset.name,
          explanation: 'All published brand visual assets must include meaningful, descriptive alternative text for screen readers.',
          suggestedReplacement: `Comprehensive visual representation of ${asset.name} demonstrating brand UI layout`,
          brandRuleReference: 'Accessibility Standard #2.1: Image alternative text mandate',
          applied: false,
        });
      }
    });
  }

  // Calculate overall score
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const suggestionCount = issues.filter(i => i.severity === 'suggestion').length;
  const deduction = criticalCount * 18 + warningCount * 8 + suggestionCount * 3;
  const score = Math.max(12, Math.min(100, 100 - deduction));

  let revisedText = text;
  issues.forEach(issue => {
    if (issue.flaggedText && issue.suggestedReplacement) {
      revisedText = revisedText.replace(new RegExp(issue.flaggedText, 'g'), issue.suggestedReplacement);
    }
  });

  return {
    score,
    summary: `Brand governance audit identified ${issues.length} item(s) requiring attention across ${criticalCount} critical, ${warningCount} warning, and ${suggestionCount} suggestions.`,
    categoryBreakdown: {
      tone: { score: Math.max(40, 100 - issues.filter(i => i.category === 'tone').length * 20), count: issues.filter(i => i.category === 'tone').length },
      terminology: { score: Math.max(40, 100 - issues.filter(i => i.category === 'terminology').length * 25), count: issues.filter(i => i.category === 'terminology').length },
      messaging: { score: Math.max(50, 100 - issues.filter(i => i.category === 'messaging').length * 20), count: issues.filter(i => i.category === 'messaging').length },
      unsupported_claims: { score: Math.max(30, 100 - issues.filter(i => i.category === 'unsupported_claims').length * 30), count: issues.filter(i => i.category === 'unsupported_claims').length },
      accessibility: { score: Math.max(50, 100 - issues.filter(i => i.category === 'accessibility').length * 15), count: issues.filter(i => i.category === 'accessibility').length },
      visual_consistency: { score: Math.max(60, 100 - issues.filter(i => i.category === 'visual_consistency').length * 20), count: issues.filter(i => i.category === 'visual_consistency').length },
      confidentiality: { score: Math.max(20, 100 - issues.filter(i => i.category === 'confidentiality').length * 40), count: issues.filter(i => i.category === 'confidentiality').length },
    },
    issues,
    revisedText,
    readability: {
      wordCount: words.length,
      sentenceCount: sentences.length,
      readingEase: avgWordsPerSentence > 22 ? 58 : 74,
      gradeLevel: avgWordsPerSentence > 22 ? 'Grade 12 (Executive/Technical)' : 'Grade 9 (Clear Enterprise)',
      estimatedReadTimeMinutes: Math.max(1, Math.ceil(words.length / 200)),
    },
    engine: 'deterministic-fallback'
  };
}

// POST /api/audit: Intelligent multi-dimensional content evaluation
app.post('/api/audit', async (req, res) => {
  try {
    const { title, format, text, visualAssets, targetAudience, confidentialMode, customGuidelines } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required for audit' });
    }

    // If Gemini client is available, execute LLM audit with structured JSON schema
    if (ai) {
      try {
        const prompt = `
You are the Chief Brand Governance & Editorial Compliance Officer for Aegis Enterprise Technologies.
Your job is to rigorously review pre-publication material against our authoritative brand guidelines, fact vault, and regulatory standards.

APPROVED BRAND KNOWLEDGE & GUIDELINES:
${BRAND_KNOWLEDGE_BASE}
${customGuidelines ? `\nADDITIONAL TENANT GUIDELINES:\n${customGuidelines}` : ''}

CONTENT TO REVIEW:
Title: "${title || 'Untitled Draft'}"
Format: "${format || 'general'}"
Target Audience: "${targetAudience || 'Enterprise decision-makers, engineers, and partners'}"
Confidentiality Scrubbing Mode: ${confidentialMode ? 'ACTIVE (Strict internal codenames and private metrics flagging)' : 'Standard'}
Visual Assets Attached: ${visualAssets ? JSON.stringify(visualAssets) : 'None'}

TEXT DRAFT:
"""
${text}
"""

TASK:
1. Conduct an in-depth audit across these 7 dimensions:
   - tone: Ensure humble authority, warmth, precision, no hype or aggressive pressure.
   - terminology: Ensure approved official names, trademark symbols (™ on first mention), replace deprecated terms.
   - messaging: Validate alignment with brand pillars (Security, Human-in-the-loop, Radical Transparency).
   - unsupported_claims: Detect unsubstantiated absolutes ("100% bug-free", "zero errors"), unverified metrics, fake guarantees, or superlatives without citation.
   - accessibility: Detect dense sentence structures, reading grade complexity, jargon without explanation, and alt-text completeness for any visual assets.
   - visual_consistency: Evaluate visual assets alt-text, palette compliance, and brand consistency.
   - confidentiality: Flag secret internal codenames (e.g. Project Titan, Codename Bluebird), non-public revenue numbers.

2. For EVERY issue found:
   - Quote the EXACT flaggedText from the draft.
   - Explain WHY it conflicts with brand rules or facts in plain, respectful, constructive language.
   - Provide a PRECISE suggestedReplacement that preserves the author's original creative intent while adhering strictly to guidelines.
   - Assign severity: 'critical', 'warning', or 'suggestion'.
   - Cite the exact brandRuleReference.

3. Generate a full revised draft with the corrections seamlessly integrated so the creator can see the improved version.

Output pure JSON matching this exact structure.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER, description: 'Overall compliance score from 0 to 100' },
                summary: { type: Type.STRING, description: 'Executive summary of findings and recommendations' },
                categoryBreakdown: {
                  type: Type.OBJECT,
                  properties: {
                    tone: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        count: { type: Type.INTEGER },
                      },
                      required: ['score', 'count'],
                    },
                    terminology: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        count: { type: Type.INTEGER },
                      },
                      required: ['score', 'count'],
                    },
                    messaging: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        count: { type: Type.INTEGER },
                      },
                      required: ['score', 'count'],
                    },
                    unsupported_claims: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        count: { type: Type.INTEGER },
                      },
                      required: ['score', 'count'],
                    },
                    accessibility: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        count: { type: Type.INTEGER },
                      },
                      required: ['score', 'count'],
                    },
                    visual_consistency: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        count: { type: Type.INTEGER },
                      },
                      required: ['score', 'count'],
                    },
                    confidentiality: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        count: { type: Type.INTEGER },
                      },
                      required: ['score', 'count'],
                    },
                  },
                  required: ['tone', 'terminology', 'messaging', 'unsupported_claims', 'accessibility', 'visual_consistency', 'confidentiality'],
                },
                issues: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      category: { type: Type.STRING },
                      severity: { type: Type.STRING },
                      headline: { type: Type.STRING },
                      flaggedText: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      suggestedReplacement: { type: Type.STRING },
                      brandRuleReference: { type: Type.STRING },
                    },
                    required: ['id', 'category', 'severity', 'headline', 'flaggedText', 'explanation', 'suggestedReplacement', 'brandRuleReference'],
                  },
                },
                revisedText: { type: Type.STRING, description: 'Complete rewritten draft with all corrections applied' },
                readability: {
                  type: Type.OBJECT,
                  properties: {
                    wordCount: { type: Type.INTEGER },
                    sentenceCount: { type: Type.INTEGER },
                    readingEase: { type: Type.INTEGER },
                    gradeLevel: { type: Type.STRING },
                    estimatedReadTimeMinutes: { type: Type.INTEGER },
                  },
                  required: ['wordCount', 'sentenceCount', 'readingEase', 'gradeLevel', 'estimatedReadTimeMinutes'],
                },
              },
              required: ['score', 'summary', 'categoryBreakdown', 'issues', 'revisedText', 'readability'],
            },
          },
        });

        const rawText = response.text?.trim() || '{}';
        const parsed = JSON.parse(rawText);
        parsed.engine = 'gemini-3.8-flash';
        return res.json(parsed);
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to deterministic engine:', geminiError?.message || geminiError);
        const fallback = runDeterministicAudit({ title, format, text, visualAssets, confidentialMode });
        return res.json(fallback);
      }
    }

    // No API key provided: use reliable deterministic engine
    const fallback = runDeterministicAudit({ title, format, text, visualAssets, confidentialMode });
    return res.json(fallback);
  } catch (err: any) {
    console.error('Audit handler error:', err);
    res.status(500).json({ error: err.message || 'Audit processing failed' });
  }
});

// POST /api/guidelines/clarify: Analyze repeated violation trends to give brand managers clarity recommendations
app.post('/api/guidelines/clarify', async (req, res) => {
  try {
    const { violationHistory } = req.body;

    if (ai && violationHistory && Array.isArray(violationHistory)) {
      try {
        const prompt = `
As the Chief Brand Governance Strategist, analyze the following recent brand violations log from creators across the organization:
${JSON.stringify(violationHistory, null, 2)}

Identify:
1. Which specific guidelines are unclear, causing recurring creator confusion or pushback.
2. Recommend concrete amendments/clarifications to the brand guidelines playbook to eliminate ambiguity.
3. Suggest a template or example rule definition for the brand playbook.

Return JSON with:
{
  "unclearGuidelines": [
    {
      "guidelineName": "string",
      "violationCount": 0,
      "confusionRootCause": "string",
      "recommendedClarification": "string",
      "exampleCorrectUsage": "string"
    }
  ],
  "overallActionPlan": "string"
}
`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const text = response.text?.trim() || '{}';
        return res.json(JSON.parse(text));
      } catch (err) {
        console.warn('AI clarify failed, using structured fallback');
      }
    }

    // Fallback recommendation logic
    return res.json({
      unclearGuidelines: [
        {
          guidelineName: 'Absolute Claims vs Benchmark Citations (#4.1)',
          violationCount: 14,
          confusionRootCause: 'Creators often express product speed or security without realizing that "zero downtime" is an actionable legal warranty claim.',
          recommendedClarification: 'Explicitly define permitted threshold phrasing: Replace "100% reliable" with "Engineered for 99.99% availability per SLA standards".',
          exampleCorrectUsage: 'Use: "Backed by enterprise multi-region failover and independent SOC2 attestation."'
        },
        {
          guidelineName: 'Trademark Affixation Rules on External Content (#2.4)',
          violationCount: 9,
          confusionRootCause: 'Creators and external agencies are uncertain whether ™ is required in social media posts, headlines, or only body copy.',
          recommendedClarification: 'Update rule to state: Trademark symbol ™ is required once in the title/first reference for press releases and web landing pages, but optional in social character-constrained posts.',
          exampleCorrectUsage: 'Headline: Introducing Aegis Sentinel™; body copy: "Aegis Sentinel safeguards..."'
        },
        {
          guidelineName: 'Confidential Internal Milestone Naming (#6.2)',
          violationCount: 6,
          confusionRootCause: 'Product teams use engineering sprint codenames (e.g. Project Titan) interchangeably with outward marketing copy.',
          recommendedClarification: 'Establish automated codename scrub prior to staging PR distributions.',
          exampleCorrectUsage: 'Outward copy should refer to "Next-Generation Hybrid Sync Architecture" instead of "Project Titan".'
        }
      ],
      overallActionPlan: 'Conduct a 20-minute quarterly alignment workshop for marketing agencies and copywriters, and deploy pre-submission automated linting.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Clarify failed' });
  }
});

// Vite integration & Static Assets
const PORT = 3000;
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aegis Brand Governance server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
