# Database Schema & Relational Models

CollabCode utilizes SQLite in Write-Ahead Logging (`WAL`) mode for high-concurrency read/write operations with strict foreign key constraints.

## Entity Relationship Summary

```
users (1) ──< (N) projects (1) ──< (N) files
  │                  │
  │                  └──< (N) project_members >── (1) users
  │                  │
  │                  └──< (N) ai_conversations (1) ──< (N) ai_messages
  │
  └──< (N) executions
```

## Tables & Columns

### 1. `users`
- `id` (TEXT PRIMARY KEY)
- `username` (TEXT UNIQUE NOT NULL)
- `email` (TEXT UNIQUE NOT NULL)
- `password_hash` (TEXT NOT NULL)
- `role` ('admin' | 'developer' | 'viewer')
- `avatar_url` (TEXT)
- `created_at`, `updated_at` (DATETIME)

### 2. `projects`
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `description` (TEXT)
- `owner_id` (TEXT NOT NULL, FK -> users.id)
- `default_language` (TEXT NOT NULL)
- `is_public` (INTEGER NOT NULL DEFAULT 1)
- `share_token` (TEXT UNIQUE NOT NULL)
- `created_at`, `updated_at`, `deleted_at` (DATETIME)

### 3. `files`
- `id` (TEXT PRIMARY KEY)
- `project_id` (TEXT NOT NULL, FK -> projects.id ON DELETE CASCADE)
- `name` (TEXT NOT NULL)
- `path` (TEXT NOT NULL)
- `content` (TEXT NOT NULL)
- `language` (TEXT NOT NULL)
- `is_entry` (INTEGER DEFAULT 0)
- `created_at`, `updated_at` (DATETIME)

### 4. `templates`
- `id` (TEXT PRIMARY KEY)
- `language` (TEXT UNIQUE NOT NULL)
- `name`, `description`, `icon`, `default_filename`, `default_code`, `category`, `compiler_info` (TEXT)

### 5. `executions`
- `id` (TEXT PRIMARY KEY)
- `user_id` (FK -> users.id)
- `project_id` (FK -> projects.id)
- `language`, `code`, `stdin`, `stdout`, `stderr` (TEXT)
- `exit_code` (INTEGER)
- `execution_time_ms` (REAL)
- `status` (TEXT)
- `created_at` (DATETIME)

### 6. `ai_conversations` & `ai_messages`
- Manages AI assistance logs, action types, diff records, and context history.
