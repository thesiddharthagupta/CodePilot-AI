import { User, Project, ProjectFile, ExecutionResult, LanguageInfo, Template, AIMessage } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('collabcode_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Authentication
  auth: {
    async login(identifier: string, password: string): Promise<{ user: User; token: string }> {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to login');
      }
      return res.json();
    },

    async register(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to register');
      }
      return res.json();
    },

    async guest(): Promise<{ user: User; token: string; isGuest: boolean }> {
      const res = await fetch(`${API_BASE}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to initialize guest session');
      }
      return res.json();
    },

    async me(): Promise<{ user: User }> {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...getAuthHeader() }
      });
      if (!res.ok) {
        throw new Error('Not authenticated');
      }
      return res.json();
    }
  },

  // Projects
  projects: {
    async list(): Promise<{ projects: Project[]; shared: Project[] }> {
      const res = await fetch(`${API_BASE}/projects`, {
        headers: { ...getAuthHeader() }
      });
      if (!res.ok) throw new Error('Failed to load projects');
      return res.json();
    },

    async get(id: string): Promise<{ project: Project; files: ProjectFile[]; userRole: string }> {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        headers: { ...getAuthHeader() }
      });
      if (!res.ok) throw new Error('Failed to fetch project');
      return res.json();
    },

    async create(data: { name: string; description?: string; language: string; templateId?: string }): Promise<{ project: Project; files: ProjectFile[] }> {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create project');
      }
      return res.json();
    },

    async update(id: string, data: Partial<Project>): Promise<{ project: Project }> {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update project');
      return res.json();
    },

    async duplicate(id: string): Promise<{ project: Project; files: ProjectFile[] }> {
      const res = await fetch(`${API_BASE}/projects/${id}/duplicate`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
      if (!res.ok) throw new Error('Failed to duplicate project');
      return res.json();
    },

    async delete(id: string): Promise<void> {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      if (!res.ok) throw new Error('Failed to delete project');
    },

    async templates(): Promise<{ templates: Template[] }> {
      const res = await fetch(`${API_BASE}/projects/templates`);
      if (!res.ok) throw new Error('Failed to fetch templates');
      return res.json();
    }
  },

  // Files
  files: {
    async create(data: { projectId: string; name: string; content?: string; language?: string; isEntry?: boolean }): Promise<{ file: ProjectFile }> {
      const res = await fetch(`${API_BASE}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create file');
      }
      return res.json();
    },

    async update(id: string, data: Partial<ProjectFile>): Promise<{ file: ProjectFile }> {
      const res = await fetch(`${API_BASE}/files/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update file');
      return res.json();
    },

    async delete(id: string): Promise<void> {
      const res = await fetch(`${API_BASE}/files/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      if (!res.ok) throw new Error('Failed to delete file');
    },

    async batchSave(projectId: string, files: Array<{ id: string; content: string }>): Promise<{ files: ProjectFile[]; savedAt: string }> {
      const res = await fetch(`${API_BASE}/files/batch-save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ projectId, files })
      });
      if (!res.ok) throw new Error('Failed to save project files');
      return res.json();
    }
  },

  // Execution
  execution: {
    async run(data: {
      language: string;
      code?: string;
      files?: Array<{ name: string; content: string }>;
      stdin?: string;
      projectId?: string;
    }): Promise<ExecutionResult> {
      const res = await fetch(`${API_BASE}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Execution failed');
      }
      return res.json();
    },

    async languages(): Promise<{ languages: LanguageInfo[] }> {
      const res = await fetch(`${API_BASE}/execute/languages`);
      if (!res.ok) throw new Error('Failed to load supported languages');
      return res.json();
    }
  },

  // AI Assistant
  ai: {
    async action(data: {
      action: string;
      prompt?: string;
      context: {
        language: string;
        currentFile: string;
        currentCode: string;
        selectedCode?: string;
        compilerOutput?: string;
        errorLine?: number;
        errorMessage?: string;
        targetLanguage?: string;
      };
      conversationId?: string;
      projectId?: string;
    }): Promise<{
      conversationId: string;
      action: string;
      explanation: string;
      proposedCode?: string;
      codeDiff?: string;
      suggestedAction?: 'apply' | 'review' | 'none';
      reviewPoints?: any[];
    }> {
      const res = await fetch(`${API_BASE}/ai/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'AI service request failed');
      }
      return res.json();
    }
  }
};
