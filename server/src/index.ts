import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { initDatabase } from './db/database.js';
import { authRouter } from './auth/authRoutes.js';
import { projectRouter } from './projects/projectRoutes.js';
import { fileRouter } from './projects/fileRoutes.js';
import { executionRouter } from './execution/executionRoutes.js';
import { aiRouter } from './ai/aiRoutes.js';
import { CollabServer } from './collaboration/collabServer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = parseInt(process.env.PORT || '4000', 10);

// Initialize database & tables
initDatabase();

// Security & Parsing Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allows iframe previews of web playground and monaco workers
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.startsWith('/client') && !req.path.endsWith('.js') && !req.path.endsWith('.css')) {
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    features: {
      auth: true,
      execution: true,
      aiAssistant: true,
      collaboration: true
    }
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/files', fileRouter);
app.use('/api/execute', executionRouter);
app.use('/api/ai', aiRouter);

// Serve static client production build if available
const clientDistPath = path.resolve(process.cwd(), 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[Static] Serving production frontend from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Server Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.path
  });
});

// Attach WebSocket collaboration server
const collabServer = new CollabServer(server);

// Start HTTP and WebSocket server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 CollabCode Platform API running on port ${PORT}`);
  console.log(`📡 WebSocket Collaboration Hub listening on /ws`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
