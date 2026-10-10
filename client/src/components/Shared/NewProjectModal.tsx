import React, { useState } from 'react';
import { X, FolderPlus, Sparkles } from 'lucide-react';
import { Template } from '../../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  onCreate: (name: string, description: string, language: string, templateId?: string) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  templates,
  onCreate
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || 'tpl-python');

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(
        name.trim(),
        description.trim(),
        selectedTemplate ? selectedTemplate.language : 'python',
        selectedTemplateId
      );
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderPlus size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Create New Project
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Project Name
              </label>
              <input
                autoFocus
                type="text"
                className="input"
                style={{ width: '100%' }}
                placeholder="e.g. Distributed Task Queue"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Description (Optional)
              </label>
              <input
                type="text"
                className="input"
                style={{ width: '100%' }}
                placeholder="Brief summary of this project..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Language & Starter Template
              </label>
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '4px' }}>
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: selectedTemplateId === tpl.id ? 'var(--bg-surface-elevated)' : 'transparent',
                      border: selectedTemplateId === tpl.id ? '1px solid var(--border-focus)' : '1px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{tpl.icon}</span>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{tpl.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tpl.category}</div>
                      </div>
                    </div>
                    <span className="badge badge-cyan" style={{ fontSize: '9px' }}>{tpl.language}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
