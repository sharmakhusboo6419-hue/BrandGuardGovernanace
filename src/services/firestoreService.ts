import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { ContentDraft, UserRole, BrandFact } from '../types/governance';
import { User as FirebaseUser } from 'firebase/auth';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Catches Firestore security/operational errors and throws formatted JSON conforming to FirestoreErrorInfo
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Synchronize user profile in /users/{userId}
 */
export async function syncUserProfile(user: FirebaseUser, role: UserRole = 'creator'): Promise<void> {
  const userPath = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userDocRef);
    if (!existing.exists()) {
      await setDoc(userDocRef, {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Enterprise User',
        role,
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(userDocRef, {
        updatedAt: new Date().toISOString(),
        displayName: user.displayName || existing.data().displayName || 'Enterprise User',
        photoURL: user.photoURL || existing.data().photoURL || '',
      }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

/**
 * Subscribe to real-time content drafts from Firestore
 */
export function subscribeToDrafts(
  onDraftsChange: (drafts: ContentDraft[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'drafts';
  try {
    const draftsCol = collection(db, path);
    return onSnapshot(
      draftsCol,
      (snapshot) => {
        const loadedDrafts: ContentDraft[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loadedDrafts.push({
            id: docSnap.id,
            title: data.title || 'Untitled Draft',
            format: data.format || 'press_release',
            status: data.status || 'draft',
            targetAudience: data.targetAudience || 'Enterprise Stakeholders',
            author: data.author || {
              name: data.authorName || 'Staff Creator',
              type: 'internal_team',
            },
            confidentialMode: data.confidentialMode !== false,
            text: data.text || '',
            visualAssets: data.visualAssets || [],
            auditResult: data.auditResult || undefined,
            comments: data.comments || [],
            history: data.history || [],
            updatedAt: data.updatedAt || new Date().toISOString(),
          } as ContentDraft);
        });

        // Sort by updatedAt descending
        loadedDrafts.sort((a, b) => {
          const timeA = new Date(a.updatedAt || 0).getTime();
          const timeB = new Date(b.updatedAt || 0).getTime();
          return timeB - timeA;
        });

        onDraftsChange(loadedDrafts);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Persist or update a content draft to Firestore
 */
export async function saveDraftDoc(draft: ContentDraft, currentUserId?: string): Promise<void> {
  const docPath = `drafts/${draft.id}`;
  try {
    const docRef = doc(db, 'drafts', draft.id);
    const payload = {
      id: draft.id,
      title: draft.title,
      format: draft.format,
      text: draft.text,
      status: draft.status,
      authorId: currentUserId || auth.currentUser?.uid || 'anonymous_creator',
      authorName: draft.author?.name || auth.currentUser?.displayName || 'Creator',
      authorEmail: auth.currentUser?.email || 'creator@aegis-brand.internal',
      targetAudience: draft.targetAudience,
      confidentialMode: draft.confidentialMode,
      visualAssets: draft.visualAssets || [],
      auditResult: draft.auditResult || null,
      comments: draft.comments || [],
      history: draft.history || [],
      score: draft.auditResult?.score ?? null,
      criticalCount: draft.auditResult?.issues?.filter(i => i.severity === 'critical' && !i.applied && !i.justified).length ?? 0,
      warningCount: draft.auditResult?.issues?.filter(i => i.severity === 'warning' && !i.applied && !i.justified).length ?? 0,
      suggestionCount: draft.auditResult?.issues?.filter(i => i.severity === 'suggestion' && !i.applied && !i.justified).length ?? 0,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Delete a draft from Firestore
 */
export async function deleteDraftDoc(draftId: string): Promise<void> {
  const docPath = `drafts/${draftId}`;
  try {
    await deleteDoc(doc(db, 'drafts', draftId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * Subscribe to verified brand facts in the Fact Vault
 */
export function subscribeToFacts(
  onFactsChange: (facts: BrandFact[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'facts';
  try {
    const factsCol = collection(db, path);
    return onSnapshot(
      factsCol,
      (snapshot) => {
        const loaded: BrandFact[] = [];
        snapshot.forEach((snap) => {
          const d = snap.data();
          loaded.push({
            id: snap.id,
            category: (d.category as any) || 'performance',
            claim: d.claim || '',
            verifiedData: d.verifiedData || d.proof || '',
            citation: d.citation || d.citationUrl || 'Internal Verification Ledger',
            verifiedDate: d.verifiedDate || d.verifiedAt || new Date().toISOString().split('T')[0],
          });
        });
        onFactsChange(loaded);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Save a verified fact to Firestore
 */
export async function saveFactDoc(fact: BrandFact): Promise<void> {
  const path = `facts/${fact.id}`;
  try {
    await setDoc(doc(db, 'facts', fact.id), {
      id: fact.id,
      category: fact.category,
      claim: fact.claim,
      proof: fact.verifiedData,
      verifiedData: fact.verifiedData,
      citation: fact.citation,
      citationUrl: fact.citation,
      verifiedDate: fact.verifiedDate,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

