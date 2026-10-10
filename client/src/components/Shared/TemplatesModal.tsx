import React, { useState } from 'react';
import { X, LayoutTemplate, Sparkles, ArrowRight } from 'lucide-react';
import { Template } from '../../types';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSelectTemplate
}) => {
  if (!isOpen) return null;

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', 'General Purpose', 'Systems', 'Web & Scripting', 'Database'];

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(t.category.toLowerCase()));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '780px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutTemplate size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Starter Language Templates & Environments
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Category Pills */}
        <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '6px', overflowX: 'auto', background: 'var(--bg-panel)' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`nav-tab ${selectedCategory === cat ? 'active' : ''}`}
              style={{ fontSize: '12px', padding: '4px 10px' }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template Cards Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>{tpl.icon}</span>
                  <span className="badge badge-cyan" style={{ fontSize: '10px' }}>{tpl.language}</span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {tpl.name}
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
                  {tpl.description}
                </p>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Compiler: {tpl.compiler_info}
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ marginTop: '12px', width: '100%', fontSize: '12px', padding: '6px 10px' }}
                onClick={() => {
                  onSelectTemplate(tpl);
                  onClose();
                }}
              >
                <span>Launch Template</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
