import React from 'react';
import { X, Settings, Moon, Sun, Type, Sliders, Command } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'vs-dark' | 'light';
  onThemeChange: (theme: 'vs-dark' | 'light') => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  tabSize: number;
  onTabSizeChange: (size: number) => void;
  minimap: boolean;
  onMinimapChange: (enabled: boolean) => void;
  wordWrap: 'on' | 'off';
  onWordWrapChange: (wrap: 'on' | 'off') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
  tabSize,
  onTabSizeChange,
  minimap,
  onMinimapChange,
  wordWrap,
  onWordWrapChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              IDE & Editor Settings
            </h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Theme */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Color Theme</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Choose your preferred interface theme</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className={`btn ${theme === 'vs-dark' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '12px' }}
                onClick={() => onThemeChange('vs-dark')}
              >
                <Moon size={13} />
                <span>Dark</span>
              </button>
              <button
                className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '12px' }}
                onClick={() => onThemeChange('light')}
              >
                <Sun size={13} />
                <span>Light</span>
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Editor Font Size</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Adjust Monaco Editor text scale</div>
            </div>
            <select
              className="select"
              value={fontSize}
              onChange={(e) => onFontSizeChange(parseInt(e.target.value, 10))}
              style={{ width: '80px' }}
            >
              {[12, 13, 14, 15, 16, 18, 20].map((s) => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>
          </div>

          {/* Tab Size */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Tab Size</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Indentation spaces count</div>
            </div>
            <select
              className="select"
              value={tabSize}
              onChange={(e) => onTabSizeChange(parseInt(e.target.value, 10))}
              style={{ width: '80px' }}
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>

          {/* Minimap */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Code Minimap</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Show visual miniature overview on the right</div>
            </div>
            <button
              className={`btn ${minimap ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 12px', fontSize: '12px' }}
              onClick={() => onMinimapChange(!minimap)}
            >
              {minimap ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Word Wrap */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Word Wrapping</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Wrap long lines to fit editor viewport</div>
            </div>
            <button
              className={`btn ${wordWrap === 'on' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 12px', fontSize: '12px' }}
              onClick={() => onWordWrapChange(wordWrap === 'on' ? 'off' : 'on')}
            >
              {wordWrap === 'on' ? 'On' : 'Off'}
            </button>
          </div>

          {/* Keyboard Shortcuts Cheatsheet */}
          <div style={{ marginTop: '8px', padding: '10px 12px', background: 'var(--bg-panel)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Command size={14} color="var(--accent-indigo)" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Keyboard Shortcuts
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <div><kbd style={{ background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: '3px' }}>Ctrl + Enter</kbd> Run Code</div>
              <div><kbd style={{ background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: '3px' }}>Ctrl + S</kbd> Save Project</div>
              <div><kbd style={{ background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: '3px' }}>Ctrl + F</kbd> Find & Replace</div>
              <div><kbd style={{ background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: '3px' }}>Alt + Click</kbd> Multi-Cursor</div>
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
