import React, { useState } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Users, 
  Bot, 
  CheckCircle2, 
} from 'lucide-react';
import { UnclearGuidelineInsight } from '../types/governance';
import { RECURRING_MISTAKES_DATA, UNCLEAR_GUIDELINES_SEED } from '../data/initialData';

export const InsightsClarityView: React.FC = () => {
  const [unclearGuidelines, setUnclearGuidelines] = useState<UnclearGuidelineInsight[]>(UNCLEAR_GUIDELINES_SEED);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [adoptedList, setAdoptedList] = useState<string[]>([]);
  const [actionPlan, setActionPlan] = useState<string>('');

  const handleGenerateClarifications = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/guidelines/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          violationHistory: RECURRING_MISTAKES_DATA.violationsByCategory,
        }),
      });
      const data = await res.json();
      if (data.unclearGuidelines) {
        setUnclearGuidelines(data.unclearGuidelines);
      }
      if (data.overallActionPlan) {
        setActionPlan(data.overallActionPlan);
      }
    } catch (e) {
      console.error('Failed to generate AI clarity recommendation', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAdoptClarification = (name: string) => {
    setAdoptedList([...adoptedList, name]);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.75rem)] overflow-y-auto bg-slate-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Governance Insights & Clarity Index</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track repeated draft errors and identify ambiguous brand guidelines.
            </p>
          </div>

          <button
            onClick={handleGenerateClarifications}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition-all self-start sm:self-auto"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Diagnose Guidelines'}</span>
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 block">Total Audits</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {RECURRING_MISTAKES_DATA.totalAuditsRan}
            </div>
            <span className="text-[10px] text-emerald-700 block mt-1">+28% this month</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 block">Initial Draft Quality</span>
            <div className="text-2xl font-bold text-amber-700 mt-1">
              {RECURRING_MISTAKES_DATA.averageInitialScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">First-pass average</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] text-slate-500 block">Post-Review Score</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">
              {RECURRING_MISTAKES_DATA.averageFinalScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
            <span className="text-[10px] text-emerald-700 block mt-1">+33 pts post-correction</span>
          </div>
        </div>

        {/* Two Columns: Category Breakdown & Source Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Most Frequent Violations Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900">Frequent Violations</h3>
              <span className="text-[11px] text-slate-400">Past 90 Days</span>
            </div>

            <div className="space-y-2.5">
              {RECURRING_MISTAKES_DATA.violationsByCategory.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium">{item.label}</span>
                    <span className="text-slate-500 text-[11px]">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.percentage > 25
                          ? 'bg-rose-500'
                          : item.percentage > 15
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${item.percentage * 2.8}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Author Source Distribution */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900">Draft Origin Breakdown</h3>
              <span className="text-[11px] text-slate-400">AI vs Agency vs Internal</span>
            </div>

            <div className="space-y-2.5">
              {RECURRING_MISTAKES_DATA.authorSourceBreakdown.map((src) => (
                <div
                  key={src.source}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {src.source === 'ai_drafter' ? (
                        <Bot className="w-3.5 h-3.5 text-violet-600" />
                      ) : src.source === 'external_agency' ? (
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span className="font-semibold text-slate-800">{src.label}</span>
                    </div>
                    <span className="text-slate-500 text-[11px]">{src.totalDrafts} Drafts</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                    <div>
                      <span className="text-slate-400 block">Avg Issues:</span>
                      <span className={`font-semibold ${src.avgViolationsPerDraft > 3 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {src.avgViolationsPerDraft} per draft
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Common Area:</span>
                      <span className="text-slate-700 truncate block">{src.topIssue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Guideline Clarity Index */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Guidelines with High Friction Rates
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rules frequently violated or overridden indicate guideline ambiguity.
              </p>
            </div>
            {actionPlan && (
              <div className="text-xs bg-blue-50 border border-blue-200 text-blue-900 p-2 rounded-lg max-w-sm">
                <span className="font-semibold block">Plan:</span>
                {actionPlan}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {unclearGuidelines.map((item, idx) => {
              const isAdopted = adoptedList.includes(item.guidelineName);

              return (
                <div
                  key={idx}
                  className={`border rounded-xl p-3.5 space-y-2.5 transition-colors ${
                    isAdopted
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{item.guidelineName}</span>
                      <span className="text-[11px] text-rose-700 font-medium">
                        {item.violationCount} recorded instances
                      </span>
                    </div>
                    {isAdopted ? (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Updated
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAdoptClarification(item.guidelineName)}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs"
                      >
                        Adopt Clarification
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5 uppercase">
                        Root Cause
                      </span>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{item.confusionRootCause}</p>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-emerald-700 font-bold block mb-0.5 uppercase">
                        Recommended Clarification
                      </span>
                      <p className="text-slate-700 leading-relaxed text-[11px]">{item.recommendedClarification}</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 bg-white px-2.5 py-1.5 rounded border border-slate-200 flex items-center gap-1.5">
                    <span className="text-blue-700 font-semibold shrink-0">Usage:</span>
                    <span className="italic text-slate-700">{item.exampleCorrectUsage}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
