import React, { useState } from 'react';
import { Terminal, AlertTriangle, Play, Sparkles, Clock, HardDrive, CornerDownLeft, Eye, CheckCircle2, RotateCcw } from 'lucide-react';
import { ExecutionResult, Diagnostic } from '../types';

interface OutputDockProps {
  result: ExecutionResult | null;
  isRunning: boolean;
  activeLanguage: string;
  stdin: string;
  onStdinChange: (val: string) => void;
  onNavigateToLine: (line: number) => void;
  onAskAIToFix: (errorText: string, line?: number) => void;
  htmlPreviewCode?: string;
}

export const OutputDock: React.FC<OutputDockProps> = ({
  result,
  isRunning,
  activeLanguage,
  stdin,
  onStdinChange,
  onNavigateToLine,
  onAskAIToFix,
  htmlPreviewCode
}) => {
  const [activeTab, setActiveTab] = useState<'output' | 'errors' | 'stdin' | 'preview'>('output');

  const hasErrors = result && (result.exitCode !== 0 || result.diagnostics.length > 0 || result.stderr.length > 0);
  const isWebLanguage = activeLanguage === 'html' || activeLanguage === 'css';

  return (
    <div className="output-dock">
      {/* Dock Header Tabs */}
      <div className="dock-header">
        <div className="dock-tabs">
          <button
            className={`dock-tab ${activeTab === 'output' ? 'active' : ''}`}
            onClick={() => setActiveTab('output')}
          >
            <Terminal size={14} />
            <span>Output</span>
            {result && result.exitCode === 0 && <span className="badge badge-emerald" style={{ fontSize: '9px', padding: '1px 4px' }}>OK</span>}
          </button>

          <button
            className={`dock-tab ${activeTab === 'errors' ? 'active' : ''}`}
            onClick={() => setActiveTab('errors')}
          >
            <AlertTriangle size={14} color={hasErrors ? 'var(--accent-rose)' : 'inherit'} />
            <span>Errors</span>
            {hasErrors && (
              <span className="badge badge-rose" style={{ fontSize: '9px', padding: '1px 4px' }}>
                {result?.diagnostics.length || 1}
              </span>
            )}
          </button>

          <button
            className={`dock-tab ${activeTab === 'stdin' ? 'active' : ''}`}
            onClick={() => setActiveTab('stdin')}
          >
            <CornerDownLeft size={14} />
            <span>Stdin {stdin.trim() ? '(active)' : ''}</span>
          </button>

          {isWebLanguage && (
            <button
              className={`dock-tab ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <Eye size={14} />
              <span>Web Preview</span>
            </button>
          )}
        </div>

        {/* Execution Metrics */}
        {result && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              <span>{result.executionTimeMs}ms</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: result.exitCode === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
              }} />
              <span>Exit Code: {result.exitCode}</span>
            </span>
          </div>
        )}
      </div>

      {/* Dock Content Body */}
      <div className="dock-content">
        {isRunning && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)' }}>
            <span className="spin">⚡</span>
            <span>Compiling & executing in isolated sandbox...</span>
          </div>
        )}

        {!isRunning && !result && (
          <div style={{ color: 'var(--text-muted)' }}>
            Click <b>Run</b> or press <b>Ctrl+Enter</b> to compile and execute your code.
          </div>
        )}

        {/* Tab 1: Output */}
        {!isRunning && result && activeTab === 'output' && (
          <div>
            {result.stdout && (
              <pre className="terminal-stdout">{result.stdout}</pre>
            )}
            {result.stderr && (
              <pre className="terminal-stderr" style={{ marginTop: result.stdout ? '10px' : '0' }}>
                {result.stderr}
              </pre>
            )}
            {!result.stdout && !result.stderr && (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                (Program finished with exit code {result.exitCode} and produced no console output.)
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Clickable Compiler Diagnostics / Errors */}
        {!isRunning && activeTab === 'errors' && (
          <div>
            {result && result.diagnostics.length > 0 ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Click an error below to jump directly to that line in the editor:
                  </span>
                  <button
                    className="btn btn-ai"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                    onClick={() => onAskAIToFix(result.stderr || result.diagnostics[0].message, result.diagnostics[0].line)}
                  >
                    <Sparkles size={13} />
                    <span>Auto-Fix with AI</span>
                  </button>
                </div>

                {result.diagnostics.map((diag, index) => (
                  <div
                    key={index}
                    className="diagnostic-item"
                    onClick={() => onNavigateToLine(diag.line)}
                    title="Click to jump to line in editor"
                  >
                    <div className="diagnostic-title">
                      <AlertTriangle size={14} />
                      <span>Line {diag.line}{diag.column ? `:${diag.column}` : ''} {diag.file ? `in ${diag.file}` : ''}</span>
                    </div>
                    <div className="diagnostic-desc">{diag.message}</div>
                  </div>
                ))}
              </div>
            ) : result && result.stderr ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--accent-rose)', fontWeight: 600, fontSize: '12px' }}>
                    Runtime / Compiler Error:
                  </span>
                  <button
                    className="btn btn-ai"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                    onClick={() => onAskAIToFix(result.stderr)}
                  >
                    <Sparkles size={13} />
                    <span>Ask AI to Fix</span>
                  </button>
                </div>
                <pre className="terminal-stderr">{result.stderr}</pre>
              </div>
            ) : (
              <div style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>No compilation or runtime errors detected!</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Stdin Input */}
        {activeTab === 'stdin' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Standard Input (passed to program during execution):
            </span>
            <textarea
              className="input"
              style={{ flex: 1, resize: 'none', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              placeholder="Enter inputs here (one per line)..."
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
            />
          </div>
        )}

        {/* Tab 4: Interactive Web Preview */}
        {isWebLanguage && activeTab === 'preview' && (
          <div style={{ height: '100%', width: '100%', background: 'white', borderRadius: 'var(--radius-xs)' }}>
            <iframe
              title="Web Playground Preview"
              style={{ width: '100%', height: '100%', border: 'none' }}
              srcDoc={htmlPreviewCode || '<p style="padding:1rem;color:#333;">Preview ready...</p>'}
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>
    </div>
  );
};
