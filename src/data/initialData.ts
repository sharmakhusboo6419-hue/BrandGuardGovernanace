import { ContentDraft, BrandFact, TerminologyRule, BrandGuideline, UnclearGuidelineInsight } from '../types/governance';

export const INITIAL_DRAFTS: ContentDraft[] = [
  {
    id: 'draft-pr-01',
    title: 'Aegis Q4 Enterprise Platform Release & Architecture Reveal',
    format: 'press_release',
    status: 'in_review',
    targetAudience: 'Enterprise CIOs, Security Directors, Tech Media',
    author: {
      name: 'Elena Rostova (Global PR Lead)',
      type: 'internal_team',
    },
    confidentialMode: true,
    text: `SAN FRANCISCO, CA — Today Aegis is proud to introduce our next-generation platform that crushes all competitors in the zero-trust workflow sector.

Building on the foundation of Aegis OldCore, our engineers have developed a revolutionary miraculous system powered by Magic AI. Our new architecture provides a 100% bug-free guarantee and is completely unhackable, allowing Fortune 500 banks to operate with zero human oversight required.

Furthermore, internal tests on Project Titan confirm our technology slashes costs by 80% while syncing seamlessly with our legacy SyncTool. According to internal documents, our current $45M ARR trajectory proves that customers can act now or get left in the dust. 

To experience Aegis Sentinel, contact our sales engineering division today.`,
    visualAssets: [
      {
        id: 'vis-pr-1',
        name: 'Architecture Diagram v4',
        type: 'infographic',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
        altText: '', // Purposely empty to trigger accessibility warning
        colorPalette: ['#0F172A', '#2563EB', '#38BDF8'],
        contrastScore: 'AAA',
        aspectRatio: '16:9',
        hasLogo: true,
        notes: 'Needs official descriptive alt-text before media wire distribution'
      }
    ],
    comments: [
      {
        id: 'c-1',
        authorName: 'Marcus Vance',
        authorRole: 'reviewer',
        text: 'Elena, please watch out for the 100% bug-free claim and the Project Titan reference. Legal will definitely flag this.',
        createdAt: '2026-10-24 14:30',
      }
    ],
    history: [
      {
        id: 'h-1',
        timestamp: '2026-10-24 14:00',
        authorName: 'Elena Rostova',
        action: 'Created Draft',
        description: 'Initial draft prepared for upcoming Q4 media blast'
      },
      {
        id: 'h-2',
        timestamp: '2026-10-24 14:25',
        authorName: 'Aegis System',
        action: 'Automated Audit',
        description: 'Audit generated 7 compliance findings (Score: 38/100)'
      }
    ],
    updatedAt: '2026-10-24 14:35'
  },
  {
    id: 'draft-social-02',
    title: 'LinkedIn Thought Leadership: The Fallacy of Fully Autonomous AI',
    format: 'social_carousel',
    status: 'draft',
    targetAudience: 'DevOps leads, Governance practitioners, LinkedIn tech network',
    author: {
      name: 'Apex Horizon Digital Agency',
      type: 'external_agency',
    },
    confidentialMode: false,
    text: `Why is everyone still believing the hype of "fully autonomous" corporate AI?

The truth is simple: pure automation without human oversight creates catastrophic compliance drift. At Aegis Sentinel, we take a different stance. We build enterprise guardrails that keep human decision-makers firmly in command.

Legacy tools treat compliance like a blackbox. They promise revolutionary miraculous miracles, but when audits hit, teams scramble. 

With the Verified Trust Protocol, your organization gains real-time visibility, deterministic audit trails, and provable safety. Don't compromise your brand integrity for quick marketing buzz.`,
    visualAssets: [
      {
        id: 'vis-soc-1',
        name: 'Carousel Slide 1: Human-in-the-Loop',
        type: 'banner',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        altText: 'Diagram illustrating human approval gates in automated brand publishing workflows',
        colorPalette: ['#0F172A', '#2563EB', '#0D9488'],
        contrastScore: 'AAA',
        aspectRatio: '1:1',
        hasLogo: true,
        notes: 'Compliant with brand color tokens'
      }
    ],
    comments: [],
    history: [
      {
        id: 'h-soc-1',
        timestamp: '2026-10-24 11:20',
        authorName: 'Apex Agency',
        action: 'Submitted',
        description: 'External copy delivered for social distribution'
      }
    ],
    updatedAt: '2026-10-24 11:25'
  },
  {
    id: 'draft-landing-03',
    title: 'Product Landing Page: Aegis Nexus Enterprise Security',
    format: 'landing_page',
    status: 'changes_requested',
    targetAudience: 'B2B Enterprise buyers, compliance officers',
    author: {
      name: 'Gemini Copilot Draft Engine',
      type: 'ai_drafter',
    },
    confidentialMode: false,
    text: `Scale your content pipeline with zero friction. Aegis Nexus Platform delivers enterprise governance at lightspeed.

Unlike traditional gatekeeping that slows your creators down, our intelligent engine provides real-time policy checks before a single post goes live. 

Guaranteed zero downtime and 100% unhackable cryptographic verification ensure your confidential brand guidelines remain fortified against unauthorized leaks. 

Join over 400 global enterprises that trust our Verified Trust Protocol to safeguard their reputation across every customer touchpoint.`,
    visualAssets: [
      {
        id: 'vis-land-1',
        name: 'Hero Banner: Content Flow',
        type: 'banner',
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
        altText: 'Futuristic network visual showing secure data encryption paths',
        colorPalette: ['#0F172A', '#1E293B', '#3B82F6'],
        contrastScore: 'AA',
        aspectRatio: '16:9',
        hasLogo: true,
      }
    ],
    comments: [
      {
        id: 'c-land-1',
        authorName: 'Sarah Jenkins',
        authorRole: 'reviewer',
        text: 'The 100% unhackable claim needs to be toned down to match our SOC2 type II audit specs.',
        createdAt: '2026-10-24 10:15',
      }
    ],
    history: [
      {
        id: 'h-l-1',
        timestamp: '2026-10-24 09:30',
        authorName: 'Gemini AI Assistant',
        action: 'Generated Draft',
        description: 'Draft synthesized from landing page brief'
      }
    ],
    updatedAt: '2026-10-24 10:20'
  },
  {
    id: 'draft-newsletter-04',
    title: 'Monthly Customer Briefing: November 2026 Edition',
    format: 'newsletter',
    status: 'approved',
    targetAudience: 'Existing customer base, customer success managers',
    author: {
      name: 'Marcus Vance (VP Product Marketing)',
      type: 'internal_team',
    },
    confidentialMode: true,
    text: `Welcome to the November 2026 edition of the Aegis Customer Briefing.

Over the past quarter, our engineering group has introduced substantial improvements to the Verified Trust Protocol, enhancing automated guideline parsing speed by 35% across multi-language datasets. 

We are also excited to announce expanded support for Figma and Adobe Creative Cloud asset inspection, allowing marketing designers to verify color contrast and logo safety margins directly inside their authoring tools.

As always, our team remains committed to transparent governance, verifiable data sovereignty, and human-in-the-loop oversight. Thank you for your continued partnership.`,
    visualAssets: [
      {
        id: 'vis-nl-1',
        name: 'Figma & Aegis Integration Mockup',
        type: 'screenshot',
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
        altText: 'Screenshot of Aegis governance plugin running inside Figma design interface',
        colorPalette: ['#0F172A', '#2563EB', '#0D9488'],
        contrastScore: 'AAA',
        aspectRatio: '16:9',
        hasLogo: true
      }
    ],
    comments: [],
    history: [
      {
        id: 'h-nl-1',
        timestamp: '2026-10-24 08:00',
        authorName: 'Marcus Vance',
        action: 'Approved & Signed Off',
        description: 'All compliance checks passed with 98/100 readiness score'
      }
    ],
    updatedAt: '2026-10-24 08:05',
    approvedBy: 'Sarah Jenkins (General Counsel)',
    approvedAt: '2026-10-24 08:05'
  }
];

export const BRAND_FACTS: BrandFact[] = [
  {
    id: 'fact-1',
    claim: '99.99% Availability SLA',
    verifiedData: 'SLA guarantees 99.99% multi-region uptime, independently validated via Datadog status monitors.',
    citation: 'Aegis Master Services Agreement, Section 4.2 (Oct 2026)',
    verifiedDate: '2026-10-01',
    category: 'performance'
  },
  {
    id: 'fact-2',
    claim: '40% Reduction in Review Cycle Time',
    verifiedData: 'Audited benchmark across 14 enterprise deployments showed an average drop in editorial revision turns from 5.2 days to 3.1 days.',
    citation: '2026 Enterprise Impact Study, Q3 Report',
    verifiedDate: '2026-09-15',
    category: 'performance'
  },
  {
    id: 'fact-3',
    claim: 'SOC 2 Type II & ISO 27001 Certified',
    verifiedData: 'Complete annual audit completed with zero non-conformances by Schellman Compliance LLC.',
    citation: 'Report #SC-2026-992B',
    verifiedDate: '2026-08-30',
    category: 'compliance'
  },
  {
    id: 'fact-4',
    claim: '400+ Enterprise Deployments',
    verifiedData: '412 active enterprise customer accounts across North America, EMEA, and APAC.',
    citation: 'Q3 2026 Investor & Board Ledger',
    verifiedDate: '2026-10-10',
    category: 'customers'
  },
  {
    id: 'fact-5',
    claim: 'Zero Customer Data Retained for Model Training',
    verifiedData: 'All API payloads run on zero-retention stateless inference endpoints; customer data is never utilized for foundational model retraining.',
    citation: 'Aegis Data Privacy Addendum 2026',
    verifiedDate: '2026-09-01',
    category: 'security'
  }
];

export const TERMINOLOGY_RULES: TerminologyRule[] = [
  {
    id: 'term-1',
    term: 'Aegis Sentinel™',
    status: 'approved',
    rationale: 'Primary product name for our automated governance engine. Trademark symbol required on first mention in any press release, landing page, or formal whitepaper.',
    exampleContext: 'Headline: Introducing Aegis Sentinel™; body text: Aegis Sentinel provides...'
  },
  {
    id: 'term-2',
    term: 'Aegis OldCore',
    status: 'deprecated',
    replacement: 'Aegis Nexus Platform',
    rationale: 'Retired in v3.0 release. Continuing to mention OldCore confuses enterprise customers about support lifecycles.',
    exampleContext: 'Replace all occurrences with "Aegis Nexus Platform".'
  },
  {
    id: 'term-3',
    term: 'SyncTool',
    status: 'deprecated',
    replacement: 'Verified Trust Protocol',
    rationale: 'SyncTool was an internal beta tool name; external market positioning is Verified Trust Protocol.',
    exampleContext: 'Change "SyncTool integration" to "Verified Trust Protocol".'
  },
  {
    id: 'term-4',
    term: 'Magic AI / Autonomous Brain',
    status: 'restricted',
    replacement: 'Human-Governed Intelligence / Verified Engine',
    rationale: 'Unscientific and misleading buzzwords. Enterprise buyers require explainability and governance, not hand-wavy claims.',
    exampleContext: 'Use "verified policy engine" rather than "magical AI".'
  },
  {
    id: 'term-5',
    term: '100% Bug-Free / Unhackable',
    status: 'restricted',
    replacement: 'High-assurance architecture with 99.99% availability',
    rationale: 'Absolute security claims are legally indefensible and breach FTC promotional standards.',
    exampleContext: 'State tested SLA metrics instead of guarantees of perfection.'
  }
];

export const BRAND_GUIDELINES: BrandGuideline[] = [
  {
    id: 'guide-tone',
    title: 'Voice, Tone & Attitude',
    category: 'tone',
    summary: 'Empathetic authority, intellectual humility, and crisp clarity without tech-bro hyperbole or aggressive pressure.',
    ruleDetails: 'Our communications reflect enterprise maturity. We respect our buyers’ intelligence. We do not use manufactured urgency, FOMO, or derogatory comparisons with competitors.',
    dos: [
      'Speak in confident, grounded prose backed by real operational experience',
      'Explain complex governance workflows in simple, accessible language',
      'Acknowledge that security is a continuous partnership, not an instant silver bullet'
    ],
    donts: [
      'Never claim we "crush" or "destroy" competitors',
      'Never use aggressive FOMO ("Act now or get left in the dust")',
      'Avoid hollow tech buzzwords like "paradigm shift" or "magical results"'
    ]
  },
  {
    id: 'guide-claims',
    title: 'Promotional Claims & Fact Verification',
    category: 'unsupported_claims',
    summary: 'Every quantitative statement or performance metric must be indexed in the Fact Vault with an active citation.',
    ruleDetails: 'Unsubstantiated claims expose the company to regulatory fines and customer churn. Absolute claims ("100% bug-free", "zero downtime forever") are strictly prohibited.',
    dos: [
      'Cite specific SLA metrics (e.g. 99.99% tested availability)',
      'Reference the verified customer benchmark study for cost-reduction stats',
      'Specify testing parameters and environment conditions'
    ],
    donts: [
      'Never guarantee 100% error-free operation',
      'Never state unverifiable cost reduction percentages without qualification',
      'Never cite unreleased financials without Chief Legal Officer clearance'
    ]
  },
  {
    id: 'guide-visual',
    title: 'Visual Consistency & Accessibility',
    category: 'visual_consistency',
    summary: 'Strict color token hierarchy, mandatory WCAG 2.2 AA contrast, and descriptive alternative text for all imagery.',
    ruleDetails: 'Brand colors: Primary Slate (#0F172A), Cobalt Accent (#2563EB), Verification Teal (#0D9488). All images must maintain a 24px logo safety buffer.',
    dos: [
      'Provide concise, descriptive alt-text explaining the content of diagrams',
      'Ensure minimum 4.5:1 text-to-background contrast ratio',
      'Use high-fidelity SVG brand marks with proper clearspace'
    ],
    donts: [
      'Never publish visual assets with empty or generic alt-text like "image.png"',
      'Do not distort the logo aspect ratio or place it on clashing busy textures',
      'Avoid generic AI-generated slop imagery with mangled hands or floating spheres'
    ]
  },
  {
    id: 'guide-confidential',
    title: 'Confidentiality & Internal Codename Scrubbing',
    category: 'confidentiality',
    summary: 'Protection of pre-announcement architecture codenames, customer NDAs, and preliminary financial figures.',
    ruleDetails: 'Before any draft is staged for external distribution or shared with outside agencies, automated codename scrubbing must be active.',
    dos: [
      'Enable Confidential Scrubbing mode when collaborating with external agencies',
      'Use official public feature names instead of sprint codenames',
      'Verify executive clearance before publishing financial growth figures'
    ],
    donts: [
      'Never mention internal codenames (e.g. Project Titan, Codename Bluebird)',
      'Never disclose unannounced ARR or valuation metrics in marketing copy',
      'Never paste unredacted customer Slack screenshots into public posts'
    ]
  }
];

export const RECURRING_MISTAKES_DATA = {
  totalAuditsRan: 342,
  averageInitialScore: 61,
  averageFinalScore: 94,
  violationsByCategory: [
    { category: 'unsupported_claims', label: 'Unsupported Claims', count: 98, percentage: 32 },
    { category: 'terminology', label: 'Deprecated Terminology', count: 74, percentage: 24 },
    { category: 'accessibility', label: 'Missing Alt-Text & Contrast', count: 58, percentage: 19 },
    { category: 'tone', label: 'Hype Tone & False Urgency', count: 42, percentage: 14 },
    { category: 'confidentiality', label: 'Leaked Codenames/Metrics', count: 21, percentage: 7 },
    { category: 'visual_consistency', label: 'Off-palette Visual Assets', count: 12, percentage: 4 }
  ],
  authorSourceBreakdown: [
    { source: 'ai_drafter', label: 'AI Drafting Tools', totalDrafts: 140, avgViolationsPerDraft: 3.8, topIssue: 'Hype tone & superlative claims' },
    { source: 'external_agency', label: 'External PR & Creative Agencies', totalDrafts: 92, avgViolationsPerDraft: 3.1, topIssue: 'Deprecated product terms & missing ™' },
    { source: 'internal_team', label: 'Internal Marketing & Product Team', totalDrafts: 110, avgViolationsPerDraft: 1.4, topIssue: 'Internal codename slips (Project Titan)' }
  ]
};

export const UNCLEAR_GUIDELINES_SEED: UnclearGuidelineInsight[] = [
  {
    guidelineName: 'Trademark Affixation (™ Rules on External Channels)',
    violationCount: 46,
    confusionRootCause: 'Creators often omit ™ on social media posts and character-limited ad copy because they assume the rule only applies to formal press releases.',
    recommendedClarification: 'Update section 2.4: Specify that ™ is MANDATORY on first mention in Press Releases and Landing Pages, but OPTIONAL in Twitter/LinkedIn posts under 280 characters.',
    exampleCorrectUsage: 'Web/PR: "Aegis Sentinel™ safeguards enterprise data." | Social: "Aegis Sentinel safeguards enterprise data."'
  },
  {
    guidelineName: 'Zero-Downtime vs High-Availability SLAs',
    violationCount: 38,
    confusionRootCause: 'Marketers and AI drafting tools conflate "99.99% multi-region SLA" with "zero downtime guaranteed", exposing the firm to breach-of-contract liabilities.',
    recommendedClarification: 'Add explicit forbidden phrase clause: Disallow "100% uptime" and provide approved substitute boilerplate: "Engineered for 99.99% multi-region availability".',
    exampleCorrectUsage: 'Use: "Supported by an audited 99.99% multi-region availability SLA."'
  },
  {
    guidelineName: 'Cost Savings Qualification Standards',
    violationCount: 29,
    confusionRootCause: 'Agencies write "Slashes operational costs by 80%" without citing the required 14-enterprise benchmark study footnotes.',
    recommendedClarification: 'Require mandatory attribution suffix: Any percentage savings over 30% must append "(based on 2026 Q3 Enterprise Impact Study)".',
    exampleCorrectUsage: '"Reduces governance review cycles by up to 40% (based on 2026 Q3 Enterprise Impact Study)."'
  }
];
