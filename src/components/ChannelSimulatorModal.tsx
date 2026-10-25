import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Globe, 
  FileText, 
  Mail, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ContentDraft } from '../types/governance';

interface ChannelSimulatorModalProps {
  draft: ContentDraft;
  isOpen: boolean;
  onClose: () => void;
}

export const ChannelSimulatorModal: React.FC<ChannelSimulatorModalProps> = ({
  draft,
  isOpen,
  onClose,
}) => {
  const [activeChannel, setActiveChannel] = useState<'social' | 'pr' | 'landing' | 'email'>(
    draft.format === 'social_carousel' ? 'social' :
    draft.format === 'press_release' ? 'pr' :
    draft.format === 'landing_page' ? 'landing' : 'email'
  );

  const [carouselIndex, setCarouselIndex] = useState(0);

  if (!isOpen) return null;

  const score = draft.auditResult?.score ?? 0;
  const isPassing = score >= 80;

  // Split text into slides or paragraphs for social
  const paragraphs = draft.text.split('\n\n').filter(p => p.trim().length > 0);
  const visual = draft.visualAssets[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden text-slate-900">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Multi-Channel Simulator</h3>
              <p className="text-xs text-slate-500">Preview publication appearance across target channels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channel Switcher */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveChannel('social')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeChannel === 'social'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span>LinkedIn / Social Post</span>
            </button>
            <button
              onClick={() => setActiveChannel('pr')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeChannel === 'pr'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Media PR Wire</span>
            </button>
            <button
              onClick={() => setActiveChannel('landing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeChannel === 'landing'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Landing Page Hero</span>
            </button>
            <button
              onClick={() => setActiveChannel('email')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeChannel === 'email'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span>Customer Email</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-500">Readiness:</span>
            <span className={`font-bold ${isPassing ? 'text-emerald-700' : 'text-amber-700'}`}>
              {score}/100 ({isPassing ? 'Cleared' : 'Revisions Required'})
            </span>
          </div>
        </div>

        {/* Simulator Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex items-center justify-center">
          {/* 1. SOCIAL SIMULATOR */}
          {activeChannel === 'social' && (
            <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden text-xs">
              {/* Account header */}
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    A
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">Aegis Enterprise</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
                      <span className="text-[11px] text-blue-600 font-medium">Follow</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Enterprise Governance & Compliance Systems · 48,210 followers
                    </span>
                    <span className="text-[10px] text-slate-400">Just now · Edited</span>
                  </div>
                </div>
              </div>

              {/* Post Body */}
              <div className="p-4 space-y-2 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                {paragraphs[0]}
                {paragraphs.length > 1 && (
                  <p className="text-slate-700 mt-2">{paragraphs[1]}</p>
                )}
              </div>

              {/* Attached Asset / Slide Preview */}
              {visual && (
                <div className="border-t border-slate-100 relative aspect-video bg-slate-900">
                  <img
                    src={visual.url}
                    alt={visual.altText || visual.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs">
                    Slide {carouselIndex + 1} of {Math.max(1, paragraphs.length)}
                  </div>
                </div>
              )}

              {/* Social interaction footer */}
              <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-slate-500 text-[11px]">
                <span>142 Likes · 18 Comments · 9 Reposts</span>
                <span className="text-slate-400">Character limit: Compliant</span>
              </div>
            </div>
          )}

          {/* 2. PRESS RELEASE SIMULATOR */}
          {activeChannel === 'pr' && (
            <div className="max-w-2xl w-full bg-white border border-slate-300 rounded-xl shadow-lg p-8 space-y-4 font-serif text-slate-900">
              <div className="border-b border-slate-200 pb-3 font-sans">
                <span className="text-[10px] uppercase tracking-widest text-blue-700 font-bold block mb-1">
                  BUSINESS WIRE · FOR IMMEDIATE RELEASE
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-sans leading-tight">
                  {draft.title}
                </h3>
                <div className="text-[11px] text-slate-500 mt-1">
                  SAN FRANCISCO — {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div className="text-xs leading-relaxed text-slate-800 space-y-3 font-sans">
                {paragraphs.map((p, idx) => (
                  <p key={idx} className="leading-relaxed">{p}</p>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-4 font-sans text-xs text-slate-500 space-y-1">
                <span className="font-semibold text-slate-700 block">About Aegis Technologies</span>
                <p className="text-[11px] leading-relaxed">
                  Aegis provides verified brand governance and automated compliance validation for modern distributed enterprises.
                </p>
                <div className="text-[11px] text-slate-600 pt-1">
                  Media Contact: press@aegis-governance.internal
                </div>
              </div>
            </div>
          )}

          {/* 3. LANDING PAGE HERO SIMULATOR */}
          {activeChannel === 'landing' && (
            <div className="max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 text-white font-sans">
              {/* Browser chrome header */}
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                </div>
                <div className="mx-auto bg-slate-900 border border-slate-800 px-4 py-0.5 rounded text-[10px] text-slate-400">
                  https://aegis.enterprise/solutions
                </div>
              </div>

              {/* Hero Banner Section */}
              <div className="p-8 md:p-12 text-center space-y-5 bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Aegis Nexus Platform Release</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight max-w-xl mx-auto leading-tight">
                  {draft.title}
                </h2>

                <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                  {paragraphs[0] || draft.text.slice(0, 200)}
                </p>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md">
                    Schedule Architecture Briefing
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700">
                    View Compliance Spec
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. CUSTOMER EMAIL SIMULATOR */}
          {activeChannel === 'email' && (
            <div className="max-w-xl w-full bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden text-xs">
              <div className="bg-slate-50 border-b border-slate-200 p-4 space-y-1">
                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">From: </span>
                  Aegis Editorial Operations &lt;updates@aegis.internal&gt;
                </div>
                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Subject: </span>
                  {draft.title}
                </div>
              </div>

              <div className="p-6 space-y-3 leading-relaxed text-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                  <span className="font-bold text-sm text-slate-900 tracking-tight">
                    Aegis <span className="text-blue-600">Briefing</span>
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date().toLocaleDateString()}</span>
                </div>

                {paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 space-y-1 text-center">
                <p>© 2026 Aegis Technologies. All rights reserved.</p>
                <p>You received this message because your organization is enrolled in Verified Trust Protocol governance.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
