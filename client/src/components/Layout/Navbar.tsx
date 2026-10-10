import React from 'react';
import { Play, Save, Share2, Sparkles, Settings, User as UserIcon, LayoutTemplate, Layers, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { LanguageInfo, Project, User } from '../types';

interface NavbarProps {
  currentProject: Project | null;
  activeLanguage: string;
  languages: LanguageInfo[];
  onLanguageChange: (langId: string) => void;
  onRun: () => void;
  onSave: () => void;
  isRunning: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  aiPanelOpen: boolean;
  onToggleAIPanel: () => void;
  onOpenShare: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenTemplates: () => void;
  currentUser: User | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  activeLanguage,
  languages,
  onLanguageChange,
  onRun,
  onSave,
  isRunning,
  isSaving,
  hasUnsavedChanges,
  aiPanelOpen,
  onToggleAIPanel,
  onOpenShare,
  onOpenSettings,
  onOpenAuth,
  onOpenTemplates,
  currentUser
}) => {
  return (
    <header className="app-header">
      {/* Brand & Project Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="logo-section" onClick={onOpenTemplates} title="CollabCode IDE">
          <div className="logo-icon">CC</div>
          <span className="logo-text">CollabCode</span>
          <span className="logo-tag">IDE 4.0</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--border-medium)' }}>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentProject ? currentProject.name : 'Instant Playground'}
          </span>
          {hasUnsavedChanges ? (
            <span title="Unsaved changes" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-amber)', display: 'inline-block' }} />
          ) : (
            <span title="All changes saved" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)', display: 'inline-block' }} />
          )}
        </div>
      </div>

      {/* Center Controls: Language & Run */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <select
          className="select"
          value={activeLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          style={{ height: '34px', padding: '4px 10px', fontSize: '13px', minWidth: '130px' }}
        >
          {languages.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <button
          className="btn btn-run"
          onClick={onRun}
          disabled={isRunning}
          title="Run Code (Ctrl+Enter)"
          style={{ height: '34px' }}
        >
          {isRunning ? (
            <>
              <Loader2 size={16} className="spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play size={16} fill="white" />
              <span>Run</span>
            </>
          )}
        </button>

        <button
          className="btn btn-secondary"
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          title="Save Project (Ctrl+S)"
          style={{ height: '34px' }}
        >
          {isSaving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
          <span>{hasUnsavedChanges ? 'Save' : 'Saved'}</span>
        </button>
      </div>

      {/* Right Controls: Share, AI, Templates, Profile */}
      <div className="header-actions">
        <button
          className="btn btn-ghost"
          onClick={onOpenTemplates}
          title="Explore Starter Language Templates"
        >
          <LayoutTemplate size={16} />
          <span>Templates</span>
        </button>

        <button
          className="btn btn-ghost"
          onClick={onOpenShare}
          title="Share Project & Live Collaboration"
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>

        <button
          className={`btn ${aiPanelOpen ? 'btn-ai' : 'btn-secondary'}`}
          onClick={onToggleAIPanel}
          title="Toggle AI Assistant Panel"
        >
          <Sparkles size={16} />
          <span>AI Assist</span>
        </button>

        <button
          className="btn-icon"
          onClick={onOpenSettings}
          title="Editor & System Settings"
        >
          <Settings size={18} />
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenAuth}
          style={{ padding: '4px 10px', height: '34px' }}
        >
          <UserIcon size={15} />
          <span>{currentUser ? currentUser.username : 'Account'}</span>
        </button>
      </div>
    </header>
  );
};
