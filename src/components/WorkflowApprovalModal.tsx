import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Printer,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { ContentDraft, UserRole, WorkflowStatus, CommentItem } from '../types/governance';

interface WorkflowApprovalModalProps {
  draft: ContentDraft;
  currentRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onUpdateDraft: (updated: Partial<ContentDraft>) => void;
}

export const WorkflowApprovalModal: React.FC<WorkflowApprovalModalProps> = ({
  draft,
  currentRole,
  isOpen,
  onClose,
  onUpdateDraft,
}) => {
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'history' | 'certificate'>('comments');

  if (!isOpen) return null;

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: CommentItem = {
      id: `comm-${Date.now()}`,
      authorName: currentRole === 'creator' ? 'Creator' : currentRole === 'reviewer' ? 'Legal Reviewer' : 'Brand Manager',
      authorRole: currentRole,
      text: newComment.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onUpdateDraft({
      comments: [...draft.comments, comment],
    });

    setNewComment('');
  };

  const handleStatusTransition = (newStatus: WorkflowStatus) => {
    const actor = currentRole === 'creator' ? 'Creator' : currentRole === 'reviewer' ? 'Reviewer' : 'Brand Manager';
    const description = 
      newStatus === 'in_review' ? 'Submitted for review' :
      newStatus === 'changes_requested' ? 'Changes requested' :
      newStatus === 'approved' ? 'Approved for distribution' :
      'Published to channels';

    onUpdateDraft({
      status: newStatus,
      approvedBy: newStatus === 'approved' ? `${actor}` : draft.approvedBy,
      approvedAt: newStatus === 'approved' ? new Date().toISOString() : draft.approvedAt,
      history: [
        {
          id: `status-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          authorName: actor,
          action: `Status: ${newStatus.replace('_', ' ').toUpperCase()}`,
          description,
        },
        ...draft.history,
      ],
    });
  };

  const score = draft.auditResult?.score ?? 0;
  const isScorePassing = score >= 80;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Review & Approval Workflow</h3>
              <p className="text-xs text-slate-500 line-clamp-1">{draft.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workflow State Bar */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Status
                </span>
                <span className="font-semibold text-slate-900 capitalize">
                  {draft.status.replace('_', ' ')}
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Compliance Score
                </span>
                <span className={`font-bold ${score >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {score}/100
                </span>
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="flex items-center gap-2">
              {draft.status === 'draft' && (
                <button
                  onClick={() => handleStatusTransition('in_review')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Submit for Review
                </button>
              )}

              {(draft.status === 'in_review' || draft.status === 'changes_requested') && (
                <>
                  <button
                    onClick={() => handleStatusTransition('changes_requested')}
                    className="px-2.5 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg"
                  >
                    Request Changes
                  </button>
                  <button
                    onClick={() => handleStatusTransition('approved')}
                    disabled={!isScorePassing}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-xs"
                  >
                    Approve
                  </button>
                </>
              )}

              {draft.status === 'approved' && (
                <button
                  onClick={() => handleStatusTransition('published')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Publish Content
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center border-b border-slate-200 px-4 bg-white text-xs">
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-2 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-blue-600 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Discussion ({draft.comments.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-600 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Audit History ({draft.history.length})
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`py-2 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'certificate'
                ? 'border-blue-600 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Clearance Certificate
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/40">
          {activeTab === 'comments' ? (
            <div className="space-y-3.5">
              <div className="space-y-2.5">
                {draft.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No comments recorded.
                  </p>
                ) : (
                  draft.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">{comment.authorName}</span>
                          <span className="text-slate-400">({comment.authorRole})</span>
                        </div>
                        <span className="text-slate-400">{comment.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment input */}
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Leave comment..."
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleAddComment}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'history' ? (
            <div className="space-y-2">
              {draft.history.map((entry) => (
                <div
                  key={entry.id}
                  className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-0.5 shadow-xs"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-blue-700">{entry.action}</span>
                    <span className="text-[11px] text-slate-400">{entry.timestamp}</span>
                  </div>
                  <p className="text-slate-700 text-[11px]">{entry.description}</p>
                </div>
              ))}
            </div>
          ) : (
            /* Digital Clearance Certificate View */
            <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 text-slate-800 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    AEGIS GOVERNANCE
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">Pre-Flight Brand Clearance Certificate</h4>
                  <span className="text-[11px] text-slate-500">
                    ID: AEC-{draft.id.toUpperCase()}-2026
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-black ${score >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {score}/100
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Title</span>
                  <span className="font-medium text-slate-800">{draft.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Format</span>
                  <span className="font-medium text-slate-800 capitalize">{draft.format.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Audience</span>
                  <span className="font-medium text-slate-800">{draft.targetAudience}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Confidential Scrubbing</span>
                  <span className="font-medium text-slate-800">{draft.confidentialMode ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                    Sign-Off
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">
                    {draft.approvedBy ? `Approved by ${draft.approvedBy}` : 'Pending Approval'}
                  </span>
                </div>
                {draft.approvedAt && (
                  <span className="text-[10px] text-slate-400">
                    {new Date(draft.approvedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="pt-1 flex items-center justify-end">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
