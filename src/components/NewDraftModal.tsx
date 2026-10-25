import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ContentDraft, ContentFormat } from '../types/governance';

interface NewDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDraft: (newDraft: ContentDraft) => void;
}

const TEMPLATES: Record<ContentFormat, { title: string; audience: string; text: string }> = {
  press_release: {
    title: 'Aegis Sentinel Unveils New Zero-Trust Verification Framework',
    audience: 'Enterprise Security Leaders, Tech Press',
    text: `SAN FRANCISCO, CA — Today Aegis Sentinel announces our next-generation enterprise governance framework.

Designed for high-assurance environments, the new capability connects verified policy engines directly with automated content pipelines. Built to surpass conventional legacy benchmarks, our architecture guarantees high-availability operations for Fortune 500 organizations.

To learn more about Aegis Sentinel™, visit our product portal.`
  },
  social_carousel: {
    title: 'LinkedIn: 5 Critical Traps in Unchecked Generative AI Copy',
    audience: 'Marketing Executives, Content Directors',
    text: `Are your agency copywriters and AI drafting tools inadvertently publishing unsubstantiated product claims?

Here are 3 key warning signs we see across modern enterprise content pipelines:
1. Superlatives disguised as factual metrics
2. Deprecated product names creating trademark confusion
3. Missing alternative text on high-reach visual assets

Maintain brand integrity with human-in-the-loop governance.`
  },
  landing_page: {
    title: 'Enterprise Trust & Compliance Hub',
    audience: 'Prospective B2B Enterprise Buyers',
    text: `Dependable Brand Governance for High-Velocity Teams.

Accelerate publication speed while eliminating regulatory liabilities. Aegis provides real-time policy checks before a single draft goes live.

Supported by an audited 99.99% multi-region availability SLA and independent SOC 2 Type II attestation.`
  },
  newsletter: {
    title: 'Product Briefing: Security Updates & Policy Expansion',
    audience: 'Customer Community, Enterprise Administrators',
    text: `Welcome to the monthly Aegis Customer Update.

This month, we are highlighting our expanded rule dictionary for international trademarks and accessibility guidelines. 

Thank you for building a safer, more consistent brand together.`
  },
  ad_copy: {
    title: 'Search & Display Campaign: Stop Brand Drift',
    audience: 'Digital Marketing Managers',
    text: `Protect your enterprise brand identity across every channel. 

Eliminate incorrect claims, outdated nomenclature, and off-brand visuals before they reach customers. Explore Aegis Sentinel™ today.`
  },
  article: {
    title: 'The Evolution of Brand Sovereignty in the Age of Generative Copy',
    audience: 'Editorial Directors, Corporate Communications Teams',
    text: `As organizations produce tenfold more content through distributed teams, maintaining voice and factual precision becomes a strategic risk.

Here is how modern corporate communications leaders structure human-guided guardrails.`
  }
};

export const NewDraftModal: React.FC<NewDraftModalProps> = ({
  isOpen,
  onClose,
  onCreateDraft,
}) => {
  const [format, setFormat] = useState<ContentFormat>('press_release');
  const [title, setTitle] = useState(TEMPLATES.press_release.title);
  const [audience, setAudience] = useState(TEMPLATES.press_release.audience);
  const [text, setText] = useState(TEMPLATES.press_release.text);
  const [authorName, setAuthorName] = useState('Elena Rostova');
  const [authorType, setAuthorType] = useState<'internal_team' | 'external_agency' | 'ai_drafter'>('internal_team');
  const [confidentialMode, setConfidentialMode] = useState(false);

  if (!isOpen) return null;

  const handleSelectFormat = (f: ContentFormat) => {
    setFormat(f);
    setTitle(TEMPLATES[f].title);
    setAudience(TEMPLATES[f].audience);
    setText(TEMPLATES[f].text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;

    const newDraft: ContentDraft = {
      id: `draft-${Date.now()}`,
      title: title.trim(),
      format,
      status: 'draft',
      targetAudience: audience.trim() || 'General Enterprise Audience',
      author: {
        name: authorName.trim() || 'Creator',
        type: authorType,
      },
      confidentialMode,
      text: text.trim(),
      visualAssets: [
        {
          id: `vis-${Date.now()}`,
          name: 'Hero Visual Asset',
          type: 'banner',
          url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
          altText: 'Dashboard visual preview',
          colorPalette: ['#0F172A', '#2563EB', '#0D9488'],
          contrastScore: 'AAA',
          aspectRatio: '16:9',
          hasLogo: true,
        }
      ],
      comments: [],
      history: [
        {
          id: `h-init-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          authorName: authorName.trim() || 'Creator',
          action: 'Created Draft',
          description: `Draft staged for ${format.replace('_', ' ')}`,
        }
      ],
      updatedAt: new Date().toISOString(),
    };

    onCreateDraft(newDraft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">New Content Draft</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Format Picker */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Format</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['press_release', 'social_carousel', 'landing_page', 'newsletter', 'ad_copy', 'article'] as ContentFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleSelectFormat(f)}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    format === f
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="capitalize block text-xs">{f.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              required
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Target Audience</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. Enterprise Security Leaders"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Author info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Author Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Source</label>
              <select
                value={authorType}
                onChange={(e) => setAuthorType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="internal_team">Internal Team</option>
                <option value="external_agency">External Agency</option>
                <option value="ai_drafter">AI Drafter</option>
              </select>
            </div>
          </div>

          {/* Confidential Mode */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="conf-check"
              checked={confidentialMode}
              onChange={(e) => setConfidentialMode(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-0"
            />
            <label htmlFor="conf-check" className="text-slate-700 cursor-pointer">
              Strict Confidentiality Mode (flags internal codenames and metrics)
            </label>
          </div>

          {/* Draft text */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1">Content</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white resize-none font-sans"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Create Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
