import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import { JWT_SECRET, authenticateToken } from './authMiddleware.js';

export const authRouter = Router();

// Register new user
authRouter.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  if (username.length < 3 || password.length < 6) {
    return res.status(400).json({
      error: 'Username must be at least 3 characters and password at least 6 characters.'
    });
  }

  // Check uniqueness
  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) {
    return res.status(409).json({ error: 'Username or email already in use.' });
  }

  const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role)
    VALUES (?, ?, ?, ?, 'developer')
  `).run(id, username, email, password_hash);

  const payload = { id, username, email, role: 'developer' as const };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return res.status(201).json({
    user: payload,
    token
  });
});

// Login
authRouter.post('/login', (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or username

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/username and password are required.' });
  }

  const user = db.prepare(`
    SELECT id, username, email, password_hash, role, avatar_url
    FROM users
    WHERE email = ? OR username = ?
  `).get(identifier, identifier) as any;

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const passwordMatch = bcrypt.compareSync(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    user: payload,
    token
  });
});

// Instant guest login (zero-friction onboarding)
authRouter.post('/guest', (req, res) => {
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const id = 'usr_guest_' + Date.now();
  const username = `Guest_${randomSuffix}`;
  const email = `guest_${randomSuffix}@collabcode.local`;
  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync('guest_token_' + randomSuffix, salt);

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role)
    VALUES (?, ?, ?, ?, 'developer')
  `).run(id, username, email, password_hash);

  const payload = { id, username, email, role: 'developer' as const };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    user: payload,
    token,
    isGuest: true
  });
});

// Current user profile
authRouter.get('/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, username, email, role, avatar_url, created_at FROM users WHERE id = ?').get(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json({ user });
});
