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
import { ContentDraft, UserRole, AuditResult, AuditIssue } from './types/governance';
import { INITIAL_DRAFTS } from './data/initialData';
import { testFirestoreConnection } from './services/firebase';
import { 
  subscribeToDrafts, 
  saveDraftDoc, 
  syncUserProfile 
} from './services/firestoreService';
import { initAuth, googleSignIn, logout, setAccessToken } from './services/googleAuth';
import { User as FirebaseUser } from 'firebase/auth';

const createLocalAudit = (draft: ContentDraft): AuditResult => {
  const issues: AuditIssue[] = [];
  const patterns = [
    { regex: /100%\s*(bug-free|unhackable|secure)/i, replacement: 'enterprise-grade reliability', category: 'unsupported_claims' as const, severity: 'critical' as const },
    { regex: /\bMagic\s+AI\b/i, replacement: 'Aegis Sentinel™ AI Engine', category: 'terminology' as const, severity: 'warning' as const },
    { regex: /\bBlackbox\b/i, replacement: 'Transparent Governance Model', category: 'terminology' as const, severity: 'warning' as const },
  ];
  patterns.forEach((pattern, index) => {
    const match = draft.text.match(pattern.regex);
    if (match) {
      issues.push({
        id: `local-${index}`,
        category: pattern.category,
        severity: pattern.severity,
        headline: `Review language: “${match[0]}”`,
        flaggedText: match[0],
        explanation: 'This local heuristic flags language that may need a brand review.',
        suggestedReplacement: pattern.replacement,
        brandRuleReference: 'Local governance heuristic',
      });
    }
  });
  const words = draft.text.split(/\s+/).filter(Boolean).length;
  const categoryBreakdown = {
    tone: { score: 96, count: 0 },
    terminology: { score: issues.some(i => i.category === 'terminology') ? 78 : 98, count: issues.filter(i => i.category === 'terminology').length },
    messaging: { score: 96, count: 0 },
    unsupported_claims: { score: issues.some(i => i.category === 'unsupported_claims') ? 62 : 98, count: issues.filter(i => i.category === 'unsupported_claims').length },
    accessibility: { score: 96, count: 0 },
    visual_consistency: { score: 96, count: 0 },
    confidentiality: { score: 96, count: 0 },
  };
  const score = Math.max(20, 100 - issues.reduce((total, issue) => total + (issue.severity === 'critical' ? 18 : 8), 0));
  return {
    score,
    summary: `Local governance check completed with ${issues.length} item(s) requiring attention.`,
    categoryBreakdown,
    issues,
    revisedText: draft.text,
    readability: {
      wordCount: words,
      sentenceCount: Math.max(1, draft.text.split(/[.!?]+/).filter(Boolean).length),
      readingEase: 72,
      gradeLevel: 'Grade 9',
      estimatedReadTimeMinutes: Math.max(1, Math.ceil(words / 220)),
    },
    toneRadar: { authority: 82, accessibility: 84, hypeLevel: 18, calmConfidence: 86, status: 'balanced' },
    verifiedClaims: [],
    engine: 'Local governance heuristic',
    auditedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
};

export default function App() {
  const [drafts, setDrafts] = useState<ContentDraft[]>(INITIAL_DRAFTS);
  const [selectedDraftId, setSelectedDraftId] = useState<string>('draft-pr-01');
  const [currentRole, setCurrentRole] = useState<UserRole>('creator');
  const [activeView, setActiveView] = useState<'editor' | 'vault' | 'insights'>('editor');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [firestoreError, setFirestoreError] = useState<boolean>(false);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState<boolean>(false);
  const [isNewDraftOpen, setIsNewDraftOpen] = useState<boolean>(false);

  // Google Drive & Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);

  const activeDraft = drafts.find((d) => d.id === selectedDraftId) || drafts[0];

  // Test Firestore connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setCurrentUser(user);
        setToken(token);
        setAccessToken(token);
        try {
          await syncUserProfile(user, currentRole);
        } catch (e) {
          console.warn('Initial user profile sync:', e);
        }
      },
      () => {
        setCurrentUser(null);
        setToken(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync role changes to user profile in Firestore
  const handleRoleChange = async (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (currentUser) {
      try {
        await syncUserProfile(currentUser, newRole);
      } catch (e) {
        console.warn('Role profile update:', e);
      }
    }
  };

  // Real-time Firestore synchronization for Drafts
  useEffect(() => {
    const unsubscribe = subscribeToDrafts(
      async (remoteDrafts) => {
        setFirestoreError(false);
        if (remoteDrafts.length === 0) {
          // Seed the initial drafts into Firestore if the collection is newly initialized
          setIsSyncing(true);
          try {
            for (const d of INITIAL_DRAFTS) {
              await saveDraftDoc(d, currentUser?.uid);
            }
          } catch (seedErr) {
            setFirestoreError(true);
            console.warn('Initial draft seeding notice:', seedErr);
          } finally {
            setIsSyncing(false);
          }
        } else {
          setDrafts(remoteDrafts);
          if (!remoteDrafts.some((d) => d.id === selectedDraftId) && remoteDrafts.length > 0) {
            setSelectedDraftId(remoteDrafts[0].id);
          }
        }
      },
      (err) => {
        setFirestoreError(true);
        console.warn('Firestore subscription status:', err.message);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Google Sign-In with Firebase Auth
  const handleGoogleSignIn = async () => {
    setIsSyncing(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setToken(res.accessToken);
        setAccessToken(res.accessToken);
        await syncUserProfile(res.user, currentRole);
      }
    } catch (err) {
      console.error('Google Sign-in error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setToken(null);
      setAccessToken(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Helper to run audit against the backend server
  const runAuditForDraft = async (targetDraft: ContentDraft) => {
    setIsAuditing(true);
    setAuditError(null);
    try {
      let result: AuditResult;
      if (import.meta.env.VITE_USE_REMOTE_AUDIT === 'true') {
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
        if (!response.ok) throw new Error(`Audit failed with status ${response.status}`);
        result = await response.json();
        result.auditedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        result = createLocalAudit(targetDraft);
      }

      const updatedDraft: ContentDraft = {
        ...targetDraft,
        auditResult: result,
        updatedAt: new Date().toISOString(),
        history: [
          {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            authorName: 'Aegis Sentinel Engine',
            action: 'Automated Audit',
            description: `Audit completed: Score ${result.score}/100 with ${result.issues.length} detected items.`,
          },
          ...targetDraft.history,
        ],
      };

      // Update local state
      setDrafts((prev) =>
        prev.map((d) => (d.id === targetDraft.id ? updatedDraft : d))
      );

      // Persist to Firestore
      try {
        await saveDraftDoc(updatedDraft, currentUser?.uid);
      } catch (err) {
        setFirestoreError(true);
        console.warn('Firestore draft update save:', err);
      }
    } catch {
      setAuditError('Audit service is unavailable. Your draft is still safe locally; try again shortly.');
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

  const handleUpdateDraft = async (updated: Partial<ContentDraft>) => {
    const updatedDraft: ContentDraft = {
      ...activeDraft,
      ...updated,
      updatedAt: new Date().toISOString(),
    };

    setDrafts((prev) =>
      prev.map((d) => (d.id === activeDraft.id ? updatedDraft : d))
    );

    setIsSyncing(true);
    try {
      await saveDraftDoc(updatedDraft, currentUser?.uid);
    } catch (err) {
      setFirestoreError(true);
      console.warn('Firestore update warning:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateDraft = async (newDraft: ContentDraft) => {
    setDrafts((prev) => [newDraft, ...prev]);
    setSelectedDraftId(newDraft.id);
    setActiveView('editor');

    setIsSyncing(true);
    try {
      await saveDraftDoc(newDraft, currentUser?.uid);
    } catch (err) {
      setFirestoreError(true);
      console.warn('Firestore draft creation save:', err);
    } finally {
      setIsSyncing(false);
    }

    // Run initial audit on newly staged draft
    runAuditForDraft(newDraft);
  };

  // Handle importing draft from Google Drive
  const handleImportFromDrive = async (imported: Partial<ContentDraft>) => {
    const newDraft: ContentDraft = {
      id: `draft-drive-${Date.now()}`,
      title: imported.title || 'Imported Drive Document',
      format: (imported.format as any) || 'press_release',
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

    setIsSyncing(true);
    try {
      await saveDraftDoc(newDraft, currentUser?.uid);
    } catch (err) {
      console.warn('Firestore import save:', err);
    } finally {
      setIsSyncing(false);
    }

    runAuditForDraft(newDraft);
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-slate-900 flex flex-col font-sans">
      {/* Universal Header with Google Auth & Firestore Indicators */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeView={activeView}
        onViewChange={setActiveView}
        onNewDraft={() => setIsNewDraftOpen(true)}
        onExportCertificate={() => setIsWorkflowOpen(true)}
        activeDraft={activeDraft}
        onOpenGoogleDrive={() => setIsDriveModalOpen(true)}
        isDriveConnected={!!(currentUser && accessToken)}
        currentUser={currentUser}
        onSignInWithGoogle={handleGoogleSignIn}
        onSignOut={handleSignOut}
        isSyncing={isSyncing}
        hasFirestoreError={firestoreError}
      />

      {/* Main View Area */}
      <main className="flex-1 flex min-w-0 overflow-auto lg:overflow-hidden flex-col lg:flex-row">
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
              auditError={auditError}
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
          syncUserProfile(user, currentRole);
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
