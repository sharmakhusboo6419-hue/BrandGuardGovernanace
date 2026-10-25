import React, { useState } from 'react';
import { Search, Plus, FileText, Share2, Globe, Mail } from 'lucide-react';
import { ContentDraft, ContentFormat, WorkflowStatus } from '../types/governance';

interface DraftListProps {
  drafts: ContentDraft[];
  selectedDraftId: string;
  onSelectDraft: (id: string) => void;
  onNewDraft: () => void;
}

export const DraftList: React.FC<DraftListProps> = ({
  drafts,
  selectedDraftId,
  onSelectDraft,
  onNewDraft,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('all');

  const filteredDrafts = drafts.filter((draft) => {
    const matchesSearch =
      draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFormat = formatFilter === 'all' || draft.format === formatFilter;
    return matchesSearch && matchesFormat;
  });

  const getFormatIcon = (format: ContentFormat) => {
    switch (format) {
      case 'press_release':
        return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      case 'social_carousel':
        return <Share2 className="w-3.5 h-3.5 text-violet-600" />;
      case 'landing_page':
        return <Globe className="w-3.5 h-3.5 text-emerald-600" />;
      case 'newsletter':
        return <Mail className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatFormatName = (format: ContentFormat) => {
    switch (format) {
      case 'press_release': return 'Press Release';
      case 'social_carousel': return 'Social';
      case 'landing_page': return 'Web Page';
      case 'newsletter': return 'Newsletter';
      default: return 'Article';
    }
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'approved': return 'text-emerald-700 font-medium';
      case 'in_review': return 'text-amber-700 font-medium';
      case 'changes_requested': return 'text-rose-700 font-medium';
      case 'published': return 'text-blue-700 font-medium';
      default: return 'text-slate-500 font-medium';
    }
  };

  const getStatusLabel = (status: WorkflowStatus) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'in_review': return 'In Review';
      case 'changes_requested': return 'Changes';
      case 'published': return 'Published';
      default: return 'Draft';
    }
  };

  return (
    <div className="w-76 border-r border-slate-200 bg-white flex flex-col h-[calc(100vh-3.75rem)] select-none">
      {/* Search and Filter */}
      <div className="p-3 border-b border-slate-200 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search drafts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs pb-0.5">
          <button
            onClick={() => setFormatFilter('all')}
            className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
              formatFilter === 'all'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFormatFilter('press_release')}
            className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
              formatFilter === 'press_release'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            PR
          </button>
          <button
            onClick={() => setFormatFilter('social_carousel')}
            className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
              formatFilter === 'social_carousel'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Social
          </button>
          <button
            onClick={() => setFormatFilter('landing_page')}
            className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
              formatFilter === 'landing_page'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Web
          </button>
        </div>
      </div>

      {/* Drafts List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredDrafts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No drafts found.
          </div>
        ) : (
          filteredDrafts.map((draft) => {
            const isSelected = draft.id === selectedDraftId;
            const score = draft.auditResult?.score;

            return (
              <div
                key={draft.id}
                onClick={() => onSelectDraft(draft.id)}
                className={`p-3 cursor-pointer transition-colors border-l-2 text-left ${
                  isSelected
                    ? 'bg-blue-50/50 border-blue-600'
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                {/* Format and Status */}
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    {getFormatIcon(draft.format)}
                    <span className="font-medium">{formatFormatName(draft.format)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={getStatusColor(draft.status)}>
                      {getStatusLabel(draft.status)}
                    </span>
                    {score !== undefined && (
                      <span className={`font-semibold ${score >= 80 ? 'text-emerald-700' : score >= 60 ? 'text-amber-700' : 'text-rose-700'}`}>
                        {score}
                      </span>
                    )}
                  </div>
                </div>

                {/* Draft Title */}
                <h4 className="text-xs font-semibold text-slate-900 line-clamp-1 mb-1">
                  {draft.title}
                </h4>

                {/* Text excerpt */}
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-1.5">
                  {draft.text}
                </p>

                {/* Author attribution metadata */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="truncate max-w-[120px]">{draft.author.name}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {draft.author.type === 'ai_drafter'
                      ? 'AI'
                      : draft.author.type === 'external_agency'
                      ? 'Agency'
                      : 'Internal'}
                  </span>
                  {draft.confidentialMode && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-rose-600 font-medium">Confidential</span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer count */}
      <div className="p-2.5 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
        <span>{filteredDrafts.length} drafts</span>
        <button
          onClick={onNewDraft}
          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          <span>New</span>
        </button>
      </div>
    </div>
  );
};
