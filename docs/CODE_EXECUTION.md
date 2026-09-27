# Secure Multi-Language Code Execution Architecture

## Unified Execution Pipeline

Code execution follows the decoupled adapter model:

```
[Client / Monaco Editor]
         │
         ▼
[POST /api/execute]
         │
         ▼
[ExecutionService Orchestrator]
         ├── Language Validation & Entrypoint Resolution
         │
         ├── Execution Adapters:
         │   ├── WebPlaygroundAdapter (HTML / CSS)
         │   ├── SQLiteMemoryAdapter (SQL query analyzer)
         │   ├── PistonWorkerAdapter (Isolated remote/container runner)
         │   └── LocalSandboxWorker (Child process fallback sandbox)
         │
         ▼
[Execution Result & Error Diagnostics Parser]
         │
         ▼
[OutputDock: Stdout, Stderr, Metrics & Clickable Line Errors]
```

## Security & Resource Guardrails

1. **Safety Timeouts**: Hard limit of 10,000 ms to prevent infinite loops (e.g. `while True:`).
2. **File System Isolation**: Code executed locally runs in ephemeral temporary directories (`os.tmpdir()/collabcode-sandbox-XXXXXX`) that are forcibly purged upon process exit.
3. **No Dynamic Client Execution**: Arbitrary code is never evaluated on the main Node.js event loop or with `eval()` in client browsers.
4. **Environment Scrubbing**: Sensitive server environment variables are sanitized before spawning runner processes.

## Supported Languages & Adapters

| Language | Engine / Compiler | Error Diagnostic Parser | Execution Target |
|---|---|---|---|
| **Python** | CPython 3.10+ | File, Line, Exception type | Sandbox / Worker |
| **JavaScript** | Node.js v20+ / V8 | Line, Column, Stacktrace | Sandbox / Worker |
| **TypeScript** | TypeScript 5.x / tsx | TS Error Codes, Line, Col | Sandbox / Worker |
| **C** | GCC 10+ (-O2) | Line, Column, error/warning | Isolated Worker |
| **C++** | G++ 10+ (std=c++20) | Line, Column, error/warning | Isolated Worker |
| **Java** | OpenJDK 17+ | Line, Exception / Syntax | Isolated Worker |
| **Go** | Go 1.21+ | File, Line, Column | Isolated Worker |
| **Rust** | rustc 1.75+ | Error Code, Line, Column | Isolated Worker |
| **C#** | .NET SDK 7.0 | CS Error Code, Line, Col | Isolated Worker |
| **PHP** | PHP 8.2 CLI | Line, Fatal/Parse Error | Isolated Worker |
| **Kotlin** | Kotlin 1.9 / JVM | Line, Column, Unresolved | Isolated Worker |
| **Swift** | Swift 5.9 Compiler | Line, Column, Scope Error | Isolated Worker |
| **SQL** | SQLite 3.40+ In-Memory | Line, Near token, Syntax | SQLite Safe Memory |
| **Bash** | GNU Bash 5.1+ | Line, Command not found | Isolated Worker |
| **HTML5** | DOM Parser | HTML Syntax Validation | Sandbox Iframe Preview |
| **CSS3** | CSSOM Parser | CSS Syntax Validation | Sandbox Iframe Preview |
