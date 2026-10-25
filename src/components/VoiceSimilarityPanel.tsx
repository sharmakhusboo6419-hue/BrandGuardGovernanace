import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  ArrowRight, 
  TrendingUp, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

export interface LinguisticSuggestion {
  id: string;
  headline: string;
  currentPhrase: string;
  proposedPhrase: string;
  linguisticReason: string;
  impactDimension: 'cadence' | 'active_voice' | 'empirical_weight' | 'tonal_calm';
  applied?: boolean;
}

export interface VoiceSimilarityData {
  consistencyScore: number;
  linguisticMetrics: {
    sentenceCadenceScore: number;
    activeVoicePercentage: number;
    empiricalDensityScore: number;
    confidenceScore: number;
  };
  comparisonVsBenchmark: {
    avgSentenceLengthCurrent: number;
    avgSentenceLengthBenchmark: number;
    lexicalDiversityCurrent: number;
    lexicalDiversityBenchmark: number;
  };
  closestBenchmark: {
    title: string;
    format: string;
    performanceHighlight: string;
    keyStylisticPattern: string;
  };
  linguisticSuggestions: LinguisticSuggestion[];
}

interface VoiceSimilarityPanelProps {
  draftTitle: string;
  draftFormat: string;
  draftText: string;
  onApplyLinguisticShift: (currentPhrase: string, proposedPhrase: string) => void;
}

export const VoiceSimilarityPanel: React.FC<VoiceSimilarityPanelProps> = ({
  draftTitle,
  draftFormat,
  draftText,
  onApplyLinguisticShift,
}) => {
  const [data, setData] = useState<VoiceSimilarityData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/voice-similarity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draftTitle,
          format: draftFormat,
          text: draftText,
        }),
      });
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error('Failed to run voice similarity analysis:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (sug: LinguisticSuggestion) => {
    onApplyLinguisticShift(sug.currentPhrase, sug.proposedPhrase);
    setAppliedIds([...appliedIds, sug.id]);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Brand Voice Similarity</h4>
            <p className="text-[11px] text-slate-500">Benchmark against historical high-performing content</p>
          </div>
        </div>

        <button
          onClick={runAnalysis}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Analyzing...' : data ? 'Re-Analyze' : 'Analyze Voice'}</span>
        </button>
      </div>

      {!data && !isLoading ? (
        <div className="py-6 text-center space-y-2">
          <Award className="w-8 h-8 text-blue-600 mx-auto opacity-70" />
          <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            Compare your draft against the brand's highest-converting press releases and publications to get a <span className="font-semibold text-slate-900">Consistency Score</span> and sentence-level linguistic suggestions.
          </p>
          <button
            onClick={runAnalysis}
            className="mt-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            Run Consistency Analysis
          </button>
        </div>
      ) : isLoading ? (
        <div className="py-8 text-center text-xs text-slate-500 space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600" />
          <p>Evaluating cadence, active voice, and empirical grounding against benchmark corpus...</p>
        </div>
      ) : data ? (
        <div className="space-y-4">
          {/* Consistency Score Banner */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                Voice Consistency Score
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className={`text-2xl font-black ${
                  data.consistencyScore >= 80 ? 'text-emerald-700' : data.consistencyScore >= 65 ? 'text-amber-700' : 'text-rose-700'
                }`}>
                  {data.consistencyScore}%
                </span>
                <span className="text-xs text-slate-500">
                  {data.consistencyScore >= 80 ? 'High Alignment with Top Content' : 'Noticeable Stylistic Divergence'}
                </span>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-500">
              <span className="block font-medium text-slate-700">Benchmark Reference:</span>
              <span className="text-blue-700 font-semibold truncate max-w-[150px] block">
                {data.closestBenchmark.title}
              </span>
            </div>
          </div>

          {/* Linguistic Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Rhythm & Cadence</span>
                <span className="font-semibold text-slate-900">{data.linguisticMetrics.sentenceCadenceScore}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${data.linguisticMetrics.sentenceCadenceScore}%` }} />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Active Voice Ratio</span>
                <span className="font-semibold text-slate-900">{data.linguisticMetrics.activeVoicePercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${data.linguisticMetrics.activeVoicePercentage}%` }} />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Empirical Grounding</span>
                <span className="font-semibold text-slate-900">{data.linguisticMetrics.empiricalDensityScore}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${data.linguisticMetrics.empiricalDensityScore}%` }} />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Calm Assurance</span>
                <span className="font-semibold text-slate-900">{data.linguisticMetrics.confidenceScore}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full" style={{ width: `${data.linguisticMetrics.confidenceScore}%` }} />
              </div>
            </div>
          </div>

          {/* Closest High-Performing Content Benchmark Card */}
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                Closest Top-Performing Benchmark
              </span>
              <span className="text-[10px] text-slate-500 capitalize">{data.closestBenchmark.format.replace('_', ' ')}</span>
            </div>
            <h5 className="font-bold text-slate-900 text-xs">{data.closestBenchmark.title}</h5>
            <div className="text-[11px] text-slate-600">
              <span className="font-medium text-emerald-800">Proven Performance: </span>
              {data.closestBenchmark.performanceHighlight}
            </div>
            <div className="text-[11px] text-slate-600 italic">
              "Key Stylistic Pattern: {data.closestBenchmark.keyStylisticPattern}"
            </div>
          </div>

          {/* Specific Linguistic Suggestions */}
          <div className="space-y-2.5 pt-1">
            <h5 className="text-xs font-bold text-slate-900">
              Specific Linguistic Suggestions ({data.linguisticSuggestions.length})
            </h5>

            <div className="space-y-2.5">
              {data.linguisticSuggestions.map((sug) => {
                const isApplied = appliedIds.includes(sug.id);

                return (
                  <div
                    key={sug.id}
                    className={`p-3 rounded-lg border text-xs space-y-2 transition-all ${
                      isApplied
                        ? 'border-slate-200 bg-slate-50 opacity-70'
                        : 'border-slate-200 bg-white shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-xs">{sug.headline}</span>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        {sug.impactDimension.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="p-1.5 rounded bg-rose-50 border border-rose-200 text-rose-900 font-mono">
                        "{sug.currentPhrase}"
                      </div>
                      <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900">
                        "{sug.proposedPhrase}"
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {sug.linguisticReason}
                    </p>

                    <div className="pt-1 flex items-center justify-end">
                      {isApplied ? (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Linguistic Shift Adopted</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(sug)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Adopt Shift</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
