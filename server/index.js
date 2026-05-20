import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// ==================== ROOM STORAGE ====================
// rooms = { roomId: { messages: [], users: {} } }
const rooms = {};
let messageId = 0;

// Track which room each socket is in
const socketRoomMap = {}; // { socketId: roomId }

function getRoom(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = { messages: [], users: {} };
  }
  return rooms[roomId];
}

function normalizeRoomId(raw) {
  const trimmed = (raw || '').trim();
  return trimmed === '' ? 'global' : trimmed;
}

function getAllOnlineUsers() {
  const allUsers = [];
  const seenNicknames = new Set();
  
  // Duyệt qua tất cả các phòng để lấy người dùng online
  Object.keys(rooms).forEach(roomId => {
    const room = rooms[roomId];
    Object.values(room.users).forEach(user => {
      if (user.online && !seenNicknames.has(user.nickname)) {
        seenNicknames.add(user.nickname);
        allUsers.push(user);
      }
    });
  });
  
  return allUsers;
}

// ==================== REST API ====================

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Danh sách phòng đang hoạt động
app.get('/api/rooms', (req, res) => {
  const activeRooms = Object.entries(rooms)
    .map(([roomId, data]) => ({
      roomId,
      userCount: Object.values(data.users).filter(u => u.online).length,
      messageCount: data.messages.length,
    }))
    .filter(r => r.userCount > 0);
  res.json(activeRooms);
});

// Lịch sử tin nhắn theo phòng
app.get('/api/rooms/:roomId/messages', (req, res) => {
  const { roomId } = req.params;
  const room = rooms[roomId];
  if (!room) return res.json([]);
  res.json(room.messages.slice(-50));
});

// Danh sách user online theo phòng
app.get('/api/rooms/:roomId/users', (req, res) => {
  const { roomId } = req.params;
  const room = rooms[roomId];
  if (!room) return res.json([]);
  res.json(Object.values(room.users).filter(u => u.online));
});

// Legacy: backward compat → trỏ về phòng global
app.get('/api/messages', (req, res) => {
  const room = rooms['global'];
  if (!room) return res.json([]);
  res.json(room.messages.slice(-50));
});

app.get('/api/users', (req, res) => {
  const room = rooms['global'];
  if (!room) return res.json([]);
  res.json(Object.values(room.users).filter(u => u.online));
});

// ==================== AI PROXY (tránh CORS khi gọi Z.ai / Gemini từ trình duyệt) ====================
app.post('/api/ai-proxy', async (req, res) => {
  const { provider, model, apiKey, messages, generationConfig } = req.body;
  if (!apiKey || !messages) {
    return res.status(400).json({ error: 'Thiếu apiKey hoặc messages' });
  }
  try {
    let result = '';
    if (provider === 'zai') {
      const response = await fetch('https://api.z.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, temperature: 0.1 }),
      });
      const data = await response.json();
      if (data.error) return res.status(400).json({ error: data.error.message });
      result = data.choices[0].message.content;
    } else {
      // Gemini
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: messages[0].content }] }], generationConfig }),
      });
      const data = await response.json();
      if (data.error) return res.status(400).json({ error: data.error.message });
      result = data.candidates[0].content.parts[0].text;
    }
    res.json({ result });
  } catch (err) {
    console.error('[AI-PROXY ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==================== SOCKET.IO EVENTS ====================

io.on('connection', (socket) => {
  console.log(`[CONNECT] ${socket.id}`);

  // 1. USER JOINS (hoặc đổi phòng)
  socket.on('user-join', (userData) => {
    const { nickname, animalName, emoji, progress, statusText, isFocusing, roomId: rawRoomId } = userData;
    const roomId = normalizeRoomId(rawRoomId);

    // Rời phòng cũ nếu đang ở phòng khác
    const prevRoomId = socketRoomMap[socket.id];
    if (prevRoomId && prevRoomId !== roomId) {
      const prevRoom = rooms[prevRoomId];
      if (prevRoom && prevRoom.users[socket.id]) {
        delete prevRoom.users[socket.id];
        io.emit('user-left', {
          userId: socket.id,
          nickname,
          message: `${nickname} đã chuyển sang phòng khác!`,
          users: getAllOnlineUsers(),
          roomId: prevRoomId,
        });
      }
      socket.leave(prevRoomId);
    }

    // Tham gia phòng mới
    socket.join(roomId);
    socketRoomMap[socket.id] = roomId;

    const room = getRoom(roomId);
    room.users[socket.id] = {
      id: socket.id,
      nickname,
      animalName,
      online: true,
      emoji: emoji || '🙂',
      progress: typeof progress === 'number' ? progress : 0,
      statusText: statusText || 'Đang học bài',
      isFocusing: !!isFocusing,
      joinedAt: new Date(),
      socketId: socket.id,
      roomId,
    };

    console.log(`[JOIN] ${nickname} (${animalName}) → phòng "${roomId}" - ${socket.id}`);

    io.emit('user-joined', {
      users: getAllOnlineUsers(),
      message: `${nickname} (${animalName}) vừa tham gia phòng "${roomId}"!`,
      roomId,
    });
  });

  // 2. SEND MESSAGE
  socket.on('send-message', (payload) => {
    const { text, timestamp } = payload;
    const roomId = socketRoomMap[socket.id];
    if (!roomId) {
      socket.emit('error', { message: 'Bạn chưa tham gia phòng nào' });
      return;
    }
    const room = rooms[roomId];
    const user = room?.users[socket.id];
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
      createdAt: new Date(),
      roomId,
    };

    room.messages.push(message);
    console.log(`[MSG][${roomId}] ${user.nickname}: ${text}`);
    io.to(roomId).emit('receive-message', message);
    socket.emit('message-sent', { success: true, messageId: message.id });
  });

  // 3. UPDATE USER STATUS
  socket.on('update-status', (payload) => {
    const { online, progress, statusText, isFocusing } = payload;
    const roomId = socketRoomMap[socket.id];
    if (!roomId) return;
    const room = rooms[roomId];
    const user = room?.users[socket.id];
    if (user) {
      user.online = online;
      if (typeof progress === 'number') user.progress = progress;
      if (typeof statusText === 'string') user.statusText = statusText;
      if (typeof isFocusing === 'boolean') user.isFocusing = isFocusing;
      console.log(`[STATUS][${roomId}] ${user.nickname} - online: ${online}, progress: ${progress}, statusText: ${statusText}, isFocusing: ${isFocusing}`);
      io.emit('user-status-updated', {
        users: getAllOnlineUsers(),
        roomId,
      });
    }
  });

  // 4. TYPING INDICATOR
  socket.on('typing', (payload) => {
    const { isTyping } = payload;
    const roomId = socketRoomMap[socket.id];
    if (!roomId) return;
    const room = rooms[roomId];
    const user = room?.users[socket.id];
    if (user) {
      socket.to(roomId).emit('user-typing', {
        userId: socket.id,
        nickname: user.nickname,
        isTyping,
        roomId,
      });
    }
  });

  // 5. NEW ACTIVITY BROADCAST
  socket.on('new-activity', (payload) => {
    // Phát thông báo (activity) tới TẤT CẢ mọi người trên server, không phân biệt phòng
    io.emit('receive-activity', payload);
  });

  // 5. DISCONNECT
  socket.on('disconnect', () => {
    const roomId = socketRoomMap[socket.id];
    if (!roomId) return;
    const room = rooms[roomId];
    const user = room?.users[socket.id];
    if (user) {
      console.log(`[DISCONNECT][${roomId}] ${user.nickname} - ${socket.id}`);
      delete room.users[socket.id];
      io.emit('user-left', {
        userId: socket.id,
        nickname: user.nickname,
        message: `${user.nickname} đã rời khỏi phòng "${roomId}"!`,
        users: getAllOnlineUsers(),
        roomId,
      });
    }
    delete socketRoomMap[socket.id];
  });

  socket.on('error', (error) => {
    console.error(`[ERROR] ${socket.id}:`, error);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║       🚀 EXAM MASTER CHAT SERVER (ROOMS MODE) STARTED         ║
╠════════════════════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                              ║
║  WebSocket: ws://localhost:${PORT}                            ║
║  CORS Origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}                     ║
║  Environment: ${process.env.NODE_ENV || 'development'}                        ║
╚════════════════════════════════════════════════════════════════╝
  `);
});
