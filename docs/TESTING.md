# Testing Architecture & Automation

## Test Coverage Strategy

The automated test suite (`test/suite.ts`) verifies critical system boundaries without external network dependencies:

1. **Database Relational Schema**: Verifies table initialization, indexes, foreign key enforcement, and seed templates count.
2. **Multi-Language Registry**: Asserts all 16 supported languages are registered with extensions and diagnostic parser hooks.
3. **Compiler Error Diagnostics**: Validates regex extractors for GCC, CPython, TypeScript, and SQLite errors to ensure line navigation works accurately.
4. **SQL Interactive Runner**: Asserts SQLite in-memory execution, query filtering, and table ASCII formatting.
5. **Security & Cryptography**: Tests bcrypt password hashing, rejection of invalid passwords, and JWT encoding/decoding.
6. **AI Assistant Reasoning Engine**: Tests AI typo auto-fixing, diff patch formatting, explanation extraction, and security risk auditing.
7. **Sandboxed Code Runner**: Validates process spawning, timeout enforcement, output capture, and process exit codes.

## Running Tests

Execute the suite directly using tsx:
```bash
npm test
```
All tests should pass with 0 failures before deploying.
