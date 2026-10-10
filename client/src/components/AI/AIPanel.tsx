import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Wrench,
  HelpCircle,
  Zap,
  Bug,
  Split,
  TestTube2,
  FileText,
  Languages,
  ShieldCheck,
  Check,
  Copy,
  ArrowRight,
  X,
  Loader2
} from 'lucide-react';
import { AIMessage, ProjectFile } from '../types';

interface AIPanelProps {
  messages: AIMessage[];
  isProcessing: boolean;
  onSendAction: (action: string, prompt?: string, targetLanguage?: string) => void;
  onApplyCode: (code: string) => void;
  onClose: () => void;
  activeFile: ProjectFile | null;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  messages,
  isProcessing,
  onSendAction,
  onApplyCode,
  onClose,
  activeFile
}) => {
  const [chatPrompt, setChatPrompt] = useState('');
  const [showConvertSelect, setShowConvertSelect] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatPrompt.trim() && !isProcessing) {
      onSendAction('chat', chatPrompt.trim());
      setChatPrompt('');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <aside className="ai-panel">
      {/* AI Panel Header */}
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--accent-indigo)" />
          <span style={{ color: 'var(--text-primary)' }}>AI Assistant</span>
          <span className="badge badge-indigo" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontSize: '9px' }}>
            Active
          </span>
        </div>

        <button className="btn-icon" onClick={onClose} title="Collapse AI Panel">
          <X size={16} />
        </button>
      </div>

      {/* Quick Actions Grid */}
      <div className="ai-quick-actions">
        <button
          className="btn btn-secondary"
          style={{ fontSize: '11px', padding: '3px 8px' }}
          onClick={() => onSendAction('explain')}
          disabled={isProcessing}
        >
          <HelpCircle size={13} color="var(--accent-cyan)" />
          <span>Explain</span>
        </button>

        <button
          className="btn btn-secondary"
          style={{ fontSize: '11px', padding: '3px 8px' }}
          onClick={() => onSendAction('fix')}
          disabled={isProcessing}
        >
          <Wrench size={13} color="var(--accent-emerald)" />
          <span>Fix</span>
        </button>

        <button
          className="btn btn-secondary"
          style={{ fontSize: '11px', padding: '3px 8px' }}
          onClick={() => onSendAction('optimize')}
          disabled={isProcessing}
        >
          <Zap size={13} color="var(--accent-amber)" />
          <span>Optimize</span>
        </button>

        <button
          className="btn btn-secondary"
          style={{ fontSize: '11px', padding: '3px 8px' }}
          onClick={() => onSendAction('refactor')}
          disabled={isProcessing}
        >
          <Split size={13} color="#a78bfa" />
          <span>Refactor</span>
        </button>

        <button
          className="btn btn-secondary"
          style={{ fontSize: '11px', padding: '3px 8px' }}
          onClick={() => onSendAction('test')}
          disabled={isProcessing}
        >
          <TestTube2 size={13} color="#34d399" />
          <span>Tests</span>
        </button>

        <button
          className="btn btn-secondary"
          style={{ fontSize: '11px', padding: '3px 8px' }}
          onClick={() => onSendAction('review')}
          disabled={isProcessing}
        >
          <ShieldCheck size={13} color="#f472b6" />
          <span>Review</span>
        </button>

        <button
          className="btn btn-secondary"
          style={{ fontSize: '11px', padding: '3px 8px' }}
          onClick={() => onSendAction('document')}
          disabled={isProcessing}
        >
          <FileText size={13} color="var(--text-secondary)" />
          <span>Docs</span>
        </button>

        <button
          className="btn btn-secondary"
          style={{ fontSize: '11px', padding: '3px 8px' }}
          onClick={() => setShowConvertSelect(!showConvertSelect)}
          disabled={isProcessing}
        >
          <Languages size={13} color="var(--accent-cyan)" />
          <span>Convert</span>
        </button>
      </div>

      {/* Target Language Submenu for Conversion */}
      {showConvertSelect && (
        <div style={{ padding: '6px 12px', background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target:</span>
          {['python', 'javascript', 'typescript', 'cpp', 'go', 'rust'].map(lang => (
            <button
              key={lang}
              className="btn btn-ghost"
              style={{ padding: '2px 6px', fontSize: '10px' }}
              onClick={() => {
                setShowConvertSelect(false);
                onSendAction('convert', undefined, lang);
              }}
            >
              {lang}
            </button>
          ))}
        </div>
      )}

      {/* AI Conversation Stream */}
      <div className="ai-messages-container">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)' }}>
            <Sparkles size={32} color="var(--accent-indigo)" style={{ margin: '0 auto 12px', display: 'block' }} />
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>CollabCode AI Assistant</h4>
            <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
              I understand your active file (<b>{activeFile ? activeFile.name : 'Editor'}</b>), compiler diagnostics, and workspace structure. Click an action above or type below!
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`ai-bubble ${msg.role}`}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: msg.role === 'assistant' ? 'var(--accent-indigo)' : 'var(--text-secondary)' }}>
                {msg.role === 'assistant' ? '🤖 CollabCode AI' : '👤 You'}
              </span>
              <button
                className="btn-icon"
                style={{ width: '20px', height: '20px' }}
                onClick={() => handleCopy(msg.content, msg.id)}
                title="Copy message text"
              >
                {copiedId === msg.id ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
              </button>
            </div>

            {/* Explanation / Content */}
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px' }}>
              {msg.content}
            </div>

            {/* Code Diff Box & Apply Actions */}
            {msg.code_diff && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Proposed Diff:
                  </span>
                  {msg.proposedCode && (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '3px 10px', fontSize: '11px' }}
                      onClick={() => onApplyCode(msg.proposedCode!)}
                      title="Apply this generated code into the active editor"
                    >
                      <Check size={12} />
                      <span>Apply to Editor</span>
                    </button>
                  )}
                </div>

                <pre className="diff-container">
                  {msg.code_diff.split('\n').map((line, i) => {
                    let className = '';
                    if (line.startsWith('+')) className = 'diff-line-add';
                    else if (line.startsWith('-')) className = 'diff-line-del';
                    else if (line.startsWith('@@')) className = 'diff-line-info';
                    return (
                      <div key={i} className={className}>
                        {line}
                      </div>
                    );
                  })}
                </pre>
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="ai-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Loader2 size={16} className="spin" color="var(--accent-indigo)" />
            <span style={{ fontSize: '12px' }}>Thinking and analyzing code context...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendChat} className="ai-input-area">
        <input
          type="text"
          className="input"
          placeholder="Ask AI anything about your code..."
          value={chatPrompt}
          onChange={(e) => setChatPrompt(e.target.value)}
          disabled={isProcessing}
          style={{ flex: 1, fontSize: '12px', height: '34px' }}
        />
        <button
          type="submit"
          className="btn btn-ai"
          disabled={!chatPrompt.trim() || isProcessing}
          style={{ height: '34px', padding: '0 12px' }}
        >
          <Send size={14} />
        </button>
      </form>
    </aside>
  );
};
