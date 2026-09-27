import React, { useState } from 'react';
import { X, Share2, Copy, Check, Globe, Lock, Users } from 'lucide-react';
import { Project, PresenceUser } from '../../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  presenceUsers: PresenceUser[];
  onTogglePublic: (isPublic: boolean) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  project,
  presenceUsers,
  onTogglePublic
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const shareUrl = project ? `${window.location.origin}/?project=${project.id}` : window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Share & Collaborate
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Project Share Link
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="input"
                readOnly
                value={shareUrl}
                style={{ flex: 1, fontSize: '12px', color: 'var(--text-primary)' }}
              />
              <button className="btn btn-secondary" onClick={handleCopy}>
                {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div style={{ padding: '12px', background: 'var(--bg-panel)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {project?.is_public ? <Globe size={18} color="var(--accent-emerald)" /> : <Lock size={18} color="var(--accent-amber)" />}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {project?.is_public ? 'Public Project' : 'Private Project'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {project?.is_public ? 'Anyone with the link can view and run code' : 'Only invited collaborators can access'}
                  </div>
                </div>
              </div>

              {project && (
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                  onClick={() => onTogglePublic(!project.is_public)}
                >
                  Make {project.is_public ? 'Private' : 'Public'}
                </button>
              )}
            </div>
          </div>

          {/* Active Collaborators */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Users size={15} color="var(--accent-cyan)" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Active in this Room ({presenceUsers.length})
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {presenceUsers.map((user, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface-elevated)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: user.color }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{user.username}</span>
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: '9px' }}>Online</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
