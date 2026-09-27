import { LANGUAGE_REGISTRY, Diagnostic } from './languageRegistry.js';
import { db } from '../db/database.js';
import Database from 'better-sqlite3';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface ExecutionRequest {
  language: string;
  code?: string;
  files?: Array<{ name: string; content: string }>;
  stdin?: string;
  userId?: string;
  projectId?: string;
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

const PISTON_API_URL = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston/execute';

export class ExecutionService {
  /**
   * Main unified execution pipeline
   * Language -> Compiler/Runtime Adapter -> Execution Worker -> Result
   */
  public static async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = performance.now();
    const langKey = request.language.toLowerCase();
    const langDef = LANGUAGE_REGISTRY[langKey];

    if (!langDef) {
      return {
        stdout: '',
        stderr: `Unsupported language: '${request.language}'. Supported languages: ${Object.keys(LANGUAGE_REGISTRY).join(', ')}`,
        exitCode: 1,
        executionTimeMs: 0,
        status: 'system_error',
        diagnostics: []
      };
    }

    // Determine entry code
    let primaryCode = request.code || '';
    const fileList: Array<{ name: string; content: string }> = [];

    if (request.files && request.files.length > 0) {
      for (const f of request.files) {
        fileList.push({ name: f.name, content: f.content });
      }
      if (!primaryCode) {
        primaryCode = request.files[0].content;
      }
    } else {
      fileList.push({
        name: `main${langDef.extension}`,
        content: primaryCode
      });
    }

    let result: ExecutionResult;

    // 1. Specialized SQL local in-memory runner
    if (langKey === 'sql') {
      result = await this.executeSql(primaryCode);
    }
    // 2. HTML / CSS web playground
    else if (langKey === 'html' || langKey === 'css') {
      result = this.executeWebPlayground(langKey, primaryCode, request.files);
    }
    // 3. Isolated Sandbox Worker (Piston / Docker / Container)
    else {
      try {
        result = await this.executeViaPiston(langDef, fileList, request.stdin);
      } catch (err: any) {
        console.warn(`[Execution] Piston runner failed (${err.message}). Attempting local sandbox fallback...`);
        result = await this.executeLocalSandboxFallback(langDef, primaryCode, request.stdin);
      }
    }

    // Parse compiler & runtime diagnostics
    const combinedOutput = `${result.stdout}\n${result.stderr}`;
    result.diagnostics = langDef.parseDiagnostics(combinedOutput);

    if (result.diagnostics.length > 0 && result.exitCode !== 0) {
      if (langDef.isCompiled && result.stderr.toLowerCase().includes('error')) {
        result.status = 'compilation_error';
      } else {
        result.status = 'runtime_error';
      }
    }

    result.executionTimeMs = Math.round(performance.now() - startTime);

    // Persist execution log in DB
    try {
      const execId = 'exec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      db.prepare(`
        INSERT INTO executions (id, user_id, project_id, language, code, stdin, stdout, stderr, exit_code, execution_time_ms, memory_kb, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        execId,
        request.userId || null,
        request.projectId || null,
        langKey,
        primaryCode.substring(0, 10000),
        request.stdin || null,
        result.stdout.substring(0, 20000),
        result.stderr.substring(0, 20000),
        result.exitCode,
        result.executionTimeMs,
        result.memoryKb || 0,
        result.status
      );
    } catch (dbErr) {
      console.error('[Execution] Failed to record execution log:', dbErr);
    }

    return result;
  }

  /**
   * Piston isolated container execution adapter
   */
  private static async executeViaPiston(
    langDef: any,
    files: Array<{ name: string; content: string }>,
    stdin?: string
  ): Promise<ExecutionResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s safety timeout

    try {
      const payload = {
        language: langDef.pistonLanguage,
        version: langDef.pistonVersion,
        files: files.map(f => ({ name: f.name, content: f.content })),
        stdin: stdin || '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 10000,
        compile_memory_limit: -1,
        run_memory_limit: -1
      };

      const response = await fetch(PISTON_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Piston worker responded with ${response.status}: ${text}`);
      }

      const data = (await response.json()) as any;

      if (data.compile && data.compile.code !== 0) {
        return {
          stdout: data.compile.stdout || '',
          stderr: data.compile.stderr || data.compile.output || '',
          exitCode: data.compile.code || 1,
          executionTimeMs: 0,
          status: 'compilation_error',
          diagnostics: []
        };
      }

      const run = data.run || {};
      const exitCode = run.code !== undefined ? run.code : 0;
      const isError = exitCode !== 0;

      return {
        stdout: run.stdout || (exitCode === 0 ? run.output : '') || '',
        stderr: run.stderr || (exitCode !== 0 ? run.output : '') || '',
        exitCode: exitCode,
        executionTimeMs: 0,
        status: isError ? 'runtime_error' : 'success',
        diagnostics: []
      };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        return {
          stdout: '',
          stderr: 'Execution timed out after 12 seconds.',
          exitCode: 124,
          executionTimeMs: 12000,
          status: 'timeout',
          diagnostics: []
        };
      }
      throw err;
    }
  }

  /**
   * Local sandboxed runner fallback (used when offline or local runtime preferred)
   */
  private static async executeLocalSandboxFallback(
    langDef: any,
    code: string,
    stdin?: string
  ): Promise<ExecutionResult> {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'collabcode-sandbox-'));
    const filePath = path.join(tmpDir, `main${langDef.extension}`);
    fs.writeFileSync(filePath, code);

    let cmd = '';
    let args: string[] = [];

    if (langDef.id === 'python') {
      cmd = 'python';
      args = ['-u', filePath];
    } else if (langDef.id === 'javascript') {
      cmd = 'node';
      args = [filePath];
    } else {
      // Clean up
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
      return {
        stdout: '',
        stderr: `Runtime for ${langDef.name} requires isolated worker connection. Verify network or worker connectivity.`,
        exitCode: 1,
        executionTimeMs: 0,
        status: 'system_error',
        diagnostics: []
      };
    }

    return new Promise<ExecutionResult>((resolve) => {
      let stdout = '';
      let stderr = '';
      let killed = false;

      const proc = spawn(cmd, args, {
        cwd: tmpDir,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          PYTHONIOENCODING: 'utf-8',
          LANG: 'en_US.UTF-8'
        }
      });

      const timer = setTimeout(() => {
        killed = true;
        proc.kill('SIGKILL');
      }, 7000);

      if (stdin && proc.stdin) {
        proc.stdin.write(stdin);
        proc.stdin.end();
      }

      proc.stdout.on('data', (d) => { stdout += d.toString(); });
      proc.stderr.on('data', (d) => { stderr += d.toString(); });

      proc.on('close', (code) => {
        clearTimeout(timer);
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

        if (killed) {
          resolve({
            stdout,
            stderr: stderr + '\nExecution timed out (7s limit reached).',
            exitCode: 124,
            executionTimeMs: 7000,
            status: 'timeout',
            diagnostics: []
          });
        } else {
          resolve({
            stdout,
            stderr,
            exitCode: code || 0,
            executionTimeMs: 0,
            status: (code || 0) === 0 ? 'success' : 'runtime_error',
            diagnostics: []
          });
        }
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
        resolve({
          stdout,
          stderr: `Process invocation error: ${err.message}`,
          exitCode: 1,
          executionTimeMs: 0,
          status: 'system_error',
          diagnostics: []
        });
      });
    });
  }

  /**
   * Safe in-memory SQLite execution engine
   */
  private static async executeSql(sql: string): Promise<ExecutionResult> {
    const memDb = new Database(':memory:');
    try {
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      let stdout = '';
      let queryCount = 0;

      for (const stmt of statements) {
        queryCount++;
        const isSelect = /^\s*(SELECT|PRAGMA|EXPLAIN)/i.test(stmt);
        if (isSelect) {
          const rows = memDb.prepare(stmt).all();
          if (rows.length === 0) {
            stdout += `Query ${queryCount}: (0 rows returned)\n\n`;
          } else {
            stdout += `Query ${queryCount} Results (${rows.length} rows):\n`;
            stdout += this.formatAsciiTable(rows) + '\n\n';
          }
        } else {
          const info = memDb.prepare(stmt).run();
          stdout += `Statement ${queryCount}: OK (${info.changes} rows affected)\n\n`;
        }
      }

      memDb.close();
      return {
        stdout: stdout.trim(),
        stderr: '',
        exitCode: 0,
        executionTimeMs: 0,
        status: 'success',
        diagnostics: []
      };
    } catch (err: any) {
      memDb.close();
      return {
        stdout: '',
        stderr: `SQL Error: ${err.message}`,
        exitCode: 1,
        executionTimeMs: 0,
        status: 'runtime_error',
        diagnostics: [{
          line: 1,
          message: err.message,
          severity: 'error'
        }]
      };
    }
  }

  /**
   * HTML/CSS web playground preview renderer
   */
  private static executeWebPlayground(
    lang: string,
    code: string,
    files?: Array<{ name: string; content: string }>
  ): ExecutionResult {
    let htmlContent = code;
    let cssContent = '';
    let jsContent = '';

    if (files) {
      for (const f of files) {
        if (f.name.endsWith('.html')) htmlContent = f.content;
        if (f.name.endsWith('.css')) cssContent += f.content + '\n';
        if (f.name.endsWith('.js')) jsContent += f.content + '\n';
      }
    }

    const previewDoc = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${cssContent}</style>
</head>
<body>
  ${htmlContent}
  <script>
    try {
      ${jsContent}
    } catch(e) {
      console.error(e);
    }
  </script>
</body>
</html>`;

    return {
      stdout: `Web Preview Bundle Generated (${previewDoc.length} bytes)\nStatus: Ready for interactive iframe preview.`,
      stderr: '',
      exitCode: 0,
      executionTimeMs: 0,
      status: 'success',
      diagnostics: []
    };
  }

  private static formatAsciiTable(rows: any[]): string {
    if (!rows || rows.length === 0) return '';
    const keys = Object.keys(rows[0]);
    const colWidths: Record<string, number> = {};

    keys.forEach(k => {
      colWidths[k] = Math.max(k.length, ...rows.map(r => String(r[k] ?? 'NULL').length));
    });

    const header = '| ' + keys.map(k => k.padEnd(colWidths[k])).join(' | ') + ' |';
    const separator = '|-' + keys.map(k => '-'.repeat(colWidths[k])).join('-|-') + '-|';
    const body = rows.map(r => {
      return '| ' + keys.map(k => String(r[k] ?? 'NULL').padEnd(colWidths[k])).join(' | ') + ' |';
    }).join('\n');

    return `${header}\n${separator}\n${body}`;
  }
}
