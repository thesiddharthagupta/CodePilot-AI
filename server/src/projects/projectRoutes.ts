import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, optionalAuthenticateToken } from '../auth/authMiddleware.js';

export const projectRouter = Router();

// Get all language templates
projectRouter.get('/templates', (req, res) => {
  const templates = db.prepare('SELECT * FROM templates ORDER BY name ASC').all();
  return res.json({ templates });
});

// List projects accessible to user
projectRouter.get('/', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const ownedProjects = db.prepare(`
    SELECT p.*, COUNT(f.id) as file_count, 'owner' as user_role
    FROM projects p
    LEFT JOIN files f ON f.project_id = p.id
    WHERE p.owner_id = ? AND p.deleted_at IS NULL
    GROUP BY p.id
    ORDER BY p.updated_at DESC
  `).all(userId);

  const sharedProjects = db.prepare(`
    SELECT p.*, COUNT(f.id) as file_count, pm.role as user_role
    FROM projects p
    JOIN project_members pm ON pm.project_id = p.id
    LEFT JOIN files f ON f.project_id = p.id
    WHERE pm.user_id = ? AND p.deleted_at IS NULL
    GROUP BY p.id
    ORDER BY p.updated_at DESC
  `).all(userId);

  return res.json({
    projects: ownedProjects,
    shared: sharedProjects
  });
});

// Get single project with files
projectRouter.get('/:id', optionalAuthenticateToken, (req, res) => {
  const { id } = req.params;
  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND deleted_at IS NULL').get(id) as any;

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  // Permission check
  const userId = req.user?.id;
  let userRole: 'owner' | 'editor' | 'viewer' | null = null;

  if (userId) {
    if (project.owner_id === userId) {
      userRole = 'owner';
    } else {
      const membership = db.prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?').get(id, userId) as any;
      if (membership) {
        userRole = membership.role;
      }
    }
  }

  // If not public and no membership
  if (!project.is_public && !userRole) {
    return res.status(403).json({ error: 'Access restricted: this project is private.' });
  }

  const files = db.prepare('SELECT * FROM files WHERE project_id = ? ORDER BY is_entry DESC, name ASC').all(id);

  return res.json({
    project,
    files,
    userRole: userRole || (project.is_public ? 'viewer' : null)
  });
});

// Create project (optionally from template)
projectRouter.post('/', authenticateToken, (req, res) => {
  const { name, description, language = 'python', templateId, is_public = 1 } = req.body;
  const userId = req.user!.id;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Project name is required.' });
  }

  const projectId = 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const shareToken = 'shr_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

  db.prepare(`
    INSERT INTO projects (id, name, description, owner_id, default_language, is_public, share_token)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(projectId, name.trim(), description || '', userId, language, is_public ? 1 : 0, shareToken);

  // Initialize files
  if (templateId) {
    const template = db.prepare('SELECT * FROM templates WHERE id = ? OR language = ?').get(templateId, templateId) as any;
    if (template) {
      const fileId = 'file_' + Date.now();
      db.prepare(`
        INSERT INTO files (id, project_id, name, path, content, language, is_entry)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `).run(fileId, projectId, template.default_filename, template.default_filename, template.default_code, template.language);

      // Add README.md
      db.prepare(`
        INSERT INTO files (id, project_id, name, path, content, language, is_entry)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `).run(
        'file_readme_' + Date.now(),
        projectId,
        'README.md',
        'README.md',
        `# ${name}\n\n${description || 'Created on CollabCode Online IDE'}\n\nLanguage: ${template.name}`,
        'markdown'
      );
    }
  } else {
    // Default single entry file
    const fileId = 'file_' + Date.now();
    db.prepare(`
      INSERT INTO files (id, project_id, name, path, content, language, is_entry)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(fileId, projectId, 'main.txt', 'main.txt', '// Start coding here\n', language);
  }

  const createdProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  const files = db.prepare('SELECT * FROM files WHERE project_id = ?').all(projectId);

  return res.status(201).json({
    project: createdProject,
    files,
    userRole: 'owner'
  });
});

// Update project metadata
projectRouter.patch('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, description, is_public, default_language } = req.body;
  const userId = req.user!.id;

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  if (!project) return res.status(404).json({ error: 'Project not found.' });

  if (project.owner_id !== userId) {
    return res.status(403).json({ error: 'Only the project owner can update project settings.' });
  }

  db.prepare(`
    UPDATE projects
    SET name = COALESCE(?, name),
        description = COALESCE(?, description),
        is_public = COALESCE(?, is_public),
        default_language = COALESCE(?, default_language),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, description, is_public !== undefined ? (is_public ? 1 : 0) : null, default_language, id);

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  return res.json({ project: updated });
});

// Duplicate project
projectRouter.post('/:id/duplicate', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const original = db.prepare('SELECT * FROM projects WHERE id = ? AND deleted_at IS NULL').get(id) as any;
  if (!original) return res.status(404).json({ error: 'Source project not found.' });

  const newProjectId = 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const shareToken = 'shr_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

  db.prepare(`
    INSERT INTO projects (id, name, description, owner_id, default_language, is_public, share_token)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    newProjectId,
    `${original.name} (Copy)`,
    original.description,
    userId,
    original.default_language,
    original.is_public,
    shareToken
  );

  const originalFiles = db.prepare('SELECT * FROM files WHERE project_id = ?').all(id) as any[];
  const insertFile = db.prepare(`
    INSERT INTO files (id, project_id, name, path, content, language, is_entry)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const f of originalFiles) {
    const newFileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    insertFile.run(newFileId, newProjectId, f.name, f.path, f.content, f.language, f.is_entry);
  }

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(newProjectId);
  const files = db.prepare('SELECT * FROM files WHERE project_id = ?').all(newProjectId);

  return res.status(201).json({ project, files, userRole: 'owner' });
});

// Delete project (soft delete)
projectRouter.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  if (!project) return res.status(404).json({ error: 'Project not found.' });

  if (project.owner_id !== userId) {
    return res.status(403).json({ error: 'Only the project owner can delete this project.' });
  }

  db.prepare('UPDATE projects SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
  return res.json({ message: 'Project successfully deleted.' });
});

// Export project as JSON bundle
projectRouter.get('/:id/export', optionalAuthenticateToken, (req, res) => {
  const { id } = req.params;
  const project = db.prepare('SELECT * FROM projects WHERE id = ? AND deleted_at IS NULL').get(id) as any;
  if (!project) return res.status(404).json({ error: 'Project not found.' });

  const files = db.prepare('SELECT name, path, content, language, is_entry FROM files WHERE project_id = ?').all(id);

  return res.json({
    exportVersion: '1.0',
    exportedAt: new Date().toISOString(),
    project: {
      name: project.name,
      description: project.description,
      language: project.default_language,
    },
    files
  });
});
