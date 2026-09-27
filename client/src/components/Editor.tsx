import React, { useRef, useEffect } from 'react';
import MonacoEditor, { OnMount } from '@monaco-editor/react';
import { ProjectFile } from '../types';
import { X, Code2 } from 'lucide-react';

interface EditorProps {
  files: ProjectFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onContentChange: (content: string) => void;
  targetLine?: number | null;
  theme: 'vs-dark' | 'light';
  fontSize: number;
  tabSize: number;
  minimap: boolean;
  wordWrap: 'on' | 'off';
  onCursorChange?: (line: number, col: number) => void;
}

export const Editor: React.FC<EditorProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onContentChange,
  targetLine,
  theme,
  fontSize,
  tabSize,
  minimap,
  wordWrap,
  onCursorChange
}) => {
  const editorRef = useRef<any>(null);
  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Track cursor movement for live collaboration
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange(e.position.lineNumber, e.position.column);
      }
    });

    // Custom dark theme styling to match design system
    monaco.editor.defineTheme('collabcode-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '38bdf8', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'type', foreground: '818cf8' },
        { token: 'function', foreground: '60a5fa' }
      ],
      colors: {
        'editor.background': '#0a0f1b',
        'editor.foreground': '#f1f5f9',
        'editorCursor.foreground': '#38bdf8',
        'editor.lineHighlightBackground': '#131a2d',
        'editorLineNumber.foreground': '#334155',
        'editorLineNumber.activeForeground': '#38bdf8',
        'editor.selectionBackground': '#27345480'
      }
    });

    monaco.editor.setTheme(theme === 'vs-dark' ? 'collabcode-dark' : 'light');
  };

  // Jump to error line when triggered from output diagnostics
  useEffect(() => {
    if (editorRef.current && targetLine && targetLine > 0) {
      editorRef.current.revealLineInCenter(targetLine);
      editorRef.current.setPosition({ lineNumber: targetLine, column: 1 });
      editorRef.current.focus();
    }
  }, [targetLine]);

  // Map file extension to Monaco language
  const getMonacoLanguage = (fileName: string, lang: string) => {
    if (fileName.endsWith('.py')) return 'python';
    if (fileName.endsWith('.js')) return 'javascript';
    if (fileName.endsWith('.ts')) return 'typescript';
    if (fileName.endsWith('.c') || fileName.endsWith('.h')) return 'c';
    if (fileName.endsWith('.cpp') || fileName.endsWith('.hpp')) return 'cpp';
    if (fileName.endsWith('.java')) return 'java';
    if (fileName.endsWith('.go')) return 'go';
    if (fileName.endsWith('.rs')) return 'rust';
    if (fileName.endsWith('.cs')) return 'csharp';
    if (fileName.endsWith('.php')) return 'php';
    if (fileName.endsWith('.kt')) return 'kotlin';
    if (fileName.endsWith('.swift')) return 'swift';
    if (fileName.endsWith('.sql')) return 'sql';
    if (fileName.endsWith('.sh')) return 'shell';
    if (fileName.endsWith('.html')) return 'html';
    if (fileName.endsWith('.css')) return 'css';
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.md')) return 'markdown';
    return lang || 'plaintext';
  };

  return (
    <div className="center-panel">
      {/* Open Editor File Tabs Bar */}
      <div className="editor-tabs-bar">
        {files.map((file) => (
          <div
            key={file.id}
            className={`editor-tab ${file.id === activeFileId ? 'active' : ''}`}
            onClick={() => onSelectFile(file.id)}
          >
            <Code2 size={13} color="var(--accent-cyan)" />
            <span>{file.name}</span>
          </div>
        ))}
      </div>

      {/* Monaco Editor Surface */}
      <div className="editor-surface">
        {activeFile ? (
          <MonacoEditor
            height="100%"
            width="100%"
            language={getMonacoLanguage(activeFile.name, activeFile.language)}
            value={activeFile.content}
            onChange={(val) => onContentChange(val || '')}
            onMount={handleEditorMount}
            theme={theme === 'vs-dark' ? 'collabcode-dark' : 'light'}
            options={{
              fontSize,
              tabSize,
              fontFamily: "'Fira Code', Consolas, monospace",
              fontLigatures: true,
              minimap: { enabled: minimap },
              wordWrap,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              bracketPairColorization: { enabled: true },
              renderLineHighlight: 'all',
              lineNumbers: 'on',
              formatOnPaste: true,
              formatOnType: true
            }}
          />
        ) : (
          <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
            No file open. Select or create a file from the explorer.
          </div>
        )}
      </div>
    </div>
  );
};
