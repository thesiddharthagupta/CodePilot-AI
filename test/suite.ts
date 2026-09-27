import { db, initDatabase } from '../server/src/db/database.js';
import { LANGUAGE_REGISTRY } from '../server/src/execution/languageRegistry.js';
import { ExecutionService } from '../server/src/execution/executionService.js';
import { AIService } from '../server/src/ai/aiService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../server/src/auth/authMiddleware.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, extraInfo = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${extraInfo ? '(' + extraInfo + ')' : ''}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 Starting CollabCode Platform Automated Test Suite');
  console.log('====================================================\n');

  // --- Suite 1: Database Integrity & Seeding ---
  console.log('▶ Suite 1: Database Initialization & Relational Schema');
  initDatabase();
  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all() as Array<{ name: string }>;
  const tableNames = tables.map(t => t.name);

  assert(tableNames.includes('users'), 'Table `users` exists');
  assert(tableNames.includes('projects'), 'Table `projects` exists');
  assert(tableNames.includes('files'), 'Table `files` exists');
  assert(tableNames.includes('templates'), 'Table `templates` exists');
  assert(tableNames.includes('executions'), 'Table `executions` exists');
  assert(tableNames.includes('ai_conversations'), 'Table `ai_conversations` exists');
  assert(tableNames.includes('ai_messages'), 'Table `ai_messages` exists');

  // Check 16 Language Templates Seeding
  const tplCount = db.prepare('SELECT COUNT(*) as count FROM templates').get() as { count: number };
  assert(tplCount.count >= 16, `All 16 Language Templates seeded (Found: ${tplCount.count})`);

  // --- Suite 2: Multi-Language Registry ---
  console.log('\n▶ Suite 2: Multi-Language Registry & Extensibility');
  const expectedLanguages = [
    'c', 'cpp', 'java', 'python', 'javascript', 'typescript',
    'go', 'rust', 'php', 'csharp', 'kotlin', 'swift',
    'sql', 'html', 'css', 'bash'
  ];

  for (const lang of expectedLanguages) {
    const def = LANGUAGE_REGISTRY[lang];
    assert(!!def, `Language definition registered: ${lang.toUpperCase()}`);
    assert(!!def.extension, `Language ${lang} has valid extension (${def?.extension})`);
    assert(typeof def.parseDiagnostics === 'function', `Language ${lang} has diagnostic parser`);
  }

  // --- Suite 3: Diagnostic Parsers ---
  console.log('\n▶ Suite 3: Compiler Error Diagnostics Parsing');
  const pythonErrorSample = `File "main.py", line 14, in <module>\n    x = 10 / 0\nZeroDivisionError: division by zero`;
  const pyDiagnostics = LANGUAGE_REGISTRY['python'].parseDiagnostics(pythonErrorSample);
  assert(pyDiagnostics.length > 0, 'Python ZeroDivisionError parsed');
  assert(pyDiagnostics[0]?.line === 14, 'Python error line parsed correctly (line 14)');

  const cErrorSample = `main.c:22:5: error: expected ';' before 'return'`;
  const cDiagnostics = LANGUAGE_REGISTRY['c'].parseDiagnostics(cErrorSample);
  assert(cDiagnostics.length > 0, 'GCC C error diagnostic parsed');
  assert(cDiagnostics[0]?.line === 22, 'C error line parsed correctly (line 22)');

  // --- Suite 4: In-Memory SQL Execution Engine ---
  console.log('\n▶ Suite 4: SQL Interactive Engine');
  const sqlSample = `
    CREATE TABLE employees (id INT, name TEXT, salary INT);
    INSERT INTO employees VALUES (1, 'Alice', 120000), (2, 'Bob', 95000);
    SELECT name, salary FROM employees WHERE salary > 100000;
  `;
  const sqlResult = await ExecutionService.execute({ language: 'sql', code: sqlSample });
  assert(sqlResult.exitCode === 0, 'SQL script executed successfully');
  assert(sqlResult.stdout.includes('Alice'), 'SQL output contains query match ("Alice")');
  assert(!sqlResult.stdout.includes('Bob'), 'SQL output excludes non-matching rows ("Bob")');

  // --- Suite 5: Authentication & Security Tokens ---
  console.log('\n▶ Suite 5: Authentication, Password Hashing & JWT');
  const rawPassword = 'SecureSuperPassword!2026';
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(rawPassword, salt);

  assert(bcrypt.compareSync(rawPassword, hash), 'Password bcrypt verification succeeded');
  assert(!bcrypt.compareSync('WrongPassword', hash), 'Password bcrypt rejects invalid password');

  const testPayload = { id: 'usr_test_1', username: 'TestUser', email: 'test@collabcode.dev', role: 'developer' as const };
  const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' });
  const decoded = jwt.verify(token, JWT_SECRET) as typeof testPayload;
  assert(decoded.id === testPayload.id, 'JWT token successfully encodes and verifies user payload');

  // --- Suite 6: AI Collaboration & Semantic Transformations ---
  console.log('\n▶ Suite 6: AI Context-Aware Assistant Engine');
  const pythonBuggyCode = `pritn("Hello World")`;
  const fixRes = await AIService.processRequest({
    action: 'fix',
    context: {
      language: 'python',
      currentFile: 'main.py',
      currentCode: pythonBuggyCode,
      compilerOutput: "NameError: name 'pritn' is not defined"
    }
  });

  assert(fixRes.proposedCode?.includes('print("Hello World")') || false, 'AI Fix correctly resolved typo "pritn" to "print"');
  assert(!!fixRes.codeDiff, 'AI Fix generated diff preview');

  const explainRes = await AIService.processRequest({
    action: 'explain',
    context: {
      language: 'javascript',
      currentFile: 'app.js',
      currentCode: `function add(a, b) { return a + b; }`
    }
  });
  assert(explainRes.explanation.includes('JAVASCRIPT'), 'AI Explain identified target language');

  const reviewRes = await AIService.processRequest({
    action: 'review',
    context: {
      language: 'python',
      currentFile: 'test.py',
      currentCode: `eval(user_input)`
    }
  });
  assert(reviewRes.reviewPoints?.some(p => p.type === 'security') || false, 'AI Code Review identified security risk in `eval`');

  // --- Suite 7: Local Subprocess Execution ---
  console.log('\n▶ Suite 7: Sandboxed Code Execution Pipeline');
  const pyCode = `import sys\nprint("SANDBOX_SUCCESS_PY")\nprint(f"VER: {sys.version.split()[0]}")`;
  const execResult = await ExecutionService.execute({ language: 'python', code: pyCode });
  assert(execResult.stdout.includes('SANDBOX_SUCCESS_PY'), 'Python sandbox successfully executed code and captured stdout');
  assert(execResult.exitCode === 0, 'Sandbox returned exit code 0');

  // --- Summary ---
  console.log('\n====================================================');
  console.log(`🏁 Test Results: ${passedTests} passed, ${failedTests} failed`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
