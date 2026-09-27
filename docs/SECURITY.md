# Security Policy & Hardening Guidelines

## 1. Authentication & Session Security
- Passwords are salt-hashed using `bcrypt` (10 rounds). Plaintext passwords are never stored or logged.
- API requests authenticate using stateless `JWT` tokens with strict expiration.
- Instant guest sessions are provisioned with unique, cryptographically-isolated user IDs.

## 2. Authorization & RBAC
- Role-Based Access Control (`admin`, `developer`, `viewer`).
- Project access checks verify ownership or `project_members` membership for all mutating endpoints (`PATCH`, `DELETE`, `batch-save`).
- Unauthenticated requests are rejected on private projects.

## 3. XSS (Cross-Site Scripting) Prevention
- In the original prototype, unescaped user messages were directly appended to DOM via `innerHTML += ...`.
- In the production architecture:
  - All output is rendered using React's safe JSX encoding.
  - Team chat messages are sanitized and rendered as text nodes.
  - Web playground previews execute inside sandboxed iframes (`sandbox="allow-scripts"`).

## 4. Code Execution Sandboxing
- Arbitrary code execution is isolated from the main application server process.
- Execution timeout bounds (10s max) prevent runaway denial of service.
- Local sandbox fallback utilizes temporary random directories with immediate cleanup on process exit.

## 5. Secret Key Isolation
- Third-party API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`) and JWT secrets reside exclusively in backend environment variables and are never bundled into client assets.
