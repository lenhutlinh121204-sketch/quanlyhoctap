# 🔧 Production Deployment Guide for Socket.IO Server

This guide covers deploying the Socket.IO chat server to production on Railway, Render, or Heroku.

---

## 🚀 Quick Deploy (Railway - Recommended)

```bash
# 1. Push code to GitHub
git push origin main

# 2. Go to railway.app → Create Project
# 3. Select GitHub repo
# 4. Set root directory: server
# 5. Add environment variables:
#    PORT=3000
#    NODE_ENV=production
#    CLIENT_URL=https://your-frontend-domain.com
# 6. Deploy!
```

**Result**: Your server gets a public URL like `https://chat-server-xxxx.railway.app`

See [RAILWAY-QUICKSTART.md](../RAILWAY-QUICKSTART.md) for full guide.

---

## 📋 Production Environment Variables

Create `.env.production`:

```env
# Server
PORT=3000
NODE_ENV=production

# Frontend (CORS)
CLIENT_URL=https://mangoteamapphoctap.web.app

# Database (optional, future)
# DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/db

# Rate limiting (optional)
# RATE_LIMIT_WINDOW_MS=900000
# RATE_LIMIT_MAX_REQUESTS=100
```

**Important**: Never commit `.env.production` with secrets. Use platform environment variables instead.

---

## 🏗️ Architecture

```
Client (React) ──HTTPS──> Frontend (Firebase Hosting)
                          ↓
                    (Read VITE_SOCKET_URL)
                          ↓
                    "https://chat-server-xxx.railway.app"
                          ↓
                    Socket.IO Server (Railway)
```

---

## 🌐 Platform-Specific Setup

### Railway (⭐ RECOMMENDED)

**Pros:**
- 5 minute setup
- $5 free/month
- Auto GitHub sync
- Built-in HTTPS

**Setup:**
1. https://railway.app → Sign up
2. New Project → Deploy from GitHub
3. Select `exam-master` repo
4. Settings → Root Directory: `server`
5. Variables → Add `PORT`, `NODE_ENV`, `CLIENT_URL`
6. Deploy

**URL Format:** `https://project-xxxx.railway.app`

---

### Render.com

**Pros:**
- Free tier available
- Generous limits
- Easy setup

**Setup:**
1. https://render.com → Sign up
2. New → Web Service
3. Connect GitHub
4. Repository: `exam-master`
5. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root: `server`
6. Environment → Add variables
7. Deploy

**URL Format:** `https://chat-server.onrender.com`

---

### Heroku

**Setup:**
```bash
npm install -g heroku-cli

# Login
heroku login

# Create app
heroku create exam-master-chat

# Set root to server folder
heroku buildpacks:add heroku-community/apt
heroku buildpacks:add heroku/nodejs

# Set variables
heroku config:set NODE_ENV=production
heroku config:set CLIENT_URL=https://mangoteamapphoctap.web.app
heroku config:set PORT=3000

# Deploy
git push heroku main
```

---

## 🔒 Security Best Practices

### 1. CORS Configuration

The server only accepts requests from your frontend domain:

```javascript
// server/index.js
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

**Action**: Update `CLIENT_URL` in production variables.

### 2. Input Validation

Add message validation:

```javascript
socket.on('send-message', (payload) => {
  // Validate length
  if (payload.text.length > 500) {
    socket.emit('error', { message: 'Message too long' });
    return;
  }
  // Process message...
});
```

### 3. Rate Limiting

Add to prevent spam:

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

---

## 📊 Monitoring

### View Logs

**Railway:**
```
Dashboard → Logs tab
```

**Render:**
```
Dashboard → Logs
```

### Key Log Messages

```
✅ [CONNECT] Socket connected
   [JOIN] User joined
   [MSG] Message sent
   [STATUS] User status updated
❌ [ERROR] Connection error
   [DISCONNECT] User left
```

---

## 🐛 Common Issues

### ❌ "CORS error"

**Error in browser:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
```bash
# Check server .env.production has correct CLIENT_URL
echo $CLIENT_URL

# If using different domain, update:
CLIENT_URL=https://your-actual-frontend-url.com

# Redeploy server
```

### ❌ "WebSocket connection fails"

**Browser console:**
```
WebSocket is closed before the connection is established
```

**Solutions:**
1. Check frontend `VITE_SOCKET_URL` matches exactly
2. Ensure server is running (check logs)
3. Verify HTTPS is used (not HTTP)

### ❌ "Server timeout / unreachable"

**Check:**
```bash
# Try accessing server health endpoint
curl https://your-server-url.railway.app/health

# Should return:
# {"status":"OK","message":"Server is running"}
```

**If fails:**
- Server might be down → Restart/redeploy
- Network issue → Check platform status page
- Port misconfiguration → Verify `PORT=3000` in env

---

## 🔄 Updating Production

### Update Code

```bash
# Make changes locally
git add .
git commit -m "Update chat validation"

# Auto-deploys on most platforms!
git push origin main

# Railway/Render watch GitHub and auto-deploy
```

### Update Environment Variables

**Railway Dashboard:**
1. Project → Variables
2. Edit value
3. Click "Save Configuration"
4. Auto-redeploys

**Render Dashboard:**
1. Environment
2. Edit variables
3. Save
4. Auto-redeploys

---

## 📈 Scaling for Growth

### Current Capacity
- Single server node
- In-memory message storage
- ~100-500 concurrent users

### To Scale Up:

1. **Add Database**
   ```javascript
   // Replace in-memory with MongoDB
   const messages = db.collection('messages');
   ```

2. **Add Redis Cache**
   ```bash
   # For session state across multiple servers
   npm install redis
   ```

3. **Load Balancing**
   ```
   Multiple Railway instances
   + Redis for shared state
   ```

---

## 💾 Backup & Recovery

### Export Messages

```bash
# Via API endpoint
curl https://your-server/api/messages > messages-backup.json

# Schedule daily backups (cron job)
```

### Database Backup (future)

```bash
# If using MongoDB
mongodump --uri "$DATABASE_URL" --out ./backup
```

---

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] CORS set to correct frontend domain
- [ ] Server deployed on Railway/Render
- [ ] Public domain/URL obtained
- [ ] Frontend updated with server URL
- [ ] Frontend rebuilt and deployed
- [ ] Test chat in production
- [ ] Monitor logs (first 24h)
- [ ] Set up alerts for errors
- [ ] Document server URL and credentials

---

## 💰 Cost Analysis

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| Railway | Free | $0 | 500 hours/month credit |
| Railway | Pro | $5-10 | Pay as you go |
| Render | Free | $0 | Limited, spins down idle |
| Render | Starter | $7 | Always on |
| Heroku | Paid | $7+ | Paid only (deprecated free) |

**Recommendation:** Railway $5-10/month for reliable production

---

## 📞 Support Links

- [Railway Docs](https://docs.railway.app)
- [Socket.IO Docs](https://socket.io/docs)
- [Express.js Guide](https://expressjs.com)
- [CORS Explanation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## 🎉 Success Indicators

✅ Production is working when:
- Server logs show `[CONNECT]` events
- Frontend shows "✅ Đã kết nối"
- Messages sync in real-time between browsers
- Server `/health` endpoint returns 200 OK
- No CORS errors in browser console

---

**Next:** See [../RAILWAY-QUICKSTART.md](../RAILWAY-QUICKSTART.md) for step-by-step Railway deployment
