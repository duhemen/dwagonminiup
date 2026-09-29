import { Server as SocketIOServer, Socket } from 'socket.io';
import crypto from 'crypto';
import { getRecentMetrics, startMetricsCollector, MetricPoint } from '../services/metrics-service';

let io: SocketIOServer | null = null;

interface AuthSocket extends Socket {
  userId?: string;
  userRole?: string;
  userEmail?: string;
}

function verifyJwt(token: string): any {
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) throw new Error('Invalid token format');
  const expected = crypto
    .createHmac('sha256', process.env.JWT_SECRET ?? 'dev-secret')
    .update(`${header}.${body}`)
    .digest('base64url');
  if (signature !== expected) throw new Error('Invalid signature');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (payload.exp && payload.exp * 1000 < Date.now()) throw new Error('Token expired');
  return payload;
}

export function initWebSocket(httpServer: any): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: true, credentials: true },
    path: '/socket.io',
  });

  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No auth token'));
    try {
      const payload = verifyJwt(token);
      socket.userId = payload.sub;
      socket.userRole = payload.role;
      socket.userEmail = payload.email;
      next();
    } catch (e: any) {
      next(new Error(`Invalid token: ${e.message}`));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    const { userId, userRole, userEmail } = socket;
    console.log(`[ws] ✅ ${userEmail} (${userRole}) connected — socket:${socket.id}`);

    if (userId) socket.join(`user:${userId}`);
    if (userRole) socket.join(`role:${userRole}`);
    socket.join('metrics:subscribers');

    // Kirim metrics terakhir langsung saat connect
    socket.emit('metrics:snapshot', getRecentMetrics());

    socket.on('ping', () => socket.emit('pong', { t: Date.now() }));
    socket.on('disconnect', (reason) => {
      console.log(`[ws] ❌ ${userEmail} disconnected (${reason})`);
    });
  });

  // Start metrics collector → broadcast tiap 2 detik
  startMetricsCollector((m: MetricPoint) => {
    if (!io) return;
    io.to('metrics:subscribers').emit('metrics:update', m);
  });

  console.log('[ws] Socket.io server initialized (with metrics streaming)');
  return io;
}

export function getIO(): SocketIOServer | null { return io; }

export function emitToUser(userId: string, event: string, data: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToRole(role: string, event: string, data: any) {
  if (!io) return;
  io.to(`role:${role}`).emit(event, data);
}

export function emitToAll(event: string, data: any) {
  if (!io) return;
  io.emit(event, data);
}

export function getStats() {
  if (!io) return { connected: 0, rooms: 0 };
  return {
    connected: io.sockets.sockets.size,
    rooms: io.sockets.adapter.rooms.size,
  };
}