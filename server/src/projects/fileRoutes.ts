import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from '../auth/authMiddleware.js';

export const fileRouter = Router();

// Helper to check user permission on project
function checkProjectWriteAccess(projectId: string, userId: string): boolean {
  const project = db.prepare('SELECT owner_id FROM projects WHERE id = ? AND deleted_at IS NULL').get(projectId) as any;
  if (!project) return false;
  if (project.owner_id === userId) return true;

  const member = db.prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?').get(projectId, userId) as any;
  return member && (member.role === 'owner' || member.role === 'editor');
}

// Create file
fileRouter.post('/', authenticateToken, (req, res) => {
  const { projectId, name, path = name, content = '', language = 'text', isEntry = 0 } = req.body;
  const userId = req.user!.id;

  if (!projectId || !name) {
    return res.status(400).json({ error: 'Project ID and file name are required.' });
  }

  if (!checkProjectWriteAccess(projectId, userId)) {
    return res.status(403).json({ error: 'Write permission denied for this project.' });
  }

  // Check duplicate path
  const existing = db.prepare('SELECT id FROM files WHERE project_id = ? AND path = ?').get(projectId, path);
  if (existing) {
    return res.status(409).json({ error: 'A file with this path already exists in this project.' });
  }

  const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  if (isEntry) {
    db.prepare('UPDATE files SET is_entry = 0 WHERE project_id = ?').run(projectId);
  }

  db.prepare(`
    INSERT INTO files (id, project_id, name, path, content, language, is_entry)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(fileId, projectId, name, path, content, language, isEntry ? 1 : 0);

  // Update project's updated_at
  db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(projectId);

  const createdFile = db.prepare('SELECT * FROM files WHERE id = ?').get(fileId);
  return res.status(201).json({ file: createdFile });
});

// Update single file (content, rename, language, entry point)
fileRouter.patch('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { content, name, path, language, isEntry } = req.body;
  const userId = req.user!.id;

  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(id) as any;
  if (!file) return res.status(404).json({ error: 'File not found.' });

  if (!checkProjectWriteAccess(file.project_id, userId)) {
    return res.status(403).json({ error: 'Write permission denied for this project.' });
  }

  if (isEntry) {
    db.prepare('UPDATE files SET is_entry = 0 WHERE project_id = ?').run(file.project_id);
  }

  db.prepare(`
    UPDATE files
    SET content = COALESCE(?, content),
        name = COALESCE(?, name),
        path = COALESCE(?, path),
        language = COALESCE(?, language),
        is_entry = COALESCE(?, is_entry),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    content !== undefined ? content : null,
    name !== undefined ? name : null,
    path !== undefined ? path : null,
    language !== undefined ? language : null,
    isEntry !== undefined ? (isEntry ? 1 : 0) : null,
    id
  );

  db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(file.project_id);

  const updatedFile = db.prepare('SELECT * FROM files WHERE id = ?').get(id);
  return res.json({ file: updatedFile });
});

// Delete file
fileRouter.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(id) as any;
  if (!file) return res.status(404).json({ error: 'File not found.' });

  if (!checkProjectWriteAccess(file.project_id, userId)) {
    return res.status(403).json({ error: 'Write permission denied for this project.' });
  }

  // Ensure project retains at least one file
  const fileCount = db.prepare('SELECT COUNT(*) as count FROM files WHERE project_id = ?').get(file.project_id) as any;
  if (fileCount.count <= 1) {
    return res.status(400).json({ error: 'Cannot delete the only file in a project.' });
  }

  db.prepare('DELETE FROM files WHERE id = ?').run(id);

  // If entry file was deleted, set next file as entry
  if (file.is_entry) {
    const nextFile = db.prepare('SELECT id FROM files WHERE project_id = ? LIMIT 1').get(file.project_id) as any;
    if (nextFile) {
      db.prepare('UPDATE files SET is_entry = 1 WHERE id = ?').run(nextFile.id);
    }
  }

  db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(file.project_id);

  return res.json({ message: 'File successfully deleted.' });
});

// Batch save multiple files (autosave or multi-file AI apply)
fileRouter.post('/batch-save', authenticateToken, (req, res) => {
  const { projectId, files } = req.body;
  const userId = req.user!.id;

  if (!projectId || !Array.isArray(files)) {
    return res.status(400).json({ error: 'projectId and files array are required.' });
  }

  if (!checkProjectWriteAccess(projectId, userId)) {
    return res.status(403).json({ error: 'Write permission denied for this project.' });
  }

  const updateStmt = db.prepare(`
    UPDATE files
    SET content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND project_id = ?
  `);

  const updateMany = db.transaction((fileList) => {
    for (const f of fileList) {
      if (f.id && f.content !== undefined) {
        updateStmt.run(f.content, f.id, projectId);
      }
    }
  });

  updateMany(files);
  db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(projectId);

  const updatedFiles = db.prepare('SELECT * FROM files WHERE project_id = ?').all(projectId);
  return res.json({ files: updatedFiles, savedAt: new Date().toISOString() });
});
