import React from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  BarChart3, 
  FileCheck2, 
  Plus, 
  HardDrive,
  LogOut,
  Cloud,
  CheckCircle2,
  Database
} from 'lucide-react';
import { UserRole, ContentDraft } from '../types/governance';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeView: 'editor' | 'vault' | 'insights';
  onViewChange: (view: 'editor' | 'vault' | 'insights') => void;
  onNewDraft: () => void;
  onExportCertificate: () => void;
  activeDraft: ContentDraft | null;
  onOpenGoogleDrive: () => void;
  isDriveConnected: boolean;
  currentUser?: FirebaseUser | null;
  onSignInWithGoogle?: () => void;
  onSignOut?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeView,
  onViewChange,
  onNewDraft,
  onExportCertificate,
  activeDraft,
  onOpenGoogleDrive,
  isDriveConnected,
  currentUser,
  onSignInWithGoogle,
  onSignOut,
  isSyncing = false,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-15">
          {/* Brand Identity */}
          <div className="flex items-center space-x-6">
            <div 
              className="flex items-center space-x-2.5 cursor-pointer select-none" 
              onClick={() => onViewChange('editor')}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900">
                Aegis <span className="text-slate-500 font-normal">Governance</span>
              </span>
            </div>

            {/* Navigation tabs */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200">
              <button
                onClick={() => onViewChange('editor')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeView === 'editor'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Drafts & Review
              </button>
              <button
                onClick={() => onViewChange('vault')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeView === 'vault'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Guidelines & Facts
              </button>
              <button
                onClick={() => onViewChange('insights')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeView === 'insights'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                Insights
              </button>
            </nav>
          </div>

          {/* Right Actions: Role Switcher, Google Drive & Primary Buttons */}
          <div className="flex items-center space-x-2.5">
            {/* Google Drive Status Button */}
            <button
              onClick={onOpenGoogleDrive}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                isDriveConnected
                  ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <HardDrive className={`w-3.5 h-3.5 ${isDriveConnected ? 'text-blue-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Drive</span>
              {isDriveConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
              )}
            </button>

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold px-2 hidden sm:inline">
                Role
              </span>
              <button
                onClick={() => onRoleChange('creator')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                  currentRole === 'creator'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Creator
              </button>
              <button
                onClick={() => onRoleChange('reviewer')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                  currentRole === 'reviewer'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reviewer
              </button>
              <button
                onClick={() => onRoleChange('brand_manager')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                  currentRole === 'brand_manager'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Manager
              </button>
            </div>

            {/* Firestore Persistence Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-md">
              <Database className="w-3 h-3 text-blue-600" />
              <span>{isSyncing ? 'Syncing...' : 'Firestore'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            </div>

            {/* Google Authentication */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || 'User'} 
                      className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs flex items-center justify-center border border-blue-200">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                      {currentUser.displayName || 'Authorized User'}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignInWithGoogle}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Sign In</span>
              </button>
            )}

            {/* Export Certificate Button */}
            {activeDraft && (
              <button
                onClick={onExportCertificate}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                Certificate
              </button>
            )}

            {/* New Draft Button */}
            <button
              onClick={onNewDraft}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Draft</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
