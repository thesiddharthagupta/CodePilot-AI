import { Router } from 'express';
import { AIService } from './aiService.js';
import { optionalAuthenticateToken } from '../auth/authMiddleware.js';
import { db } from '../db/database.js';

export const aiRouter = Router();

// Perform context-aware AI action
aiRouter.post('/action', optionalAuthenticateToken, async (req, res) => {
  const { action, prompt, context, conversationId, projectId } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'AI action type is required.' });
  }

  if (!context || !context.language || !context.currentFile) {
    return res.status(400).json({ error: 'Valid editor context (language, currentFile, currentCode) is required.' });
  }

  try {
    const result = await AIService.processRequest({
      action,
      prompt,
      context,
      conversationId,
      projectId,
      userId: req.user?.id
    });

    return res.json(result);
  } catch (error: any) {
    console.error('[AI] Action error:', error);
    return res.status(500).json({ error: 'AI assistant processing failed.', details: error.message });
  }
});

// Get conversation messages
aiRouter.get('/conversations/:id/messages', optionalAuthenticateToken, (req, res) => {
  const { id } = req.params;
  const messages = db.prepare(`
    SELECT id, role, content, action_type, code_diff, created_at
    FROM ai_messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC
  `).all(id);

  return res.json({ messages });
});
