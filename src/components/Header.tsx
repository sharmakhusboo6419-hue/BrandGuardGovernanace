import React from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  BarChart3, 
  FileCheck2, 
  Plus, 
  HardDrive
} from 'lucide-react';
import { UserRole, ContentDraft } from '../types/governance';

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
