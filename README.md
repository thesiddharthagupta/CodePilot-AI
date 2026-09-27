# CollabCode — Production AI-Powered Online Coding Platform & IDE

CollabCode is an enterprise-grade, browser-based online IDE, multi-language compiler, and AI pair-programming workspace. It combines the streamlined, multi-language coding experience inspired by Programiz with Monaco Editor, context-aware AI collaboration, sandbox execution across 16+ languages, and real-time multiplayer sharing.

---

## 🌟 Key Features

### 1. Multi-Language Code Playground & Compiler
- **16 Supported Languages**: Python, JavaScript, TypeScript, C, C++, Java, Go, Rust, C#, PHP, Kotlin, Swift, SQL, HTML5, CSS3, and Bash.
- **Unified Execution Architecture**: `Language -> Compiler/Runtime Adapter -> Execution Worker -> Result`.
- **Interactive Output Dock**:
  - Live stdout and stderr streaming.
  - Interactive standard input (stdin).
  - Clickable compiler error diagnostics that automatically jump the editor to the exact line and column.
  - Interactive HTML/CSS iframe sandbox preview.
  - Execution metrics: elapsed time (ms), exit code, memory usage.

### 2. Context-Aware AI Coding Assistant
- **10 Native Action Capabilities**:
  - **Explain**: Explains algorithms and structural concepts in natural language.
  - **Fix**: Detects compiler/runtime errors and automatically proposes bug fixes.
  - **Generate**: Synthesizes production code from user prompts.
  - **Optimize**: Identifies performance bottlenecks, allocations, and algorithmic complexity.
  - **Debug**: Traces runtime exceptions and type mismatch states.
  - **Refactor**: Restructures logic for clean architecture and SOLID principles.
  - **Tests**: Generates unit test suites with assertion coverage.
  - **Document**: Injects standard JSDoc/docstrings and architecture notes.
  - **Convert**: Transpiles code across languages (e.g. Python to TypeScript/C++).
  - **Review**: Audits security vulnerabilities, code smells, and performance.
- **AI ↔ Editor Collaboration**:
  - Computes visual code diffs between current file and AI suggestions.
  - **1-Click Apply to Editor** button with unsaved change tracking.

### 3. Professional Monaco Code Editor
- IntelliSense and syntax highlighting for all 16 languages.
- Bracket pair colorization and code folding.
- Minimap toggle, configurable font scale (12–20px), tab size (2 or 4 spaces), and word wrapping.
- Keyboard shortcuts: `Ctrl+Enter` to run, `Ctrl+S` to save.

### 4. Project Workspace & Multi-File Management
- Full multi-file project workspace with entry point selection.
- Project duplication, export/import JSON bundles, and file tree search.
- Pre-seeded starter templates with idiomatic code for all 16 languages.

### 5. Real-Time Collaboration & Sharing
- WebSocket collaboration hub broadcasting presence, active users, live edits, and team notifications.
- Public and private share links with role-based permissions (Viewer, Editor, Owner).

### 6. Relational Persistence & Security
- Embedded SQLite with Write-Ahead Logging (WAL) and foreign key constraints.
- Bcrypt password hashing and JWT token authentication with instant zero-friction guest sessions.
- Sandboxed worker isolation with safety timeouts and process constraints.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ (tested on Node v20/v24)
- npm v9+

### Installation & Run

1. Clone or navigate to the workspace:
   ```bash
   cd "Code-Collab Prototype"
   ```

2. Install dependencies:
   ```bash
   npm install
   npm --prefix client install
   ```

3. Build the frontend:
   ```bash
   npm run build
   ```

4. Start the unified production server:
   ```bash
   npm start
   ```

5. Open your browser:
   - Web IDE: [http://localhost:4000](http://localhost:4000)
   - API Health Check: [http://localhost:4000/api/health](http://localhost:4000/api/health)

### Running Automated Test Suite
```bash
npm test
```
Runs 72 automated test assertions covering database schema, multi-language registries, error diagnostics parsers, SQL execution, auth bcrypt/JWT, AI actions, and sandboxed runner pipelines.

---

## 📁 Repository Structure

```
├── client/                     # Vite + React 19 + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Monaco Editor, Navbar, Sidebar, OutputDock, AIPanel
│   │   │   └── Modals/         # Auth, NewProject, Share, Settings, Templates
│   │   ├── services/api.ts     # Typed API Client
│   │   ├── types.ts            # Domain TypeScript types
│   │   ├── App.tsx             # Main IDE state manager
│   │   └── index.css           # Developer Design System & Tokens
│   └── package.json
│
├── server/                     # Node.js + Express + TypeScript Backend
│   └── src/
│       ├── auth/               # JWT & Bcrypt Authentication & RBAC
│       ├── projects/           # Project & File CRUD and Batch Save
│       ├── execution/          # Multi-Language Runner, Sandbox & Diagnostic Parsers
│       ├── ai/                 # Context Manager, Semantic Engine & Diff Generator
│       ├── collaboration/      # Real-Time WebSocket Server
│       ├── db/                 # SQLite Database, Schema DDL & 16 Language Seeds
│       └── index.ts            # Server entrypoint & static client server
│
├── test/
│   └── suite.ts                # End-to-end Automated Test Suite (72 assertions)
│
├── Dockerfile                  # Multi-stage production container build
├── docker-compose.yml          # Container composition definition
├── .env.example                # Environment variables specification
└── docs/                       # Complete architectural and operational guides
```

---

## 📖 Detailed Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — System architecture, execution queue, and data flow.
- [API.md](docs/API.md) — RESTful API endpoints and WebSocket protocol specifications.
- [AI_ASSISTANT.md](docs/AI_ASSISTANT.md) — AI context hierarchy, actions, diff engine, and LLM integrations.
- [CODE_EXECUTION.md](docs/CODE_EXECUTION.md) — Multi-language sandbox isolation, resource limits, and error diagnostics.
- [DATABASE.md](docs/DATABASE.md) — Relational SQLite schema, entities, and indexes.
- [SECURITY.md](docs/SECURITY.md) — Authentication, authorization, XSS mitigation, and sandbox safety.
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) — Production Docker, environment variables, and reverse proxy setup.
- [SETUP.md](docs/SETUP.md) — Step-by-step developer environment setup.
- [ENVIRONMENT.md](docs/ENVIRONMENT.md) — Environment variables guide.
- [TESTING.md](docs/TESTING.md) — Test architecture and running automated suites.
- [CONTRIBUTING.md](docs/CONTRIBUTING.md) — Guidelines for adding new programming languages and features.
