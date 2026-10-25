/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DraftList } from './components/DraftList';
import { EditorAuditView } from './components/EditorAuditView';
import { WorkflowApprovalModal } from './components/WorkflowApprovalModal';
import { GuidelineVaultView } from './components/GuidelineVaultView';
import { InsightsClarityView } from './components/InsightsClarityView';
import { NewDraftModal } from './components/NewDraftModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { ContentDraft, UserRole, AuditResult } from './types/governance';
import { INITIAL_DRAFTS } from './data/initialData';
import { initAuth, setAccessToken } from './services/googleAuth';
import { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [drafts, setDrafts] = useState<ContentDraft[]>(INITIAL_DRAFTS);
  const [selectedDraftId, setSelectedDraftId] = useState<string>('draft-pr-01');
  const [currentRole, setCurrentRole] = useState<UserRole>('creator');
  const [activeView, setActiveView] = useState<'editor' | 'vault' | 'insights'>('editor');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState<boolean>(false);
  const [isNewDraftOpen, setIsNewDraftOpen] = useState<boolean>(false);

  // Google Drive & Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);

  const activeDraft = drafts.find((d) => d.id === selectedDraftId) || drafts[0];

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setToken(token);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setToken(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Helper to run audit against the backend server
  const runAuditForDraft = async (targetDraft: ContentDraft) => {
    setIsAuditing(true);
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: targetDraft.title,
          format: targetDraft.format,
          text: targetDraft.text,
          visualAssets: targetDraft.visualAssets,
          targetAudience: targetDraft.targetAudience,
          confidentialMode: targetDraft.confidentialMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Audit failed with status ${response.status}`);
      }

      const result: AuditResult = await response.json();
      result.auditedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Update target draft with audit result
      setDrafts((prev) =>
        prev.map((d) =>
          d.id === targetDraft.id
            ? {
                ...d,
                auditResult: result,
                history: [
                  {
                    id: `audit-${Date.now()}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    authorName: 'Aegis Sentinel Engine',
                    action: 'Automated Audit',
                    description: `Audit completed: Score ${result.score}/100 with ${result.issues.length} detected items.`,
                  },
                  ...d.history,
                ],
              }
            : d
        )
      );
    } catch (err) {
      console.error('Audit execution error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  // Run audit on the first draft when component mounts if not yet audited
  useEffect(() => {
    const firstDraft = drafts.find((d) => d.id === 'draft-pr-01');
    if (firstDraft && !firstDraft.auditResult) {
      runAuditForDraft(firstDraft);
    }
  }, []);

  const handleUpdateDraft = (updated: Partial<ContentDraft>) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === activeDraft.id ? { ...d, ...updated } : d))
    );
  };

  const handleCreateDraft = (newDraft: ContentDraft) => {
    setDrafts((prev) => [newDraft, ...prev]);
    setSelectedDraftId(newDraft.id);
    setActiveView('editor');
    // Run initial audit on newly staged draft
    runAuditForDraft(newDraft);
  };

  // Handle importing draft from Google Drive
  const handleImportFromDrive = (imported: Partial<ContentDraft>) => {
    const newDraft: ContentDraft = {
      id: `draft-drive-${Date.now()}`,
      title: imported.title || 'Imported Drive Document',
      format: imported.format || 'article',
      status: 'draft',
      targetAudience: 'Enterprise Readers & Stakeholders',
      author: imported.author || {
        name: currentUser?.displayName || 'Google Drive User',
        type: 'internal_team',
      },
      confidentialMode: true,
      text: imported.text || '',
      visualAssets: [
        {
          id: `vis-drive-${Date.now()}`,
          name: 'Imported Document Header',
          type: 'banner',
          url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
          altText: 'Document banner preview from Google Drive',
          colorPalette: ['#0F172A', '#2563EB', '#0D9488'],
          contrastScore: 'AAA',
          aspectRatio: '16:9',
          hasLogo: true,
        }
      ],
      comments: [],
      history: [
        {
          id: `h-drive-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          authorName: currentUser?.displayName || 'Drive Author',
          action: 'Imported from Google Drive',
          description: `Loaded file "${imported.title}" directly from Google Drive for brand compliance review`,
        }
      ],
      updatedAt: new Date().toISOString(),
    };

    setDrafts((prev) => [newDraft, ...prev]);
    setSelectedDraftId(newDraft.id);
    setActiveView('editor');
    runAuditForDraft(newDraft);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Universal Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeView={activeView}
        onViewChange={setActiveView}
        onNewDraft={() => setIsNewDraftOpen(true)}
        onExportCertificate={() => setIsWorkflowOpen(true)}
        activeDraft={activeDraft}
        onOpenGoogleDrive={() => setIsDriveModalOpen(true)}
        isDriveConnected={!!(currentUser && accessToken)}
      />

      {/* Main View Area */}
      <main className="flex-1 flex overflow-hidden">
        {activeView === 'editor' && (
          <>
            <DraftList
              drafts={drafts}
              selectedDraftId={activeDraft.id}
              onSelectDraft={(id) => {
                setSelectedDraftId(id);
                const target = drafts.find((d) => d.id === id);
                if (target && !target.auditResult) {
                  runAuditForDraft(target);
                }
              }}
              onNewDraft={() => setIsNewDraftOpen(true)}
            />
            <EditorAuditView
              draft={activeDraft}
              currentRole={currentRole}
              onUpdateDraft={handleUpdateDraft}
              onRunAudit={() => runAuditForDraft(activeDraft)}
              isAuditing={isAuditing}
              onOpenWorkflow={() => setIsWorkflowOpen(true)}
              onOpenVault={() => setActiveView('vault')}
              onOpenGoogleDrive={() => setIsDriveModalOpen(true)}
            />
          </>
        )}

        {activeView === 'vault' && <GuidelineVaultView />}

        {activeView === 'insights' && <InsightsClarityView />}
      </main>

      {/* Collaborative Review & Approval Drawer/Modal */}
      <WorkflowApprovalModal
        draft={activeDraft}
        currentRole={currentRole}
        isOpen={isWorkflowOpen}
        onClose={() => setIsWorkflowOpen(false)}
        onUpdateDraft={handleUpdateDraft}
      />

      {/* New Draft Staging Modal */}
      <NewDraftModal
        isOpen={isNewDraftOpen}
        onClose={() => setIsNewDraftOpen(false)}
        onCreateDraft={handleCreateDraft}
      />

      {/* Google Drive Integration Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        currentUser={currentUser}
        accessToken={accessToken}
        onAuthSuccess={(user, token) => {
          setCurrentUser(user);
          setToken(token);
          setAccessToken(token);
        }}
        onAuthLogout={() => {
          setCurrentUser(null);
          setToken(null);
          setAccessToken(null);
        }}
        currentDraft={activeDraft}
        onImportDraft={handleImportFromDrive}
      />
    </div>
  );
}
