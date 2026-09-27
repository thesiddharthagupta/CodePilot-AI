# Contributing to CollabCode

## Adding a New Programming Language

To add support for a new language:

1. **Register the Language in `server/src/execution/languageRegistry.ts`**:
   - Define language id, name, extension, monacoLanguage, compiled status, and error regex parser function:
   ```typescript
   LANGUAGE_REGISTRY['ruby'] = {
     id: 'ruby',
     name: 'Ruby',
     extension: '.rb',
     monacoLanguage: 'ruby',
     pistonLanguage: 'ruby',
     pistonVersion: '3.0.1',
     isCompiled: false,
     canExecuteLocally: true,
     parseDiagnostics: (output: string) => { ... }
   };
   ```

2. **Add Starter Template in `server/src/db/seeds.ts`**:
   - Add default code, icon, category, and compiler info.

3. **Verify in Test Suite**:
   - Run `npm test` to verify automatic test assertion checks.
