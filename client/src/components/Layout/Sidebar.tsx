import React, { useState } from 'react';
import { FileCode, FilePlus, FolderPlus, Trash2, Search, Users, Copy, Star, Download, ChevronRight } from 'lucide-react';
import { ProjectFile, Project, PresenceUser } from '../types';

interface SidebarProps {
  currentProject: Project | null;
  files: ProjectFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name: string) => void;
  onDeleteFile: (fileId: string) => void;
  onDuplicateProject: () => void;
  onNewProject: () => void;
  presenceUsers: PresenceUser[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentProject,
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onDuplicateProject,
  onNewProject,
  presenceUsers
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName('');
      setIsCreatingFile(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.py')) return '🐍';
    if (fileName.endsWith('.js') || fileName.endsWith('.ts')) return '⚡';
    if (fileName.endsWith('.c') || fileName.endsWith('.cpp')) return '⚙️';
    if (fileName.endsWith('.java')) return '☕';
    if (fileName.endsWith('.go')) return '🐹';
    if (fileName.endsWith('.rs')) return '🦀';
    if (fileName.endsWith('.html')) return '🌐';
    if (fileName.endsWith('.css')) return '🎨';
    if (fileName.endsWith('.sql')) return '🗄️';
    if (fileName.endsWith('.md')) return '📝';
    return '📄';
  };

  return (
    <aside className="sidebar-panel">
      {/* Sidebar Header */}
      <div className="panel-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Files</span>
          <span className="badge badge-cyan" style={{ fontSize: '10px' }}>{files.length}</span>
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="btn-icon"
            onClick={() => setIsCreatingFile(true)}
            title="Create New File"
          >
            <FilePlus size={15} />
          </button>
          <button
            className="btn-icon"
            onClick={onNewProject}
            title="Create New Project"
          >
            <FolderPlus size={15} />
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: '8px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search files..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '28px', height: '28px', fontSize: '12px' }}
          />
        </div>
      </div>

      {/* Inline Create File Input */}
      {isCreatingFile && (
        <form onSubmit={handleCreateSubmit} style={{ padding: '8px 10px', background: 'var(--bg-panel)' }}>
          <input
            autoFocus
            type="text"
            className="input"
            placeholder="e.g. helper.py, utils.js"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            style={{ width: '100%', height: '28px', fontSize: '12px', marginBottom: '6px' }}
          />
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => setIsCreatingFile(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '11px' }}>
              Create
            </button>
          </div>
        </form>
      )}

      {/* File List Tree */}
      <div className="file-tree">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className={`file-item ${file.id === activeFileId ? 'active' : ''}`}
            onClick={() => onSelectFile(file.id)}
          >
            <div className="file-name">
              <span>{getFileIcon(file.name)}</span>
              <span>{file.name}</span>
              {file.is_entry ? (
                <span title="Entry Point">
                  <Star size={11} fill="var(--accent-amber)" color="var(--accent-amber)" />
                </span>
              ) : null}
            </div>

            <div className="file-actions" onClick={(e) => e.stopPropagation()}>
              {files.length > 1 && (
                <button
                  className="btn-icon"
                  style={{ width: '22px', height: '22px' }}
                  onClick={() => onDeleteFile(file.id)}
                  title="Delete File"
                >
                  <Trash2 size={13} color="var(--accent-rose)" />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredFiles.length === 0 && (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No files found matching filter.
          </div>
        )}
      </div>

      {/* Live Collaboration Presence Bar */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-panel)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Collaborators ({presenceUsers.length})
          </span>
          <Users size={14} color="var(--accent-cyan)" />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {presenceUsers.map((u, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-surface-elevated)',
                border: `1px solid ${u.color}40`,
                fontSize: '11px',
                color: 'var(--text-primary)'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: u.color }} />
              <span>{u.username}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
