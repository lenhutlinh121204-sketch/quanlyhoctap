import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Cấu hình CORS cho Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Lưu trữ tin nhắn và người dùng (trong bộ nhớ - dùng cho dev, cần DB cho production)
const messages = [];
const users = {};
let messageId = 0;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API lấy lịch sử tin nhắn (optional - cho lần đầu load)
app.get('/api/messages', (req, res) => {
  const lastMessages = messages.slice(-50); // Lấy 50 tin nhắn gần nhất
  res.json(lastMessages);
});

// API lấy danh sách user online
app.get('/api/users', (req, res) => {
  const onlineUsers = Object.values(users).filter(u => u.online);
  res.json(onlineUsers);
});

// ==================== SOCKET.IO EVENTS ====================

io.on('connection', (socket) => {
  console.log(`[CONNECT] ${socket.id}`);

  // 1. USER JOINS (Người dùng tham gia)
  socket.on('user-join', (userData) => {
    const { nickname, animalName, emoji, progress } = userData;
    
    users[socket.id] = {
      id: socket.id,
      nickname,
      animalName,
      online: true,
      emoji: emoji || '🙂',
      progress: typeof progress === 'number' ? progress : 0,
      joinedAt: new Date(),
      socketId: socket.id
    };

    console.log(`[JOIN] ${nickname} (${animalName}) - ${socket.id}`);

    // Broadcast lên tất cả client: người mới vào
    io.emit('user-joined', {
      users: Object.values(users).filter(u => u.online),
      message: `${nickname} (${animalName}) vừa tham gia!`
    });
  });

  // 2. SEND MESSAGE (Gửi tin nhắn)
  socket.on('send-message', (payload) => {
    const { text, timestamp } = payload;
    const user = users[socket.id];

    if (!user) {
      socket.emit('error', { message: 'Người dùng chưa join' });
      return;
    }

    const message = {
      id: messageId++,
      userId: socket.id,
      nickname: user.nickname,
      animalName: user.animalName,
      emoji: user.emoji,
      progress: user.progress,
      message: text,
      timestamp,
      createdAt: new Date()
    };

    messages.push(message);
    console.log(`[MSG] ${user.nickname}: ${text}`);

    // Broadcast tin nhắn lên tất cả client
    io.emit('receive-message', message);

    // Notification cho người gửi (optional)
    socket.emit('message-sent', { success: true, messageId: message.id });
  });

  // 3. UPDATE USER STATUS (Cập nhật trạng thái online)
  socket.on('update-status', (payload) => {
    const { online, progress } = payload;
    const user = users[socket.id];

    if (user) {
      user.online = online;
      if (typeof progress === 'number') {
        user.progress = progress;
      }
      console.log(`[STATUS] ${user.nickname} - online: ${online}`);

      io.emit('user-status-updated', {
        users: Object.values(users).filter(u => u.online)
      });
    }
  });

  // 4. TYPING INDICATOR (Người dùng đang gõ)
  socket.on('typing', (payload) => {
    const { isTyping } = payload;
    const user = users[socket.id];

    if (user) {
      socket.broadcast.emit('user-typing', {
        userId: socket.id,
        nickname: user.nickname,
        isTyping
      });
    }
  });

  // 5. DISCONNECT (Người dùng ngắt kết nối)
  socket.on('disconnect', () => {
    const user = users[socket.id];

    if (user) {
      console.log(`[DISCONNECT] ${user.nickname} - ${socket.id}`);

      // Xóa user
      delete users[socket.id];

      // Broadcast: người dùng đã rời đi
      io.emit('user-left', {
        userId: socket.id,
        nickname: user.nickname,
        message: `${user.nickname} đã rời khỏi!`,
        users: Object.values(users).filter(u => u.online)
      });
    }
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`[ERROR] ${socket.id}:`, error);
  });
});

// Handle server errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║           🚀 EXAM MASTER CHAT SERVER STARTED                  ║
╠════════════════════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                              ║
║  WebSocket: ws://localhost:${PORT}                            ║
║  CORS Origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}                     ║
║  Environment: ${process.env.NODE_ENV || 'development'}                        ║
╚════════════════════════════════════════════════════════════════╝
  `);
});
