export type UserRole = 'creator' | 'reviewer' | 'brand_manager';

export type ContentFormat = 'press_release' | 'article' | 'social_carousel' | 'landing_page' | 'newsletter' | 'ad_copy';

export type WorkflowStatus = 'draft' | 'in_review' | 'changes_requested' | 'approved' | 'published';

export type IssueSeverity = 'critical' | 'warning' | 'suggestion';

export type IssueCategory = 
  | 'tone' 
  | 'terminology' 
  | 'messaging' 
  | 'unsupported_claims' 
  | 'accessibility' 
  | 'visual_consistency' 
  | 'confidentiality';

export interface VisualAsset {
  id: string;
  name: string;
  type: 'banner' | 'logo' | 'infographic' | 'screenshot' | 'photo';
  url: string;
  altText: string;
  colorPalette: string[];
  contrastScore: 'AAA' | 'AA' | 'Fail';
  aspectRatio: string;
  hasLogo: boolean;
  notes?: string;
}

export interface AuditIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  headline: string;
  flaggedText: string;
  explanation: string;
  suggestedReplacement: string;
  brandRuleReference: string;
  applied?: boolean;
  justified?: boolean;
  justificationNote?: string;
}

export interface ReadabilityMetrics {
  wordCount: number;
  sentenceCount: number;
  readingEase: number;
  gradeLevel: string;
  estimatedReadTimeMinutes: number;
}

export interface CategoryScore {
  score: number;
  count: number;
}

export interface ToneVoiceMetrics {
  authority: number; // 0-100
  accessibility: number; // 0-100
  hypeLevel: number; // 0-100
  calmConfidence: number; // 0-100
  status: 'balanced' | 'too_hype' | 'too_technical' | 'unsupported_urgency';
}

export interface VerifiedClaimMatch {
  id: string;
  claimPhrase: string;
  matchedFactId?: string;
  matchedFactClaim?: string;
  citation?: string;
  status: 'verified' | 'unverified' | 'unindexed';
}

export interface AuditResult {
  score: number;
  summary: string;
  categoryBreakdown: {
    tone: CategoryScore;
    terminology: CategoryScore;
    messaging: CategoryScore;
    unsupported_claims: CategoryScore;
    accessibility: CategoryScore;
    visual_consistency: CategoryScore;
    confidentiality: CategoryScore;
  };
  issues: AuditIssue[];
  revisedText: string;
  readability: ReadabilityMetrics;
  toneRadar?: ToneVoiceMetrics;
  verifiedClaims?: VerifiedClaimMatch[];
  engine?: string;
  auditedAt: string;
}

export interface CommentItem {
  id: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
  resolved?: boolean;
}

export interface RevisionHistoryEntry {
  id: string;
  timestamp: string;
  authorName: string;
  action: string;
  description: string;
}

export interface ContentDraft {
  id: string;
  title: string;
  format: ContentFormat;
  status: WorkflowStatus;
  targetAudience: string;
  author: {
    name: string;
    type: 'internal_team' | 'external_agency' | 'ai_drafter';
    avatar?: string;
  };
  confidentialMode: boolean;
  text: string;
  previousVersionText?: string;
  visualAssets: VisualAsset[];
  auditResult?: AuditResult;
  comments: CommentItem[];
  history: RevisionHistoryEntry[];
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface BrandFact {
  id: string;
  claim: string;
  verifiedData: string;
  citation: string;
  verifiedDate: string;
  category: 'performance' | 'security' | 'compliance' | 'customers' | 'pricing';
}

export interface TerminologyRule {
  id: string;
  term: string;
  status: 'approved' | 'deprecated' | 'restricted';
  replacement?: string;
  rationale: string;
  exampleContext: string;
}

export interface BrandGuideline {
  id: string;
  title: string;
  category: IssueCategory;
  summary: string;
  ruleDetails: string;
  dos: string[];
  donts: string[];
}

export interface UnclearGuidelineInsight {
  guidelineName: string;
  violationCount: number;
  confusionRootCause: string;
  recommendedClarification: string;
  exampleCorrectUsage: string;
}
