# Exam Master Chat Server

Server Socket.IO real-time cho ứng dụng Exam Master.

## 🚀 Setup nhanh

### 1. Cài dependencies
```bash
cd server
npm install
```

### 2. Chạy server
```bash
# Development (auto reload)
npm run dev

# Production
npm start
```

Server sẽ chạy ở `http://localhost:3001`

---

## 📡 Socket.IO Events

### Client → Server (Gửi)

**1. `user-join`** - Người dùng tham gia
```javascript
socket.emit('user-join', {
  nickname: 'Linh',
  animalName: '🐶 Chó'
});
```

**2. `send-message`** - Gửi tin nhắn
```javascript
socket.emit('send-message', {
  text: 'Xin chào!',
  timestamp: Date.now()
});
```

**3. `update-status`** - Cập nhật online/offline
```javascript
socket.emit('update-status', {
  online: true
});
```

**4. `typing`** - Indicator gõ phím
```javascript
socket.emit('typing', {
  isTyping: true
});
```

---

### Server → Client (Nhận)

**1. `user-joined`** - Thông báo người mới vào
```javascript
socket.on('user-joined', (data) => {
  console.log(data.users); // Danh sách user online
  console.log(data.message); // "Linh (🐶 Chó) vừa tham gia!"
});
```

**2. `receive-message`** - Nhận tin nhắn mới
```javascript
socket.on('receive-message', (message) => {
  console.log(message.nickname, message.text);
});
```

**3. `user-left`** - Thông báo người rời đi
```javascript
socket.on('user-left', (data) => {
  console.log(data.message); // "Linh rời khỏi!"
  console.log(data.users); // Danh sách user online còn lại
});
```

**4. `user-typing`** - Indicator người đang gõ
```javascript
socket.on('user-typing', (data) => {
  console.log(data.nickname, 'is typing:', data.isTyping);
});
```

**5. `user-status-updated`** - Danh sách user online cập nhật
```javascript
socket.on('user-status-updated', (data) => {
  console.log(data.users);
});
```

---

## 🔌 REST API Endpoints

**GET /health**
- Health check server
- Response: `{ status: 'OK' }`

**GET /api/messages**
- Lấy 50 tin nhắn gần nhất (phục vụ load history)
- Response: Array messages

**GET /api/users**
- Lấy danh sách user online
- Response: Array users

---

## 🛠️ File Structure

```
server/
├── package.json       (Dependencies)
├── .env               (Environment variables)
├── index.js           (Main server file)
└── README.md          (Hướng dẫn này)
```

---

## 🌐 Production Deployment

### Option 1: Railway.app (Khuyên dùng - Dễ nhất)
1. Push code lên GitHub
2. Kết nối Railway với GitHub repo
3. Set environment variables trong Railway dashboard
4. Deploy 1 click

### Option 2: Heroku
```bash
heroku create exam-master-chat
git push heroku main
heroku config:set CLIENT_URL=https://mangoteamapphoctap.web.app
```

### Option 3: VPS (DigitalOcean, Linode, etc.)
1. SSH vào server
2. `git clone repo`
3. `npm install`
4. Cài PM2: `npm install -g pm2`
5. `pm2 start index.js --name "chat-server"`
6. Setup Nginx reverse proxy
7. SSL certificate with certbot

---

## 📝 Ví dụ Client Connection

```javascript
// React component
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Kết nối server
    const newSocket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Tham gia chat
    newSocket.emit('user-join', {
      nickname: 'Linh',
      animalName: '🐶 Chó'
    });

    // Lắng nghe tin nhắn
    newSocket.on('receive-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  const sendMessage = (text) => {
    socket?.emit('send-message', {
      text,
      timestamp: Date.now()
    });
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.nickname}</strong>: {msg.text}
        </div>
      ))}
      <button onClick={() => sendMessage('Hello!')}>Send</button>
    </div>
  );
};

export default Chat;
```

---

## ⚠️ Lỗi thường gặp

**"Connection refused"**
- Kiểm tra server đã chạy chưa: `node index.js`
- Kiểm tra port 3001 không bị chiếm

**"CORS error"**
- Kiểm tra CLIENT_URL trong .env có đúng frontend URL không

**"Socket connection timeout"**
- Server có thể down, restart bằng: `npm run dev`

---

## 📚 Tài liệu tham khảo
- [Socket.IO Docs](https://socket.io/docs/)
- [Express Docs](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
