import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { SCHEMA_SQL } from './schema.js';
import { STARTER_TEMPLATES } from './seeds.js';
import bcrypt from 'bcryptjs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'collabcode.db');
export const db = new Database(DB_PATH);

// Enable WAL mode for high-concurrency performance and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  console.log(`[DB] Initializing database at ${DB_PATH}`);
  db.exec(SCHEMA_SQL);

  // Check and seed templates
  const templateCount = db.prepare('SELECT COUNT(*) as count FROM templates').get() as { count: number };
  if (templateCount.count === 0) {
    console.log('[DB] Seeding starter language templates...');
    const insertTemplate = db.prepare(`
      INSERT INTO templates (id, language, name, description, icon, default_filename, default_code, category, compiler_info)
      VALUES (@id, @language, @name, @description, @icon, @default_filename, @default_code, @category, @compiler_info)
    `);

    const insertMany = db.transaction((templates) => {
      for (const t of templates) {
        insertTemplate.run(t);
      }
    });

    insertMany(STARTER_TEMPLATES);
    console.log(`[DB] Seeded ${STARTER_TEMPLATES.length} language templates.`);
  }

  // Seed default admin and demo user if not present
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    console.log('[DB] Seeding demo users...');
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('developer123', salt);

    const insertUser = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertUser.run('usr_demo_1', 'DemoDeveloper', 'demo@collabcode.dev', demoPasswordHash, 'developer');
    insertUser.run('usr_guest_0', 'GuestUser', 'guest@collabcode.dev', demoPasswordHash, 'viewer');

    // Create a default multi-file demo project
    const projectId = 'proj_starter_python';
    db.prepare(`
      INSERT INTO projects (id, name, description, owner_id, default_language, is_public, share_token)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      'Python Calculator & Algorithms',
      'Starter multi-file Python project with math helpers and algorithm demonstrations.',
      'usr_demo_1',
      'python',
      1,
      'share_demo_token_123'
    );

    // Seed project files
    const insertFile = db.prepare(`
      INSERT INTO files (id, project_id, name, path, content, language, is_entry)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertFile.run(
      'file_main_py',
      projectId,
      'main.py',
      'main.py',
      `# CollabCode Python Calculator Application
from calculator import add, subtract, multiply, divide, power
import sys

def run_tests():
    print(f"🐍 Python Execution Environment v{sys.version.split()[0]}")
    print("========================================")
    print("Testing Mathematical Operations:")
    print("10 + 5 =", add(10, 5))
    print("10 - 5 =", subtract(10, 5))
    print("10 * 5 =", multiply(10, 5))
    print("10 / 5 =", divide(10, 5))
    print("2 ^ 8  =", power(2, 8))
    print("========================================")
    print("All calculations completed successfully!")

if __name__ == '__main__':
    run_tests()
`,
      'python',
      1
    );

    insertFile.run(
      'file_calc_py',
      projectId,
      'calculator.py',
      'calculator.py',
      `# Calculator Operations Module

def add(a: float, b: float) -> float:
    return a + b

def subtract(a: float, b: float) -> float:
    return a - b

def multiply(a: float, b: float) -> float:
    return a * b

def divide(a: float, b: float) -> float:
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

def power(a: float, b: float) -> float:
    return a ** b
`,
      'python',
      0
    );

    insertFile.run(
      'file_readme_md',
      projectId,
      'README.md',
      'README.md',
      `# Python Calculator & Algorithms Project

Welcome to your first multi-file project on CollabCode!

## Features
- Modular code architecture with \`main.py\` and \`calculator.py\`
- Real-time compiler/interpreter feedback
- Integrated AI Assistant for refactoring, explanations, and unit tests

## How to Run
Click the **Run** button at the top or press \`Ctrl+Enter\`!
`,
      'markdown',
      0
    );

    console.log('[DB] Seeded demo project with multiple files.');
  }
}
