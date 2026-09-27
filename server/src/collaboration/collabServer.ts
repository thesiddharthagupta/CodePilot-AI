import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage, Server } from 'http';
import url from 'url';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../auth/authMiddleware.js';

interface ClientConnection {
  ws: WebSocket;
  userId: string;
  username: string;
  projectId: string;
  color: string;
}

const USER_COLORS = [
  '#38bdf8', '#818cf8', '#34d399', '#f472b6',
  '#fbbf24', '#f87171', '#a78bfa', '#2dd4bf'
];

export class CollabServer {
  private wss: WebSocketServer;
  private rooms: Map<string, Set<ClientConnection>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request: IncomingMessage, socket, head) => {
      const parsedUrl = url.parse(request.url || '', true);
      const pathname = parsedUrl.pathname;

      if (pathname === '/ws') {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.wss.emit('connection', ws, request);
        });
      }
    });

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      const parsedUrl = url.parse(request.url || '', true);
      const projectId = (parsedUrl.query.projectId as string) || 'default-room';
      const token = parsedUrl.query.token as string;

      let userId = 'anon_' + Math.random().toString(36).substring(2, 6);
      let username = 'Anonymous Developer';

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          userId = decoded.id;
          username = decoded.username;
        } catch {
          // fallback to anonymous
        }
      }

      const clientColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
      const client: ClientConnection = {
        ws,
        userId,
        username,
        projectId,
        color: clientColor
      };

      this.joinRoom(projectId, client);

      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(client, message);
        } catch (e) {
          console.error('[Collab] Failed to parse message:', e);
        }
      });

      ws.on('close', () => {
        this.leaveRoom(projectId, client);
      });

      ws.on('error', (err) => {
        console.error('[Collab] WebSocket error:', err);
      });
    });
  }

  private joinRoom(projectId: string, client: ClientConnection) {
    if (!this.rooms.has(projectId)) {
      this.rooms.set(projectId, new Set());
    }
    const room = this.rooms.get(projectId)!;
    room.add(client);

    // Broadcast updated presence list
    this.broadcastPresence(projectId);

    // Send system announcement
    this.broadcastToRoom(projectId, {
      type: 'chat',
      sender: 'System',
      senderId: 'system',
      message: `${client.username} joined the workspace session.`,
      timestamp: new Date().toISOString()
    }, client);
  }

  private leaveRoom(projectId: string, client: ClientConnection) {
    const room = this.rooms.get(projectId);
    if (room) {
      room.delete(client);
      if (room.size === 0) {
        this.rooms.delete(projectId);
      } else {
        this.broadcastPresence(projectId);
        this.broadcastToRoom(projectId, {
          type: 'chat',
          sender: 'System',
          senderId: 'system',
          message: `${client.username} left the workspace session.`,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  private handleClientMessage(sender: ClientConnection, msg: any) {
    switch (msg.type) {
      case 'chat': {
        // Sanitize text message
        const cleanMsg = String(msg.message || '').trim().substring(0, 1000);
        if (cleanMsg.length > 0) {
          this.broadcastToRoom(sender.projectId, {
            type: 'chat',
            sender: sender.username,
            senderId: sender.userId,
            color: sender.color,
            message: cleanMsg,
            timestamp: new Date().toISOString()
          });
        }
        break;
      }

      case 'cursor': {
        this.broadcastToRoom(sender.projectId, {
          type: 'cursor',
          senderId: sender.userId,
          username: sender.username,
          color: sender.color,
          fileId: msg.fileId,
          lineNumber: msg.lineNumber,
          column: msg.column
        }, sender); // Don't echo to sender
        break;
      }

      case 'code_change': {
        this.broadcastToRoom(sender.projectId, {
          type: 'code_change',
          senderId: sender.userId,
          fileId: msg.fileId,
          content: msg.content,
          version: msg.version
        }, sender);
        break;
      }

      case 'execution_event': {
        this.broadcastToRoom(sender.projectId, {
          type: 'execution_event',
          senderId: sender.userId,
          username: sender.username,
          language: msg.language,
          status: msg.status
        });
        break;
      }
    }
  }

  private broadcastPresence(projectId: string) {
    const room = this.rooms.get(projectId);
    if (!room) return;

    const users = Array.from(room).map(c => ({
      userId: c.userId,
      username: c.username,
      color: c.color
    }));

    this.broadcastToRoom(projectId, {
      type: 'presence',
      users
    });
  }

  private broadcastToRoom(projectId: string, payload: any, exceptClient?: ClientConnection) {
    const room = this.rooms.get(projectId);
    if (!room) return;

    const data = JSON.stringify(payload);
    for (const client of room) {
      if (exceptClient && client.ws === exceptClient.ws) continue;
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }
}
