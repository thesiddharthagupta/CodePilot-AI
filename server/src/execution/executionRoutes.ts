import { Router } from 'express';
import { ExecutionService } from './executionService.js';
import { LANGUAGE_REGISTRY } from './languageRegistry.js';
import { optionalAuthenticateToken } from '../auth/authMiddleware.js';
import { db } from '../db/database.js';

export const executionRouter = Router();

// Execute code
executionRouter.post('/', optionalAuthenticateToken, async (req, res) => {
  const { language, code, files, stdin, projectId } = req.body;

  if (!language) {
    return res.status(400).json({ error: 'Language parameter is required.' });
  }

  if (!code && (!files || files.length === 0)) {
    return res.status(400).json({ error: 'Code or project files must be provided.' });
  }

  try {
    const result = await ExecutionService.execute({
      language,
      code,
      files,
      stdin,
      userId: req.user?.id,
      projectId
    });

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({
      error: 'Code execution pipeline failed.',
      details: error.message
    });
  }
});

// List all supported programming languages
executionRouter.get('/languages', (req, res) => {
  const languages = Object.values(LANGUAGE_REGISTRY).map(lang => ({
    id: lang.id,
    name: lang.name,
    extension: lang.extension,
    monacoLanguage: lang.monacoLanguage,
    isCompiled: lang.isCompiled,
    pistonVersion: lang.pistonVersion
  }));

  return res.json({ languages });
});

// Execution history for user/project
executionRouter.get('/history', optionalAuthenticateToken, (req, res) => {
  const { projectId } = req.query;
  const userId = req.user?.id;

  let records: any[] = [];
  if (projectId) {
    records = db.prepare(`
      SELECT id, language, status, exit_code, execution_time_ms, created_at
      FROM executions
      WHERE project_id = ?
      ORDER BY created_at DESC
      LIMIT 25
    `).all(projectId);
  } else if (userId) {
    records = db.prepare(`
      SELECT id, language, status, exit_code, execution_time_ms, created_at
      FROM executions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 25
    `).all(userId);
  }

  return res.json({ history: records });
});
