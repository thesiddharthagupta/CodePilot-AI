# CollabCode REST & WebSocket API Specification

## Base URL
- HTTP: `http://localhost:4000/api`
- WebSocket: `ws://localhost:4000/ws`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a new developer account.
- **Request Body**:
  ```json
  {
    "username": "CodeNinja",
    "email": "ninja@example.com",
    "password": "Password123"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "user": { "id": "usr_...", "username": "CodeNinja", "email": "ninja@example.com", "role": "developer" },
    "token": "eyJhbGciOi..."
  }
  ```

### `POST /api/auth/login`
Authenticates existing credentials.
- **Request Body**:
  ```json
  { "identifier": "ninja@example.com", "password": "Password123" }
  ```

### `POST /api/auth/guest`
Generates a zero-friction guest session.

### `GET /api/auth/me`
Returns current profile for authenticated JWT token in `Authorization: Bearer <token>`.

---

## 2. Project Endpoints (`/api/projects`)

### `GET /api/projects`
List owned and shared projects for the authenticated user.

### `GET /api/projects/:id`
Retrieves project details, permissions, and files list.

### `POST /api/projects`
Creates a new project.
- **Request Body**:
  ```json
  {
    "name": "Python Matrix Multiplier",
    "description": "Linear algebra computations",
    "language": "python",
    "templateId": "tpl-python"
  }
  ```

### `POST /api/projects/:id/duplicate`
Duplicates an existing project and all its associated files.

### `DELETE /api/projects/:id`
Soft-deletes project.

### `GET /api/projects/templates`
Retrieves starter templates for all 16 supported programming languages.

---

## 3. File Endpoints (`/api/files`)

### `POST /api/files`
Creates a new file in a project.
- **Request Body**:
  ```json
  {
    "projectId": "proj_123",
    "name": "matrix.py",
    "content": "# Matrix module\n",
    "language": "python"
  }
  ```

### `PATCH /api/files/:id`
Updates content or metadata of a file.

### `POST /api/files/batch-save`
Saves multiple project files atomically.
- **Request Body**:
  ```json
  {
    "projectId": "proj_123",
    "files": [
      { "id": "file_1", "content": "..." },
      { "id": "file_2", "content": "..." }
    ]
  }
  ```

---

## 4. Execution Endpoints (`/api/execute`)

### `POST /api/execute`
Submits code for compilation and execution.
- **Request Body**:
  ```json
  {
    "language": "python",
    "code": "print('Hello CollabCode!')",
    "files": [{ "name": "main.py", "content": "..." }],
    "stdin": "optional input",
    "projectId": "proj_123"
  }
  ```
- **Response**:
  ```json
  {
    "stdout": "Hello CollabCode!\n",
    "stderr": "",
    "exitCode": 0,
    "executionTimeMs": 42,
    "status": "success",
    "diagnostics": []
  }
  ```

### `GET /api/execute/languages`
Lists all 16 supported languages with extensions, Monaco identifiers, and compilation flags.

---

## 5. AI Assistant Endpoints (`/api/ai`)

### `POST /api/ai/action`
Executes an AI pairing action with editor context.
- **Request Body**:
  ```json
  {
    "action": "fix",
    "prompt": "Fix name error",
    "context": {
      "language": "python",
      "currentFile": "main.py",
      "currentCode": "pritn('Hello')",
      "compilerOutput": "NameError: name 'pritn' is not defined",
      "errorLine": 1
    }
  }
  ```
- **Response**:
  ```json
  {
    "conversationId": "conv_123",
    "action": "fix",
    "explanation": "Corrected misspelled function `pritn` to `print`.",
    "proposedCode": "print('Hello')",
    "codeDiff": "--- Original\n+++ AI Proposed\n@@ -1 +1 @@\n-pritn('Hello')\n+print('Hello')",
    "suggestedAction": "review"
  }
  ```

---

## 6. WebSocket Protocol (`/ws`)

Connect via `ws://localhost:4000/ws?projectId=<projectId>&token=<jwtToken>`.

### Inbound Events
- `{ "type": "chat", "message": "Can you check line 15?" }`
- `{ "type": "cursor", "fileId": "file_1", "lineNumber": 15, "column": 4 }`
- `{ "type": "code_change", "fileId": "file_1", "content": "..." }`

### Outbound Events
- `{ "type": "presence", "users": [{ "userId": "...", "username": "...", "color": "#38bdf8" }] }`
- `{ "type": "chat", "sender": "Alice", "color": "#38bdf8", "message": "...", "timestamp": "..." }`
- `{ "type": "cursor", "senderId": "...", "username": "Alice", "color": "...", "lineNumber": 15, "column": 4 }`
