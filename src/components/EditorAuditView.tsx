import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Check, 
  RotateCcw, 
  Image as ImageIcon, 
  Lock, 
  Unlock, 
  Send, 
  SplitSquareVertical, 
  BookOpen, 
  Copy,
  Plus,
  HardDrive
} from 'lucide-react';
import { 
  ContentDraft, 
  UserRole, 
  AuditIssue, 
  IssueCategory, 
  IssueSeverity, 
  VisualAsset 
} from '../types/governance';

interface EditorAuditViewProps {
  draft: ContentDraft;
  currentRole: UserRole;
  onUpdateDraft: (updated: Partial<ContentDraft>) => void;
  onRunAudit: () => Promise<void>;
  isAuditing: boolean;
  onOpenWorkflow: () => void;
  onOpenVault: () => void;
  onOpenGoogleDrive?: () => void;
}

export const EditorAuditView: React.FC<EditorAuditViewProps> = ({
  draft,
  currentRole,
  onUpdateDraft,
  onRunAudit,
  isAuditing,
  onOpenWorkflow,
  onOpenVault,
  onOpenGoogleDrive,
}) => {
  const [activeTab, setActiveTab] = useState<'issues' | 'revised' | 'assets'>('issues');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const [justifyingIssueId, setJustifyingIssueId] = useState<string | null>(null);
  const [justificationText, setJustificationText] = useState<string>('');
  const [newAssetModalOpen, setNewAssetModalOpen] = useState<boolean>(false);
  const [newAssetName, setNewAssetName] = useState<string>('');
  const [newAssetAlt, setNewAssetAlt] = useState<string>('');
  const [copiedRevised, setCopiedRevised] = useState<boolean>(false);

  const audit = draft.auditResult;

  // Apply a single suggestion
  const handleApplyIssue = (issue: AuditIssue) => {
    if (!issue.flaggedText || !issue.suggestedReplacement) return;
    
    const currentText = draft.text;
    const newText = currentText.replace(issue.flaggedText, issue.suggestedReplacement);

    const updatedIssues = (draft.auditResult?.issues || []).map((i) =>
      i.id === issue.id ? { ...i, applied: true, justified: false } : i
    );

    const remainingCritical = updatedIssues.filter(i => i.severity === 'critical' && !i.applied && !i.justified).length;
    const remainingWarning = updatedIssues.filter(i => i.severity === 'warning' && !i.applied && !i.justified).length;
    const remainingSuggestion = updatedIssues.filter(i => i.severity === 'suggestion' && !i.applied && !i.justified).length;
    const deduction = remainingCritical * 18 + remainingWarning * 8 + remainingSuggestion * 3;
    const newScore = Math.max(20, Math.min(100, 100 - deduction));

    onUpdateDraft({
      text: newText,
      previousVersionText: currentText,
      auditResult: draft.auditResult
        ? {
            ...draft.auditResult,
            score: newScore,
            issues: updatedIssues,
          }
        : undefined,
      history: [
        {
          id: `rev-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          authorName: draft.author.name,
          action: 'Applied Correction',
          description: `Updated "${issue.flaggedText}"`,
        },
        ...draft.history,
      ],
      updatedAt: new Date().toISOString(),
    });
  };

  // Undo applied suggestion
  const handleUndoIssue = (issue: AuditIssue) => {
    if (!issue.suggestedReplacement || !issue.flaggedText) return;
    const currentText = draft.text;
    const restoredText = currentText.replace(issue.suggestedReplacement, issue.flaggedText);

    const updatedIssues = (draft.auditResult?.issues || []).map((i) =>
      i.id === issue.id ? { ...i, applied: false } : i
    );

    onUpdateDraft({
      text: restoredText,
      auditResult: draft.auditResult
        ? {
            ...draft.auditResult,
            issues: updatedIssues,
          }
        : undefined,
    });
  };

  // Justify exception
  const handleSaveJustification = (issueId: string) => {
    if (!justificationText.trim()) return;

    const updatedIssues = (draft.auditResult?.issues || []).map((i) =>
      i.id === issueId
        ? {
            ...i,
            justified: true,
            applied: false,
            justificationNote: justificationText.trim(),
          }
        : i
    );

    onUpdateDraft({
      auditResult: draft.auditResult
        ? {
            ...draft.auditResult,
            issues: updatedIssues,
          }
        : undefined,
      history: [
        {
          id: `just-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          authorName: draft.author.name,
          action: 'Overridden with Note',
          description: justificationText.trim(),
        },
        ...draft.history,
      ],
    });

    setJustifyingIssueId(null);
    setJustificationText('');
  };

  // Replace text with full revised copy
  const handleApplyFullRevised = () => {
    if (!draft.auditResult?.revisedText) return;
    const currentText = draft.text;
    const updatedIssues = (draft.auditResult.issues || []).map((i) => ({
      ...i,
      applied: true,
    }));

    onUpdateDraft({
      text: draft.auditResult.revisedText,
      previousVersionText: currentText,
      auditResult: {
        ...draft.auditResult,
        score: 98,
        issues: updatedIssues,
      },
      history: [
        {
          id: `full-rev-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          authorName: draft.author.name,
          action: 'Applied Full Rewrite',
          description: 'Adopted brand governance revised draft',
        },
        ...draft.history,
      ],
    });
  };

  const filteredIssues = (audit?.issues || []).filter((issue) => {
    if (categoryFilter === 'all') return true;
    return issue.category === categoryFilter;
  });

  const criticalIssues = (audit?.issues || []).filter(i => i.severity === 'critical' && !i.applied && !i.justified);
  const warningIssues = (audit?.issues || []).filter(i => i.severity === 'warning' && !i.applied && !i.justified);
  const suggestionIssues = (audit?.issues || []).filter(i => i.severity === 'suggestion' && !i.applied && !i.justified);

  const getCategoryLabel = (cat: IssueCategory) => {
    switch (cat) {
      case 'tone': return 'Voice & Tone';
      case 'terminology': return 'Terminology';
      case 'messaging': return 'Messaging';
      case 'unsupported_claims': return 'Claims & Facts';
      case 'accessibility': return 'Accessibility';
      case 'visual_consistency': return 'Visuals';
      case 'confidentiality': return 'Confidentiality';
      default: return cat;
    }
  };

  const getSeverityBadge = (sev: IssueSeverity) => {
    switch (sev) {
      case 'critical':
        return <span className="text-rose-600 font-semibold">Critical</span>;
      case 'warning':
        return <span className="text-amber-600 font-semibold">Warning</span>;
      case 'suggestion':
        return <span className="text-blue-600 font-semibold">Suggestion</span>;
    }
  };

  const handleAddVisualAsset = () => {
    if (!newAssetName.trim()) return;
    const newAsset: VisualAsset = {
      id: `vis-${Date.now()}`,
      name: newAssetName.trim(),
      type: 'banner',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      altText: newAssetAlt.trim(),
      colorPalette: ['#0F172A', '#2563EB', '#0D9488'],
      contrastScore: newAssetAlt.trim().length > 10 ? 'AAA' : 'Fail',
      aspectRatio: '16:9',
      hasLogo: true,
    };

    onUpdateDraft({
      visualAssets: [...draft.visualAssets, newAsset],
    });

    setNewAssetName('');
    setNewAssetAlt('');
    setNewAssetModalOpen(false);
  };

  const handleUpdateAssetAlt = (assetId: string, altText: string) => {
    const updated = draft.visualAssets.map(a => 
      a.id === assetId ? { ...a, altText, contrastScore: altText.trim().length > 5 ? ('AAA' as const) : ('Fail' as const) } : a
    );
    onUpdateDraft({ visualAssets: updated });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.75rem)] overflow-hidden bg-slate-50">
      {/* Top Draft Control Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Title and metadata */}
          <div className="space-y-0.5 flex-1 min-w-0">
            <input
              type="text"
              value={draft.title}
              onChange={(e) => onUpdateDraft({ title: e.target.value })}
              className="text-sm font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none w-full truncate py-0.5"
              placeholder="Draft title..."
            />
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="capitalize">{draft.format.replace('_', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span>Audience: {draft.targetAudience}</span>
              <span aria-hidden="true">·</span>
              <span>Author: {draft.author.name}</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Confidential Scrubbing Toggle */}
            <button
              onClick={() => onUpdateDraft({ confidentialMode: !draft.confidentialMode })}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                draft.confidentialMode
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {draft.confidentialMode ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Confidential Mode</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Public Mode</span>
                </>
              )}
            </button>

            {/* Diff toggle */}
            {draft.previousVersionText && (
              <button
                onClick={() => setShowDiff(!showDiff)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  showDiff
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>{showDiff ? 'Hide Diff' : 'Compare Diff'}</span>
              </button>
            )}

            {/* Run Intelligent Audit Button */}
            <button
              onClick={onRunAudit}
              disabled={isAuditing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Auditing...' : 'Run Audit'}</span>
            </button>

            {/* Workflow & Approval Button */}
            <button
              onClick={onOpenWorkflow}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" />
              <span>Workflow ({draft.comments.length})</span>
            </button>

            {/* Google Drive Action Button */}
            {onOpenGoogleDrive && (
              <button
                onClick={onOpenGoogleDrive}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                title="Google Drive import and save"
              >
                <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                <span>Drive</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace: 2-column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Editor & Visual Assets */}
        <div className="flex-1 flex flex-col border-r border-slate-200 bg-slate-50 overflow-y-auto">
          {/* Subheader tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-2 bg-white">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('issues')}
                className={`px-3 py-1 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'issues'
                    ? 'border-blue-600 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Draft Content
              </button>
              <button
                onClick={() => setActiveTab('assets')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'assets'
                    ? 'border-blue-600 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Visual Assets ({draft.visualAssets.length})</span>
              </button>
            </div>

            {/* Readability & stats */}
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>{draft.text.split(/\s+/).filter(Boolean).length} words</span>
              <span aria-hidden="true">·</span>
              <span>{audit?.readability?.gradeLevel || 'Grade 9'}</span>
              <span aria-hidden="true">·</span>
              <span>~{audit?.readability?.estimatedReadTimeMinutes || 1} min read</span>
            </div>
          </div>

          {/* Editor Body or Assets Body */}
          {activeTab === 'assets' ? (
            /* Visual Assets Manager */
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Brand Visual Assets</h3>
                  <p className="text-xs text-slate-500">
                    Verify visual consistency, brand colors, and alternative text.
                  </p>
                </div>
                <button
                  onClick={() => setNewAssetModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Asset</span>
                </button>
              </div>

              {draft.visualAssets.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-400 bg-white">
                  No visual assets attached.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {draft.visualAssets.map((asset) => {
                    const isAltMissing = !asset.altText || asset.altText.trim().length < 5;

                    return (
                      <div
                        key={asset.id}
                        className="border border-slate-200 bg-white rounded-xl p-4 space-y-3 shadow-xs"
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                          <img
                            src={asset.url}
                            alt={asset.altText || asset.name}
                            className="w-full h-full object-cover"
                          />
                          {asset.hasLogo && (
                            <div className="absolute top-2 right-2 bg-white/90 border border-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-700 font-medium">
                              Logo Present
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800">{asset.name}</span>
                            <span className="text-[11px] text-slate-500 capitalize">{asset.type}</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                            <span>Palette:</span>
                            <div className="flex items-center gap-1">
                              {asset.colorPalette.map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-3.5 h-3.5 rounded-full border border-slate-300"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Alt-text verification */}
                        <div className="space-y-1 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between text-[11px]">
                            <label className="text-slate-600 font-medium flex items-center gap-1">
                              <span>Alt-Text</span>
                              {isAltMissing ? (
                                <span className="text-rose-600 font-semibold">(Missing)</span>
                              ) : (
                                <span className="text-emerald-600 font-semibold">(Verified)</span>
                              )}
                            </label>
                          </div>
                          <input
                            type="text"
                            value={asset.altText}
                            onChange={(e) => handleUpdateAssetAlt(asset.id, e.target.value)}
                            placeholder="Describe image clearly..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : showDiff && draft.previousVersionText ? (
            /* Diff view */
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Comparison with previous draft version</span>
                <button
                  onClick={() => setShowDiff(false)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Return to editor
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 bg-white rounded-xl p-4 shadow-xs">
                  <span className="text-[11px] font-semibold text-rose-600 block mb-2">Previous Version</span>
                  <div className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed font-mono">
                    {draft.previousVersionText}
                  </div>
                </div>
                <div className="border border-slate-200 bg-white rounded-xl p-4 shadow-xs">
                  <span className="text-[11px] font-semibold text-emerald-600 block mb-2">Current Version</span>
                  <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-mono">
                    {draft.text}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Text Editor */
            <div className="flex-1 p-6 flex flex-col">
              <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <textarea
                  value={draft.text}
                  onChange={(e) => onUpdateDraft({ text: e.target.value })}
                  placeholder="Enter draft copy here..."
                  className="flex-1 w-full bg-white text-slate-900 text-sm leading-relaxed p-4 focus:outline-none resize-none font-sans"
                  rows={14}
                />

                {/* Flagged Phrases Strip */}
                {audit && audit.issues.length > 0 && (
                  <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-500">Flagged:</span>
                    {audit.issues.map((issue) => (
                      <button
                        key={issue.id}
                        onClick={() => {
                          setSelectedIssueId(issue.id);
                          setActiveTab('issues');
                        }}
                        className={`text-xs px-2 py-0.5 rounded border text-left transition-all ${
                          issue.applied
                            ? 'line-through text-slate-400 border-slate-200 bg-white'
                            : issue.justified
                            ? 'text-sky-700 border-sky-200 bg-sky-50'
                            : issue.severity === 'critical'
                            ? 'text-rose-700 border-rose-200 bg-rose-50 hover:border-rose-300'
                            : issue.severity === 'warning'
                            ? 'text-amber-800 border-amber-200 bg-amber-50 hover:border-amber-300'
                            : 'text-blue-700 border-blue-200 bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        <span className="font-semibold text-[11px]">"{issue.flaggedText}"</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Audit Inspector */}
        <div className="w-full lg:w-[440px] bg-white flex flex-col border-l border-slate-200 overflow-hidden">
          {/* Audit Score Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/60">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                  Compliance Score
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className={`text-2xl font-black ${
                    (audit?.score ?? 0) >= 80 ? 'text-emerald-600' : (audit?.score ?? 0) >= 60 ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {audit ? `${audit.score}` : '--'}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                  <span className={`text-xs font-medium ml-1.5 ${
                    (audit?.score ?? 0) >= 80 ? 'text-emerald-700' : (audit?.score ?? 0) >= 60 ? 'text-amber-700' : 'text-rose-700'
                  }`}>
                    {audit
                      ? audit.score >= 80
                        ? 'Ready to Publish'
                        : audit.score >= 60
                        ? 'Minor Changes'
                        : 'Blocked'
                      : 'Pending Audit'}
                  </span>
                </div>
              </div>

              {/* Counts */}
              <div className="text-right text-[11px] text-slate-500 space-y-0.5">
                <div>
                  <span className="text-rose-600 font-semibold">{criticalIssues.length}</span> Critical
                </div>
                <div>
                  <span className="text-amber-600 font-semibold">{warningIssues.length}</span> Warnings
                </div>
                <div>
                  <span className="text-blue-600 font-semibold">{suggestionIssues.length}</span> Suggestions
                </div>
              </div>
            </div>

            {audit?.summary && (
              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed border-t border-slate-200/80 pt-2">
                {audit.summary}
              </p>
            )}
          </div>

          {/* Tabs: Issues vs Full Revised */}
          <div className="flex items-center border-b border-slate-200 px-4 bg-white text-xs">
            <button
              onClick={() => setActiveTab('issues')}
              className={`py-2 px-3 font-medium border-b-2 transition-colors ${
                activeTab === 'issues'
                  ? 'border-blue-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Issues ({filteredIssues.length})
            </button>
            <button
              onClick={() => setActiveTab('revised')}
              className={`py-2 px-3 font-medium border-b-2 transition-colors ${
                activeTab === 'revised'
                  ? 'border-blue-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Full Cohesive Rewrite
            </button>
          </div>

          {/* Category Filter Controls */}
          {activeTab === 'issues' && (
            <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 overflow-x-auto flex items-center gap-1 text-xs">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter('unsupported_claims')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === 'unsupported_claims'
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Claims
              </button>
              <button
                onClick={() => setCategoryFilter('terminology')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === 'terminology'
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Terms
              </button>
              <button
                onClick={() => setCategoryFilter('tone')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === 'tone'
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tone
              </button>
              <button
                onClick={() => setCategoryFilter('confidentiality')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === 'confidentiality'
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Confidential
              </button>
            </div>
          )}

          {/* Issues List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
            {activeTab === 'revised' ? (
              <div className="space-y-3">
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Rewritten Copy
                    </span>
                    <button
                      onClick={() => {
                        if (audit?.revisedText) {
                          navigator.clipboard.writeText(audit.revisedText);
                          setCopiedRevised(true);
                          setTimeout(() => setCopiedRevised(false), 2000);
                        }
                      }}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedRevised ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {audit?.revisedText || 'Run audit to generate rewrite.'}
                  </div>
                  <button
                    onClick={handleApplyFullRevised}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Rewrite to Editor</span>
                  </button>
                </div>
              </div>
            ) : !audit ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Click "Run Audit" to analyze content.
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <p>No issues found for this filter.</p>
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const isSelected = selectedIssueId === issue.id;
                const isApplied = issue.applied;
                const isJustified = issue.justified;

                return (
                  <div
                    key={issue.id}
                    className={`border rounded-xl p-3.5 transition-all bg-white shadow-xs ${
                      isApplied
                        ? 'border-slate-200 opacity-60'
                        : isJustified
                        ? 'border-sky-300 bg-sky-50/30'
                        : isSelected
                        ? 'border-blue-600 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Category & Severity */}
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span>{getCategoryLabel(issue.category)}</span>
                        <span aria-hidden="true">·</span>
                        {getSeverityBadge(issue.severity)}
                      </div>
                      {isApplied && (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5">
                          <Check className="w-3 h-3" />
                          Applied
                        </span>
                      )}
                      {isJustified && (
                        <span className="text-[11px] text-sky-700 font-semibold">
                          Overridden
                        </span>
                      )}
                    </div>

                    {/* Headline */}
                    <h5 className="text-xs font-semibold text-slate-900 mb-2">
                      {issue.headline}
                    </h5>

                    {/* Flagged snippet vs suggestion */}
                    <div className="space-y-1.5 my-2 text-xs">
                      <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-900 font-mono text-[11px]">
                        "{issue.flaggedText}"
                      </div>
                      <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                        {issue.suggestedReplacement}
                      </div>
                    </div>

                    {/* Rationale */}
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {issue.explanation}
                    </p>

                    {/* Justification note if present */}
                    {isJustified && issue.justificationNote && (
                      <div className="mt-2 text-[11px] bg-sky-50 border border-sky-200 p-2 rounded text-sky-900">
                        <span className="font-semibold block text-[10px] text-sky-700">Audit Note:</span>
                        "{issue.justificationNote}"
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      {isApplied ? (
                        <button
                          onClick={() => handleUndoIssue(issue)}
                          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Undo</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApplyIssue(issue)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          <span>Accept</span>
                        </button>
                      )}

                      {!isApplied && !isJustified && (
                        <button
                          onClick={() => setJustifyingIssueId(issue.id)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                        >
                          Override
                        </button>
                      )}
                    </div>

                    {/* Override note form */}
                    {justifyingIssueId === issue.id && (
                      <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                        <input
                          type="text"
                          value={justificationText}
                          onChange={(e) => setJustificationText(e.target.value)}
                          placeholder="Reason for overriding..."
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setJustifyingIssueId(null);
                              setJustificationText('');
                            }}
                            className="px-2 py-0.5 text-[11px] text-slate-500 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveJustification(issue.id)}
                            className="px-2.5 py-0.5 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Visual Asset Modal */}
      {newAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-5 space-y-3.5 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">Attach Visual Asset</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Asset Name</label>
                <input
                  type="text"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="e.g. Architecture Diagram"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block mb-1">Alt-Text</label>
                <textarea
                  value={newAssetAlt}
                  onChange={(e) => setNewAssetAlt(e.target.value)}
                  placeholder="Describe image clearly..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white h-20"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setNewAssetModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVisualAsset}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Attach
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
