import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';
import { BrandFact } from '../types/governance';
import { BRAND_FACTS } from '../data/initialData';

interface FactMatcherPanelProps {
  draftText: string;
  onReplaceWithVerified: (oldText: string, newText: string) => void;
}

export const FactMatcherPanel: React.FC<FactMatcherPanelProps> = ({
  draftText,
  onReplaceWithVerified,
}) => {
  // Identify detected claim patterns in the draft
  const detectedClaims: Array<{
    phrase: string;
    status: 'verified' | 'unverified';
    fact?: BrandFact;
    recommendedPhrase?: string;
  }> = [];

  // Check verified claims
  if (/99\.99%/i.test(draftText)) {
    detectedClaims.push({
      phrase: '99.99% Availability',
      status: 'verified',
      fact: BRAND_FACTS.find(f => f.id === 'fact-1'),
    });
  }
  if (/40%/i.test(draftText) || /review cycle/i.test(draftText)) {
    detectedClaims.push({
      phrase: 'Reduction in Review Cycle Time',
      status: 'verified',
      fact: BRAND_FACTS.find(f => f.id === 'fact-2'),
    });
  }
  if (/SOC\s*2/i.test(draftText) || /ISO\s*27001/i.test(draftText)) {
    detectedClaims.push({
      phrase: 'SOC 2 Type II Certified',
      status: 'verified',
      fact: BRAND_FACTS.find(f => f.id === 'fact-3'),
    });
  }

  // Check unverified claims
  if (/100%\s*(bug-free|unhackable|uptime|secure)/i.test(draftText)) {
    const match = draftText.match(/100%\s*(bug-free|unhackable|uptime|secure)/i)?.[0] || '100% bug-free';
    detectedClaims.push({
      phrase: match,
      status: 'unverified',
      recommendedPhrase: '99.99% multi-region SLA availability',
      fact: BRAND_FACTS.find(f => f.id === 'fact-1'),
    });
  }
  if (/80%/i.test(draftText) && /cost/i.test(draftText)) {
    detectedClaims.push({
      phrase: 'slashes costs by 80%',
      status: 'unverified',
      recommendedPhrase: 'reduces review cycles by up to 40% (2026 Enterprise Impact Study)',
      fact: BRAND_FACTS.find(f => f.id === 'fact-2'),
    });
  }
  if (/\$45M/i.test(draftText)) {
    detectedClaims.push({
      phrase: '$45M ARR trajectory',
      status: 'unverified',
      recommendedPhrase: 'rapid enterprise customer adoption',
    });
  }

  const verifiedCount = detectedClaims.filter(c => c.status === 'verified').length;
  const unverifiedCount = detectedClaims.filter(c => c.status === 'unverified').length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-900">Fact Vault Citation Matcher</h4>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-emerald-700 font-semibold">{verifiedCount} Verified</span>
          {unverifiedCount > 0 && (
            <span className="text-rose-700 font-semibold">· {unverifiedCount} Uncited</span>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {detectedClaims.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">
            No quantitative metrics or statistical claims detected in this section.
          </p>
        ) : (
          detectedClaims.map((claim, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                claim.status === 'verified'
                  ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                  : 'border-rose-200 bg-rose-50/40 text-rose-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  {claim.status === 'verified' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>"{claim.phrase}"</span>
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                  claim.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {claim.status === 'verified' ? 'Fact Grounded' : 'Unindexed Claim'}
                </span>
              </div>

              {claim.fact && (
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-medium text-slate-700">Audit Citation: </span>
                  {claim.fact.citation}
                </div>
              )}

              {claim.status === 'unverified' && claim.recommendedPhrase && (
                <div className="pt-1.5 flex items-center justify-between border-t border-rose-100">
                  <span className="text-[11px] text-slate-600">
                    Use verified benchmark: <span className="font-medium text-emerald-800">"{claim.recommendedPhrase}"</span>
                  </span>
                  <button
                    onClick={() => onReplaceWithVerified(claim.phrase, claim.recommendedPhrase!)}
                    className="px-2 py-0.5 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                  >
                    Replace
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
