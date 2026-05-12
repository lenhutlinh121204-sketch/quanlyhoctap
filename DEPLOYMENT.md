# 🚀 PRODUCTION DEPLOYMENT GUIDE
## Socket.IO Chat Server + React Frontend

---

## 📋 Architecture Overview

```
Frontend (React/Vite)
  ↓ HTTPS
  └─→ Firebase Hosting (mangoteamapphoctap.web.app)
       ↓
  Backend (Socket.IO Server)
       ↓ HTTPS/WSS
       └─→ Railway.app or Render.com (chat-server.railway.app)
```

---

## 🔧 Production Environment Setup

### Server Production (.env)

```env
# server/.env.production
PORT=3000
NODE_ENV=production

# Frontend URL (CORS origin)
CLIENT_URL=https://mangoteamapphoctap.web.app

# Optional: Database (future)
# DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/db
```

### Frontend Production (.env)

```env
# .env.production
VITE_SOCKET_URL=https://your-server-url.railway.app
```

---

## 🚄 Deploy Option 1: Railway.app (RECOMMENDED - Easiest)

### Why Railway?
✅ 5 min setup  
✅ Free tier includes Node.js  
✅ Auto-deploys from GitHub  
✅ 1-click SSL/HTTPS  
✅ Environment variables in UI  
✅ Pay as you go ($5 free credit)

---

### Step 1: Prepare GitHub Repository

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Add Socket.IO chat server and Socket client"

# Create GitHub repo and push
# https://github.com/new
git remote add origin https://github.com/YOUR_USERNAME/exam-master.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy Server on Railway

1. **Go to [railway.app](https://railway.app)**
   - Sign up with GitHub (1 click)

2. **Create New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Authorize Railway to access GitHub
   - Select `exam-master` repo

3. **Configure Service**
   - Railway detects `package.json` in root
   - Click "Add Service" → select `server` folder
   - Set root directory: `server`

4. **Set Environment Variables**
   - In Railway dashboard, go to Variables
   - Add:
     ```
     PORT=3000
     NODE_ENV=production
     CLIENT_URL=https://mangoteamapphoctap.web.app
     ```

5. **Generate Public URL**
   - Railway auto-assigns: `https://your-project-xxxx.railway.app`
   - Copy this URL (you'll need it for frontend)

6. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Check "Logs" tab for `✅ Server listening on 3000`

---

### Step 3: Update Frontend for Production

1. **Update `.env.production`**
   ```env
   VITE_SOCKET_URL=https://your-project-xxxx.railway.app
   ```

2. **Build frontend**
   ```bash
   npm run build
   ```

3. **Test locally** (optional)
   ```bash
   npm run preview
   ```

4. **Deploy to Firebase Hosting**
   ```bash
   firebase deploy
   ```

---

### Step 4: Test Production Chat

1. Open https://mangoteamapphoctap.web.app
2. Set nickname
3. You should see connection badge ✅ "Đã kết nối"
4. Open in another tab/browser
5. Chat should work in real-time

---

## 🎨 Deploy Option 2: Render.com

Similar to Railway, slightly more setup:

1. Sign up at [render.com](https://render.com)
2. "New" → "Web Service"
3. Connect GitHub repo
4. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root directory: `server`
5. Add environment variables
6. Deploy

URL format: `https://chat-server.onrender.com`

---

## 🆚 Railway vs Render vs Heroku

| Feature | Railway | Render | Heroku |
|---------|---------|--------|--------|
| Setup Time | 5 min | 10 min | 10 min |
| Free Tier | $5/mo | Free (limited) | Paid |
| Auto-Deploy | Yes | Yes | Yes |
| Cold Start | <10s | <5s | 30s+ |
| Cost Scale | Pay as you go | $7+/mo | $7+/mo |
| **Recommendation** | ✅ BEST | Good | Legacy |

---

## 🔐 Security Checklist

### Server
- [x] CORS restricted to Firebase domain
- [ ] Add rate limiting (DDoS protection)
  ```javascript
  // server/index.js - add before routes
  import rateLimit from 'express-rate-limit';
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  });
  app.use(limiter);
  ```
- [ ] Validate message length (prevent spam)
- [ ] Authenticate users (optional future)

### Firebase
- [ ] Update Firestore rules for production
- [ ] Enable reCAPTCHA on hosting (optional)

### Frontend
- [x] No hardcoded credentials
- [x] Use environment variables
- [ ] Content Security Policy headers (Firebase handles)

---

## 📊 Monitoring & Logs

### Railway Dashboard
```
Project → Deployment → Logs
```

### Real-time Debug
```bash
# SSH into Railway container (if needed)
railway shell

# View logs
railway logs
```

---

## 🐛 Troubleshooting Production

### "Connection refused"
```bash
# Check server is running on Railway
railway logs

# Server should show:
# ✅ EXAM MASTER CHAT SERVER STARTED
# Server: http://localhost:3000
```

### "CORS error"
```
→ Verify CLIENT_URL in server .env matches frontend domain
→ Update: CLIENT_URL=https://mangoteamapphoctap.web.app
```

### "WebSocket connection failed"
```
→ Frontend VITE_SOCKET_URL must match Railway/Render URL
→ Must include https:// prefix
→ Rebuild frontend after changing env
```

### Messages not syncing
```bash
# Check Socket.IO connection in browser DevTools
Console → Connection status should be "Đã kết nối"

# Check server logs:
railway logs → grep "user-join" or "receive-message"
```

---

## 📈 Scaling Up (Future)

### Add Database (MongoDB)
```javascript
// server/index.js - future enhancement
import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.DATABASE_URL);
const db = client.db('chat');
const messages = db.collection('messages');

// Replace in-memory storage:
socket.on('send-message', async (payload) => {
  const msg = { ...payload, createdAt: new Date() };
  await messages.insertOne(msg);
  io.emit('receive-message', msg);
});
```

### Add Redis for Session Storage
```bash
# Production scalability
# Multiple server instances → Redis to sync state
```

---

## 🎯 Production Checklist

- [x] Server code ready
- [x] Frontend Socket.IO integration
- [x] Environment variables configured
- [ ] Push to GitHub
- [ ] Create Railway project
- [ ] Deploy server
- [ ] Update frontend env
- [ ] Deploy frontend to Firebase
- [ ] Test end-to-end
- [ ] Monitor logs (first 24h)

---

## 💰 Cost Estimate (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Railway Server | $5-10 | Pay as you go |
| Firebase Hosting | $0-1 | Free tier included |
| Total | ~$5-11 | Per month |

---

## 📞 Support

### Railway Issues
- [Railway Docs](https://docs.railway.app)
- [Status Page](https://status.railway.app)

### Socket.IO Issues
- [Socket.IO Docs](https://socket.io/docs)
- [CORS Guide](https://socket.io/docs/v4/handling-cors/)

### Firebase Issues
- [Firebase Console](https://console.firebase.google.com)
- [Hosting Docs](https://firebase.google.com/docs/hosting)

---

## 🎉 Next Steps

1. **Push code to GitHub** (if not done)
2. **Sign up on Railway.app**
3. **Deploy server** (5 min)
4. **Update frontend .env.production**
5. **Rebuild and deploy frontend** (1 min)
6. **Test and celebrate!** 🎊

---

### Questions?
Check server logs and browser DevTools Console for real-time errors. Most issues are CORS or environment variable mismatches.
