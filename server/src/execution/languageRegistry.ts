export interface Diagnostic {
  file?: string;
  line: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface LanguageDefinition {
  id: string;
  name: string;
  extension: string;
  monacoLanguage: string;
  pistonLanguage: string;
  pistonVersion: string;
  isCompiled: boolean;
  canExecuteLocally: boolean;
  parseDiagnostics: (output: string) => Diagnostic[];
}

// Regex helpers for multi-compiler diagnostic parsing
export const LANGUAGE_REGISTRY: Record<string, LanguageDefinition> = {
  python: {
    id: 'python',
    name: 'Python 3',
    extension: '.py',
    monacoLanguage: 'python',
    pistonLanguage: 'python',
    pistonVersion: '3.10.0',
    isCompiled: false,
    canExecuteLocally: true,
    parseDiagnostics: (output: string): Diagnostic[] => {
      const diagnostics: Diagnostic[] = [];
      // File "main.py", line 12, in <module>
      const lineRegex = /File "(.*?)", line (\d+)(?:, in .*)?\n(?:\s+.*?\n)?(\w+Error: .*)/g;
      let match;
      while ((match = lineRegex.exec(output)) !== null) {
        diagnostics.push({
          file: match[1],
          line: parseInt(match[2], 10),
          message: match[3],
          severity: 'error'
        });
      }
      // SyntaxError: invalid syntax (line 4)
      const syntaxRegex = /File "(.*?)", line (\d+)\s*\n\s*(.*?)\s*\n\s*\^?\s*\n(\w+Error: .*)/g;
      while ((match = syntaxRegex.exec(output)) !== null) {
        diagnostics.push({
          file: match[1],
          line: parseInt(match[2], 10),
          message: match[4],
          severity: 'error'
        });
      }
      return diagnostics;
    }
  },

  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    extension: '.js',
    monacoLanguage: 'javascript',
    pistonLanguage: 'javascript',
    pistonVersion: '18.15.0',
    isCompiled: false,
    canExecuteLocally: true,
    parseDiagnostics: (output: string): Diagnostic[] => {
      const diagnostics: Diagnostic[] = [];
      // /workspace/index.js:14:21: ReferenceError: x is not defined
      // or at main (index.js:5:3)
      const jsRegex = /(?:([a-zA-Z0-9_\-\.]+):(\d+):(\d+)|at .*? \((.*?):(\d+):(\d+)\)):? (.*)/g;
      let match;
      while ((match = jsRegex.exec(output)) !== null) {
        diagnostics.push({
          file: match[1] || match[4],
          line: parseInt(match[2] || match[5], 10),
          column: parseInt(match[3] || match[6], 10),
          message: match[7] || 'Runtime error',
          severity: 'error'
        });
      }
      return diagnostics;
    }
  },

  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    extension: '.ts',
    monacoLanguage: 'typescript',
    pistonLanguage: 'typescript',
    pistonVersion: '5.0.3',
    isCompiled: true,
    canExecuteLocally: true,
    parseDiagnostics: (output: string): Diagnostic[] => {
      const diagnostics: Diagnostic[] = [];
      // main.ts(12,5): error TS2322: Type 'string' is not assignable to type 'number'.
      const tsRegex = /([a-zA-Z0-9_\-\.]+)\((\d+),(\d+)\): error (TS\d+): (.*)/g;
      let match;
      while ((match = tsRegex.exec(output)) !== null) {
        diagnostics.push({
          file: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
          message: `[${match[4]}] ${match[5]}`,
          severity: 'error'
        });
      }
      return diagnostics;
    }
  },

  c: {
    id: 'c',
    name: 'C (GCC)',
    extension: '.c',
    monacoLanguage: 'c',
    pistonLanguage: 'c',
    pistonVersion: '10.2.0',
    isCompiled: true,
    canExecuteLocally: false,
    parseDiagnostics: (output: string): Diagnostic[] => {
      const diagnostics: Diagnostic[] = [];
      // main.c:14:5: error: expected ';' before 'return'
      const gccRegex = /([a-zA-Z0-9_\-\.]+):(\d+):(\d+):\s+(error|warning):\s+(.*)/g;
      let match;
      while ((match = gccRegex.exec(output)) !== null) {
        diagnostics.push({
          file: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
          severity: match[4] === 'error' ? 'error' : 'warning',
          message: match[5]
        });
      }
      return diagnostics;
    }
  },

  cpp: {
    id: 'cpp',
    name: 'C++ (G++)',
    extension: '.cpp',
    monacoLanguage: 'cpp',
    pistonLanguage: 'c++',
    pistonVersion: '10.2.0',
    isCompiled: true,
    canExecuteLocally: false,
    parseDiagnostics: (output: string): Diagnostic[] => {
      const diagnostics: Diagnostic[] = [];
      // main.cpp:12:10: error: 'cout' is not a member of 'std'
      const cppRegex = /([a-zA-Z0-9_\-\.]+):(\d+):(\d+):\s+(error|warning):\s+(.*)/g;
      let match;
      while ((match = cppRegex.exec(output)) !== null) {
        diagnostics.push({
          file: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
          severity: match[4] === 'error' ? 'error' : 'warning',
          message: match[5]
        });
      }
      return diagnostics;
    }
  },

  java: {
    id: 'java',
    name: 'Java',
    extension: '.java',
    monacoLanguage: 'java',
    pistonLanguage: 'java',
    pistonVersion: '15.0.2',
    isCompiled: true,
    canExecuteLocally: false,
    parseDiagnostics: (output: string): Diagnostic[] => {
      const diagnostics: Diagnostic[] = [];
      // Main.java:8: error: cannot find symbol
      const javaRegex = /([a-zA-Z0-9_\-\.]+):(\d+):\s+(error|warning):\s+(.*)/g;
      let match;
      while ((match = javaRegex.exec(output)) !== null) {
        diagnostics.push({
          file: match[1],
          line: parseInt(match[2], 10),
          message: match[4],
          severity: match[3] === 'error' ? 'error' : 'warning'
        });
      }
      return diagnostics;
    }
  },

  go: {
    id: 'go',
    name: 'Go',
    extension: '.go',
    monacoLanguage: 'go',
    pistonLanguage: 'go',
    pistonVersion: '1.16.2',
    isCompiled: true,
    canExecuteLocally: false,
    parseDiagnostics: (output: string): Diagnostic[] => {
      const diagnostics: Diagnostic[] = [];
      // ./main.go:12:9: undefined: fmt.Printlnn
      const goRegex = /(?:\.\/)?([a-zA-Z0-9_\-\.]+):(\d+):(\d+):\s*(.*)/g;
      let match;
      while ((match = goRegex.exec(output)) !== null) {
        diagnostics.push({
          file: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
          message: match[4],
          severity: 'error'
        });
      }
      return diagnostics;
    }
  },

  rust: {
    id: 'rust',
    name: 'Rust',
    extension: '.rs',
    monacoLanguage: 'rust',
    pistonLanguage: 'rust',
    pistonVersion: '1.68.2',
    isCompiled: true,
    canExecuteLocally: false,
    parseDiagnostics: (output: string): Diagnostic[] => {
      const diagnostics: Diagnostic[] = [];
      // error[E0425]: cannot find value `x` in this scope --> main.rs:12:5
      const rustRegex = /error(?:\[\w+\])?:\s+(.*?)\s+-->\s+([a-zA-Z0-9_\-\.]+):(\d+):(\d+)/g;
      let match;
      while ((match = rustRegex.exec(output)) !== null) {
        diagnostics.push({
          file: match[2],
          line: parseInt(match[3], 10),
          column: parseInt(match[4], 10),
          message: match[1],
          severity: 'error'
        });
      }
      return diagnostics;
    }
  },

  csharp: {
    id: 'csharp',
    name: 'C#',
    extension: '.cs',
    monacoLanguage: 'csharp',
    pistonLanguage: 'csharp.net',
    pistonVersion: '7.0.400',
    isCompiled: true,
    canExecuteLocally: false,
    parseDiagnostics: (output: string): Diagnostic[] => {
      const diagnostics: Diagnostic[] = [];
      // Program.cs(12,17): error CS0103: The name 'foo' does not exist in the current context
      const csRegex = /([a-zA-Z0-9_\-\.]+)\((\d+),(\d+)\):\s+(error|warning)\s+(\w+):\s+(.*)/g;
      let match;
      while ((match = csRegex.exec(output)) !== null) {
        diagnostics.push({
          file: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
          message: `[${match[5]}] ${match[6]}`,
          severity: match[4] === 'error' ? 'error' : 'warning'
        });
      }
      return diagnostics;
    }
  },

  php: {
    id: 'php',
    name: 'PHP',
    extension: '.php',
    monacoLanguage: 'php',
    pistonLanguage: 'php',
    pistonVersion: '8.2.3',
    isCompiled: false,
    canExecuteLocally: false,
    parseDiagnostics: (output: string): Diagnostic[] => {
      const diagnostics: Diagnostic[] = [];
      // PHP Parse error: syntax error, unexpected token ";" in index.php on line 12
      const phpRegex = /PHP (?:Fatal|Parse)? error:\s+(.*?) in (.*?) on line (\d+)/g;
      let match;
      while ((match = phpRegex.exec(output)) !== null) {
        diagnostics.push({
          file: match[2],
          line: parseInt(match[3], 10),
          message: match[1],
          severity: 'error'
        });
      }
      return diagnostics;
    }
  },

  kotlin: {
    id: 'kotlin',
    name: 'Kotlin',
    extension: '.kt',
    monacoLanguage: 'kotlin',
    pistonLanguage: 'kotlin',
    pistonVersion: '1.8.20',
    isCompiled: true,
    canExecuteLocally: false,
    parseDiagnostics: (output: string): Diagnostic[] => {
      const diagnostics: Diagnostic[] = [];
      // Main.kt:5:9: error: unresolved reference: foo
      const ktRegex = /([a-zA-Z0-9_\-\.]+):(\d+):(\d+):\s+error:\s+(.*)/g;
      let match;
      while ((match = ktRegex.exec(output)) !== null) {
        diagnostics.push({
          file: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
          message: match[4],
          severity: 'error'
        });
      }
      return diagnostics;
    }
  },

  swift: {
    id: 'swift',
    name: 'Swift',
    extension: '.swift',
    monacoLanguage: 'swift',
    pistonLanguage: 'swift',
    pistonVersion: '5.3.3',
    isCompiled: true,
    canExecuteLocally: false,
    parseDiagnostics: (output: string): Diagnostic[] => {
      const diagnostics: Diagnostic[] = [];
      // main.swift:4:1: error: cannot find 'bar' in scope
      const swiftRegex = /([a-zA-Z0-9_\-\.]+):(\d+):(\d+):\s+error:\s+(.*)/g;
      let match;
      while ((match = swiftRegex.exec(output)) !== null) {
        diagnostics.push({
          file: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
          message: match[4],
          severity: 'error'
        });
      }
      return diagnostics;
    }
  },

  sql: {
    id: 'sql',
    name: 'SQL (SQLite Engine)',
    extension: '.sql',
    monacoLanguage: 'sql',
    pistonLanguage: 'sqlite3',
    pistonVersion: '3.36.0',
    isCompiled: false,
    canExecuteLocally: true,
    parseDiagnostics: (output: string): Diagnostic[] => {
      const diagnostics: Diagnostic[] = [];
      // Parse error near line 5: no such table: users
      const sqlRegex = /near line (\d+):\s*(.*)/g;
      let match;
      while ((match = sqlRegex.exec(output)) !== null) {
        diagnostics.push({
          line: parseInt(match[1], 10),
          message: match[2],
          severity: 'error'
        });
      }
      return diagnostics;
    }
  },

  bash: {
    id: 'bash',
    name: 'Bash',
    extension: '.sh',
    monacoLanguage: 'shell',
    pistonLanguage: 'bash',
    pistonVersion: '5.2.0',
    isCompiled: false,
    canExecuteLocally: false,
    parseDiagnostics: (output: string): Diagnostic[] => {
      const diagnostics: Diagnostic[] = [];
      // script.sh: line 4: foo: command not found
      const bashRegex = /([a-zA-Z0-9_\-\.]+): line (\d+):\s+(.*)/g;
      let match;
      while ((match = bashRegex.exec(output)) !== null) {
        diagnostics.push({
          file: match[1],
          line: parseInt(match[2], 10),
          message: match[3],
          severity: 'error'
        });
      }
      return diagnostics;
    }
  },

  html: {
    id: 'html',
    name: 'HTML5',
    extension: '.html',
    monacoLanguage: 'html',
    pistonLanguage: '',
    pistonVersion: '',
    isCompiled: false,
    canExecuteLocally: true,
    parseDiagnostics: () => []
  },

  css: {
    id: 'css',
    name: 'CSS3',
    extension: '.css',
    monacoLanguage: 'css',
    pistonLanguage: '',
    pistonVersion: '',
    isCompiled: false,
    canExecuteLocally: true,
    parseDiagnostics: () => []
  }
};
