import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Folder, 
  FileText, 
  Download, 
  Upload, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  HardDrive,
  LogOut,
  User
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  googleSignIn, 
  logout 
} from '../services/googleAuth';
import { 
  listDriveFiles, 
  fetchDriveFileContent, 
  saveDraftToDrive, 
  deleteDriveFile, 
  DriveFileItem 
} from '../services/googleDrive';
import { ContentDraft } from '../types/governance';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  accessToken: string | null;
  onAuthSuccess: (user: FirebaseUser, token: string) => void;
  onAuthLogout: () => void;
  currentDraft: ContentDraft | null;
  onImportDraft: (importedDraft: Partial<ContentDraft>) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  accessToken,
  onAuthSuccess,
  onAuthLogout,
  currentDraft,
  onImportDraft,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'export'>('browse');
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'docs' | 'images'>('docs');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const [exportTitle, setExportTitle] = useState<string>('');
  const [exportAsDoc, setExportAsDoc] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedFileLink, setExportedFileLink] = useState<string | null>(null);

  // Destructive Confirmation Modal state
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);

  useEffect(() => {
    if (currentDraft) {
      setExportTitle(`[Aegis] ${currentDraft.title}`);
    }
  }, [currentDraft]);

  useEffect(() => {
    if (isOpen && accessToken && activeTab === 'browse') {
      loadFiles();
    }
  }, [isOpen, accessToken, activeTab, filterType]);

  const loadFiles = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const items = await listDriveFiles(accessToken, filterType, searchQuery);
      setFiles(items);
    } catch (err: any) {
      console.error('Error loading drive files:', err);
      setErrorMsg(err.message || 'Failed to fetch files from Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        onAuthSuccess(result.user, result.accessToken);
        setStatusNotice('Connected to Google Drive.');
        setTimeout(() => setStatusNotice(null), 2500);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setErrorMsg(err.message || 'Authentication with Google failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    onAuthLogout();
    setFiles([]);
    setStatusNotice('Signed out from Google Drive.');
    setTimeout(() => setStatusNotice(null), 2000);
  };

  const handleImportFile = async (file: DriveFileItem) => {
    if (!accessToken) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const content = await fetchDriveFileContent(accessToken, file.id, file.mimeType);
      
      let format: any = 'article';
      const lower = file.name.toLowerCase();
      if (lower.includes('press') || lower.includes('pr')) format = 'press_release';
      else if (lower.includes('social') || lower.includes('post')) format = 'social_carousel';
      else if (lower.includes('landing') || lower.includes('web')) format = 'landing_page';
      else if (lower.includes('newsletter') || lower.includes('email')) format = 'newsletter';

      onImportDraft({
        title: file.name.replace(/\.[^/.]+$/, ''),
        format,
        text: content,
        author: {
          name: currentUser?.displayName || 'Google Drive User',
          type: 'internal_team',
        },
      });

      setStatusNotice(`Imported "${file.name}"`);
      setTimeout(() => {
        setStatusNotice(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to import file:', err);
      setErrorMsg(err.message || 'Could not import file content from Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToDrive = async () => {
    if (!accessToken || !currentDraft) return;
    setIsExporting(true);
    setErrorMsg(null);
    setExportedFileLink(null);

    try {
      const fullDoc = `AEGIS BRAND GOVERNANCE
Title: ${currentDraft.title}
Format: ${currentDraft.format.toUpperCase()}
Score: ${currentDraft.auditResult?.score ?? 'Unchecked'}/100
Status: ${currentDraft.status.toUpperCase()}
Date: ${new Date().toLocaleDateString()}
------------------------------------------------------------

${currentDraft.text}
`;

      const result = await saveDraftToDrive(
        accessToken,
        exportTitle.trim() || currentDraft.title,
        fullDoc,
        exportAsDoc
      );

      if (result.webViewLink) {
        setExportedFileLink(result.webViewLink);
      }
      setStatusNotice('Saved to Google Drive.');
    } catch (err: any) {
      console.error('Failed to save to Google Drive:', err);
      setErrorMsg(err.message || 'Failed to export document to Google Drive');
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!accessToken || !fileToDelete) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      setFiles(files.filter(f => f.id !== fileToDelete.id));
      setStatusNotice(`Deleted "${fileToDelete.name}".`);
      setTimeout(() => setStatusNotice(null), 2500);
    } catch (err: any) {
      console.error('Delete failed:', err);
      setErrorMsg(err.message || 'Failed to delete file from Google Drive');
    } finally {
      setIsLoading(false);
      setFileToDelete(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl overflow-hidden text-slate-900">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Google Drive</h3>
              <p className="text-xs text-slate-500">Import drafts or save compliance-approved copies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth / Account Banner */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          {currentUser && accessToken ? (
            <div className="flex items-center gap-2.5">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-slate-300"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block leading-tight">
                  {currentUser.displayName || 'Connected Account'}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {currentUser.email}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <span>Sign in to access Google Drive files.</span>
            </div>
          )}

          <div>
            {currentUser && accessToken ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors border border-slate-200"
              >
                <LogOut className="w-3 h-3" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="gsi-material-button inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-medium px-3 py-1 rounded-md text-xs shadow-xs transition-all disabled:opacity-50"
              >
                <div className="gsi-material-button-content-wrapper flex items-center gap-1.5">
                  <div className="gsi-material-button-icon w-3.5 h-3.5">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-semibold text-slate-800 text-xs">
                    Sign in with Google
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Notices */}
        {errorMsg && (
          <div className="mx-4 mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {statusNotice && (
          <div className="mx-4 mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Main Content */}
        {!accessToken ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <HardDrive className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Sign in with Google to browse and import drafts or save clearance-approved documents to Drive.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center border-b border-slate-200 px-4 bg-white text-xs">
              <button
                onClick={() => setActiveTab('browse')}
                className={`py-2 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'browse'
                    ? 'border-blue-600 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Import Draft</span>
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`py-2 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'export'
                    ? 'border-blue-600 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Save to Drive</span>
              </button>
            </div>

            {/* Tab 1: Browse */}
            {activeTab === 'browse' && (
              <div className="flex-1 flex flex-col p-4 overflow-hidden space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search Drive files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadFiles()}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <button
                    onClick={loadFiles}
                    disabled={isLoading}
                    className="p-1.5 text-slate-500 hover:text-slate-800 bg-white rounded-lg border border-slate-200 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                  {isLoading ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      Loading files...
                    </div>
                  ) : files.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No documents found in Google Drive.
                    </div>
                  ) : (
                    files.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 flex items-center justify-between hover:bg-white transition-colors gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <h5 className="text-xs font-semibold text-slate-800 truncate">
                              {file.name}
                            </h5>
                            <span className="text-[10px] text-slate-400">
                              {file.mimeType.includes('document') ? 'Google Doc' : 'Text'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleImportFile(file)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                          >
                            Import
                          </button>
                          <button
                            onClick={() => setFileToDelete(file)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Export */}
            {activeTab === 'export' && (
              <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">Document Title</label>
                      <input
                        type="text"
                        value={exportTitle}
                        onChange={(e) => setExportTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 font-semibold block">Format</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="radio"
                            name="exportFormat"
                            checked={exportAsDoc}
                            onChange={() => setExportAsDoc(true)}
                            className="text-blue-600"
                          />
                          <span>Google Doc</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                          <input
                            type="radio"
                            name="exportFormat"
                            checked={!exportAsDoc}
                            onChange={() => setExportAsDoc(false)}
                            className="text-blue-600"
                          />
                          <span>Plain Text</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    {exportedFileLink ? (
                      <a
                        href={exportedFileLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Google Drive</span>
                      </a>
                    ) : (
                      <div />
                    )}

                    <button
                      onClick={handleExportToDrive}
                      disabled={isExporting || !currentDraft}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Upload className={`w-3.5 h-3.5 ${isExporting ? 'animate-spin' : ''}`} />
                      <span>{isExporting ? 'Saving...' : 'Save to Drive'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Destructive Action User Confirmation Modal */}
        {fileToDelete && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-4 space-y-3 shadow-2xl">
              <h4 className="text-sm font-bold text-slate-900">Delete Drive File?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Delete "{fileToDelete.name}" from Google Drive?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setFileToDelete(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
