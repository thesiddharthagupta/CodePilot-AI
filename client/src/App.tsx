import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { OutputDock } from './components/OutputDock';
import { AIPanel } from './components/AIPanel';
import { AuthModal } from './components/Modals/AuthModal';
import { NewProjectModal } from './components/Modals/NewProjectModal';
import { ShareModal } from './components/Modals/ShareModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { TemplatesModal } from './components/Modals/TemplatesModal';
import { api } from './services/api';
import {
  User,
  Project,
  ProjectFile,
  ExecutionResult,
  LanguageInfo,
  Template,
  AIMessage,
  PresenceUser,
  ToastMessage
} from './types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function App() {
  // Authentication & User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Projects & Files State
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Languages & Templates
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<string>('python');
  const [templates, setTemplates] = useState<Template[]>([]);

  // Execution & Diagnostics
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [stdin, setStdin] = useState<string>('');
  const [targetLine, setTargetLine] = useState<number | null>(null);

  // AI Collaboration State
  const [aiPanelOpen, setAiPanelOpen] = useState<boolean>(true);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  // Real-Time Collaboration & Presence
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Settings
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [fontSize, setFontSize] = useState<number>(14);
  const [tabSize, setTabSize] = useState<number>(4);
  const [minimap, setMinimap] = useState<boolean>(false);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');

  // Modals Visibility
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState<boolean>(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'info' | 'success' | 'warning' | 'error', text: string) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Initialize App: Load User, Languages, Templates, and Initial Project
  useEffect(() => {
    async function init() {
      try {
        // 1. Check user token
        try {
          const userRes = await api.auth.me();
          setCurrentUser(userRes.user);
        } catch {
          // Fallback to guest onboarding session
          const guestRes = await api.auth.guest();
          localStorage.setItem('collabcode_token', guestRes.token);
          setCurrentUser(guestRes.user);
        }

        // 2. Fetch supported languages
        const langRes = await api.execution.languages();
        setLanguages(langRes.languages);

        // 3. Fetch templates
        const tplRes = await api.projects.templates();
        setTemplates(tplRes.templates);

        // 4. Fetch initial project
        const projectListRes = await api.projects.list();
        setProjects(projectListRes.projects);

        if (projectListRes.projects.length > 0) {
          const initialProject = projectListRes.projects[0];
          await loadProject(initialProject.id);
        } else {
          // Instantiate starter project from Python template
          const pyTemplate = tplRes.templates.find(t => t.language === 'python');
          if (pyTemplate) {
            await handleCreateProject('My First Project', 'Starter code workspace', 'python', pyTemplate.id);
          }
        }
      } catch (err: any) {
        console.error('Initialization error:', err);
        addToast('error', 'Failed to connect to backend: ' + err.message);
      }
    }

    init();
  }, []);

  // Load a project by ID
  const loadProject = async (projectId: string) => {
    try {
      const res = await api.projects.get(projectId);
      setCurrentProject(res.project);
      setFiles(res.files);
      setActiveLanguage(res.project.default_language || 'python');

      const entryFile = res.files.find(f => f.is_entry) || res.files[0];
      if (entryFile) {
        setActiveFileId(entryFile.id);
      }
      setHasUnsavedChanges(false);
      connectWebSocket(projectId);
    } catch (err: any) {
      addToast('error', 'Error loading project: ' + err.message);
    }
  };

  // Real-Time WebSocket Connection
  const connectWebSocket = useCallback((projectId: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const token = localStorage.getItem('collabcode_token') || '';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?projectId=${projectId}&token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'presence') {
          setPresenceUsers(msg.users);
        } else if (msg.type === 'chat') {
          if (msg.senderId === 'system') {
            addToast('info', msg.message);
          }
        }
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    ws.onerror = (e) => {
      console.warn('WebSocket connection error:', e);
    };
  }, []);

  // Save Project Files
  const handleSave = async () => {
    if (!currentProject) return;
    setIsSaving(true);
    try {
      const filesToSave = files.map(f => ({ id: f.id, content: f.content }));
      await api.files.batchSave(currentProject.id, filesToSave);
      setHasUnsavedChanges(false);
      addToast('success', 'Project saved successfully.');
    } catch (err: any) {
      addToast('error', 'Failed to save: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced Auto-save (every 10 seconds if dirty)
  useEffect(() => {
    if (!hasUnsavedChanges || !currentProject) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 10000);
    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, files, currentProject]);

  // Execute Code Pipeline
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setExecutionResult(null);

    try {
      const activeFile = files.find(f => f.id === activeFileId);
      const result = await api.execution.run({
        language: activeLanguage,
        code: activeFile ? activeFile.content : undefined,
        files: files.map(f => ({ name: f.name, content: f.content })),
        stdin: stdin.trim() ? stdin : undefined,
        projectId: currentProject?.id
      });

      setExecutionResult(result);

      if (result.exitCode === 0) {
        addToast('success', `Executed in ${result.executionTimeMs}ms`);
      } else {
        addToast('warning', `Execution exited with error code ${result.exitCode}`);
      }
    } catch (err: any) {
      addToast('error', 'Execution error: ' + err.message);
      setExecutionResult({
        stdout: '',
        stderr: err.message,
        exitCode: 1,
        executionTimeMs: 0,
        status: 'system_error',
        diagnostics: []
      });
    } finally {
      setIsRunning(false);
    }
  };

  // AI Assistant Action Dispatcher
  const handleSendAIAction = async (action: string, prompt?: string, targetLanguage?: string) => {
    const activeFile = files.find(f => f.id === activeFileId);
    if (!activeFile) return;

    setIsAiProcessing(true);

    // Add user question to stream
    const userMsg: AIMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: prompt || `Action: ${action.toUpperCase()}`,
      created_at: new Date().toISOString()
    };
    setAiMessages(prev => [...prev, userMsg]);

    try {
      const res = await api.ai.action({
        action,
        prompt,
        context: {
          language: activeLanguage,
          currentFile: activeFile.name,
          currentCode: activeFile.content,
          compilerOutput: executionResult?.stderr,
          errorLine: executionResult?.diagnostics?.[0]?.line,
          errorMessage: executionResult?.diagnostics?.[0]?.message,
          targetLanguage
        },
        projectId: currentProject?.id
      });

      const assistantMsg: AIMessage = {
        id: 'msg_ai_' + Date.now(),
        role: 'assistant',
        content: res.explanation,
        action_type: res.action,
        code_diff: res.codeDiff,
        proposedCode: res.proposedCode,
        created_at: new Date().toISOString()
      };

      setAiMessages(prev => [...prev, assistantMsg]);
      addToast('info', `AI completed ${action} analysis.`);
    } catch (err: any) {
      addToast('error', 'AI processing error: ' + err.message);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // 1-Click Apply Code from AI to Active Editor
  const handleApplyAICode = (newCode: string) => {
    if (!activeFileId) return;
    setFiles(prev =>
      prev.map(f => (f.id === activeFileId ? { ...f, content: newCode } : f))
    );
    setHasUnsavedChanges(true);
    addToast('success', 'AI proposed code applied to active editor.');
  };

  // Keyboard Shortcuts Handler (Ctrl+Enter to Run, Ctrl+S to Save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, activeLanguage, files, activeFileId, stdin, currentProject]);

  // File Content Change in Editor
  const handleContentChange = (content: string) => {
    setFiles(prev =>
      prev.map(f => (f.id === activeFileId ? { ...f, content } : f))
    );
    setHasUnsavedChanges(true);
  };

  // Create New File
  const handleCreateFile = async (name: string) => {
    if (!currentProject) return;
    try {
      const res = await api.files.create({
        projectId: currentProject.id,
        name,
        language: activeLanguage,
        content: `// ${name}\n`
      });
      setFiles(prev => [...prev, res.file]);
      setActiveFileId(res.file.id);
      addToast('success', `Created file ${name}`);
    } catch (err: any) {
      addToast('error', 'Failed to create file: ' + err.message);
    }
  };

  // Delete File
  const handleDeleteFile = async (fileId: string) => {
    try {
      await api.files.delete(fileId);
      const remaining = files.filter(f => f.id !== fileId);
      setFiles(remaining);
      if (activeFileId === fileId && remaining.length > 0) {
        setActiveFileId(remaining[0].id);
      }
      addToast('info', 'File deleted.');
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // Create Project
  const handleCreateProject = async (name: string, description: string, language: string, templateId?: string) => {
    try {
      const res = await api.projects.create({ name, description, language, templateId });
      setProjects(prev => [res.project, ...prev]);
      setCurrentProject(res.project);
      setFiles(res.files);
      setActiveLanguage(res.project.default_language);
      if (res.files.length > 0) {
        setActiveFileId(res.files[0].id);
      }
      setHasUnsavedChanges(false);
      connectWebSocket(res.project.id);
      addToast('success', `Created project "${name}"`);
    } catch (err: any) {
      addToast('error', 'Failed to create project: ' + err.message);
    }
  };

  // Select Starter Template
  const handleSelectTemplate = async (template: Template) => {
    await handleCreateProject(
      `${template.name} Playground`,
      template.description,
      template.language,
      template.id
    );
  };

  // Active File Reference
  const activeFile = files.find(f => f.id === activeFileId) || null;

  return (
    <div className="app-container" data-theme={theme === 'vs-dark' ? 'dark' : 'light'}>
      {/* Top Navigation Bar */}
      <Navbar
        currentProject={currentProject}
        activeLanguage={activeLanguage}
        languages={languages}
        onLanguageChange={(lang) => {
          setActiveLanguage(lang);
          if (currentProject) {
            api.projects.update(currentProject.id, { default_language: lang });
          }
        }}
        onRun={handleRunCode}
        onSave={handleSave}
        isRunning={isRunning}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        aiPanelOpen={aiPanelOpen}
        onToggleAIPanel={() => setAiPanelOpen(!aiPanelOpen)}
        onOpenShare={() => setShareModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenTemplates={() => setTemplatesModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Main 3-Column IDE Workspace Grid */}
      <main className={`workspace-layout ${!aiPanelOpen ? 'ai-collapsed' : ''}`}>
        {/* Left: Project Explorer Sidebar */}
        <Sidebar
          currentProject={currentProject}
          files={files}
          activeFileId={activeFileId}
          onSelectFile={(id) => {
            setActiveFileId(id);
            setTargetLine(null);
          }}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
          onDuplicateProject={() => {
            if (currentProject) {
              api.projects.duplicate(currentProject.id).then(res => {
                setProjects(p => [res.project, ...p]);
                setCurrentProject(res.project);
                setFiles(res.files);
                addToast('success', 'Project duplicated.');
              });
            }
          }}
          onNewProject={() => setNewProjectModalOpen(true)}
          presenceUsers={presenceUsers}
        />

        {/* Center: Monaco Editor & Output Dock */}
        <div className="center-panel">
          <Editor
            files={files}
            activeFileId={activeFileId}
            onSelectFile={setActiveFileId}
            onContentChange={handleContentChange}
            targetLine={targetLine}
            theme={theme}
            fontSize={fontSize}
            tabSize={tabSize}
            minimap={minimap}
            wordWrap={wordWrap}
          />

          <OutputDock
            result={executionResult}
            isRunning={isRunning}
            activeLanguage={activeLanguage}
            stdin={stdin}
            onStdinChange={setStdin}
            onNavigateToLine={(line) => {
              setTargetLine(line);
              addToast('info', `Navigated editor to line ${line}`);
            }}
            onAskAIToFix={(errText, line) => {
              setAiPanelOpen(true);
              handleSendAIAction('fix', `Fix error: ${errText}`, undefined);
            }}
            htmlPreviewCode={
              activeLanguage === 'html'
                ? activeFile?.content
                : undefined
            }
          />
        </div>

        {/* Right: AI Assistant & Collaboration Panel */}
        {aiPanelOpen && (
          <AIPanel
            messages={aiMessages}
            isProcessing={isAiProcessing}
            onSendAction={handleSendAIAction}
            onApplyCode={handleApplyAICode}
            onClose={() => setAiPanelOpen(false)}
            activeFile={activeFile}
          />
        )}
      </main>

      {/* Footer Status Bar */}
      <footer className="status-bar">
        <div className="status-item">
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }} />
          <span>Sandbox Ready</span>
          <span style={{ color: 'var(--border-medium)' }}>|</span>
          <span>CollabCode Online IDE</span>
        </div>

        <div className="status-item" style={{ gap: '12px' }}>
          <span>{activeFile ? activeFile.name : 'No file'}</span>
          <span>UTF-8</span>
          <span>{activeLanguage.toUpperCase()}</span>
          <span>Spaces: {tabSize}</span>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          addToast('success', `Signed in as ${user.username}`);
        }}
        currentUser={currentUser}
        onLogout={() => {
          localStorage.removeItem('collabcode_token');
          setCurrentUser(null);
          addToast('info', 'Logged out.');
        }}
      />

      <NewProjectModal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
        templates={templates}
        onCreate={handleCreateProject}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        project={currentProject}
        presenceUsers={presenceUsers}
        onTogglePublic={(isPub) => {
          if (currentProject) {
            api.projects.update(currentProject.id, { is_public: isPub ? 1 : 0 }).then(res => {
              setCurrentProject(res.project);
              addToast('info', `Project visibility updated to ${isPub ? 'Public' : 'Private'}`);
            });
          }
        }}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        tabSize={tabSize}
        onTabSizeChange={setTabSize}
        minimap={minimap}
        onMinimapChange={setMinimap}
        wordWrap={wordWrap}
        onWordWrapChange={setWordWrap}
      />

      <TemplatesModal
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        templates={templates}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Toast Notifications Overlay */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.type === 'success' && <CheckCircle2 size={16} color="var(--accent-emerald)" />}
            {t.type === 'error' && <AlertCircle size={16} color="var(--accent-rose)" />}
            {t.type === 'warning' && <AlertCircle size={16} color="var(--accent-amber)" />}
            {t.type === 'info' && <Info size={16} color="var(--accent-cyan)" />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default App;
