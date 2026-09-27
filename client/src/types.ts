export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  default_language: string;
  is_public: number;
  share_token: string;
  created_at: string;
  updated_at: string;
  file_count?: number;
  user_role?: 'owner' | 'editor' | 'viewer';
}

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  is_entry: number;
  created_at: string;
  updated_at: string;
}

export interface Diagnostic {
  file?: string;
  line: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryKb?: number;
  status: 'success' | 'compilation_error' | 'runtime_error' | 'timeout' | 'system_error';
  diagnostics: Diagnostic[];
}

export interface LanguageInfo {
  id: string;
  name: string;
  extension: string;
  monacoLanguage: string;
  isCompiled: boolean;
  pistonVersion?: string;
}

export interface Template {
  id: string;
  language: string;
  name: string;
  description: string;
  icon: string;
  default_filename: string;
  default_code: string;
  category: string;
  compiler_info: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  action_type?: string;
  code_diff?: string;
  proposedCode?: string;
  created_at: string;
}

export interface PresenceUser {
  userId: string;
  username: string;
  color: string;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  text: string;
}
