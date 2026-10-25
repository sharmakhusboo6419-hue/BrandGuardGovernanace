import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, Sliders } from 'lucide-react';
import { ToneVoiceMetrics } from '../types/governance';

interface ToneVoiceRadarProps {
  metrics?: ToneVoiceMetrics;
  onAutoRebalance?: () => void;
}

export const ToneVoiceRadar: React.FC<ToneVoiceRadarProps> = ({
  metrics = {
    authority: 78,
    accessibility: 82,
    hypeLevel: 14,
    calmConfidence: 88,
    status: 'balanced',
  },
  onAutoRebalance,
}) => {
  const isHypeTooHigh = metrics.hypeLevel > 20;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-900">Brand Voice & Sentiment Balance</h4>
        </div>
        <span className={`text-[11px] font-semibold flex items-center gap-1 ${
          metrics.status === 'balanced' ? 'text-emerald-700' : 'text-amber-700'
        }`}>
          {metrics.status === 'balanced' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aligned</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Tone Drift</span>
            </>
          )}
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        {/* Dimension 1: Executive Authority */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Executive Authority</span>
            <span className="text-slate-900 font-semibold">{metrics.authority}% (Target: 70-85%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${metrics.authority}%` }}
            />
          </div>
        </div>

        {/* Dimension 2: Accessibility */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Cognitive Accessibility</span>
            <span className="text-slate-900 font-semibold">{metrics.accessibility}% (Target: 75-90%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${metrics.accessibility}%` }}
            />
          </div>
        </div>

        {/* Dimension 3: Hype & Superlatives */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Hype & Superlatives</span>
            <span className={`font-semibold ${isHypeTooHigh ? 'text-rose-700' : 'text-slate-900'}`}>
              {metrics.hypeLevel}% {isHypeTooHigh ? '(Exceeds 20% limit)' : '(Compliant)'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isHypeTooHigh ? 'bg-rose-500' : 'bg-slate-400'}`}
              style={{ width: `${metrics.hypeLevel * 2}%` }}
            />
          </div>
        </div>

        {/* Dimension 4: Calm Confidence */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Calm Confidence vs Urgency</span>
            <span className="text-slate-900 font-semibold">{metrics.calmConfidence}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${metrics.calmConfidence}%` }}
            />
          </div>
        </div>
      </div>

      {isHypeTooHigh && onAutoRebalance && (
        <button
          onClick={onAutoRebalance}
          className="w-full py-1.5 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto-Rebalance Tone to Brand Standard</span>
        </button>
      )}
    </div>
  );
};
