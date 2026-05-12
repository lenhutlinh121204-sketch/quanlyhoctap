# 🚄 RAILWAY DEPLOYMENT - QUICK START (5 MINUTES)

## ✨ Why Railway?
- **5 minute setup** - No config needed
- **Free tier** - $5/month free credit
- **GitHub auto-deploy** - Push code, auto-deploys
- **SSL included** - HTTPS by default
- **Node.js ready** - Socket.IO works out of box

---

## 📋 Pre-requisites

- [x] Node.js + npm
- [ ] GitHub account
- [ ] Railway account (free)
- [ ] Code pushed to GitHub

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### Phase 1: Prepare GitHub (5 minutes)

```bash
# 1. Initialize git (if not done)
git init
git add .
git commit -m "Socket.IO chat server ready for production"

# 2. Create repo on GitHub
# Go to https://github.com/new
# Create: exam-master
# Keep it Public

# 3. Push code
git remote add origin https://github.com/YOUR_USERNAME/exam-master.git
git branch -M main
git push -u origin main
```

✅ Done: Code is on GitHub

---

### Phase 2: Deploy Server (5 minutes)

#### 1. Sign Up on Railway
- Go to **https://railway.app**
- Click "Start free"
- **Sign up with GitHub** (easiest)
- Authorize Railway

#### 2. Create Project
- Click **"New Project"**
- Select **"Deploy from GitHub repo"**
- Search for **`exam-master`**
- Click to select it

#### 3. Configure Server Service

Railway should auto-detect `package.json`, but we need to point it to the server folder:

- Click the project → **Settings**
- Under "Root Directory": Set to `server`
- Under "Start Command": Keep `npm start`

#### 4. Set Environment Variables

Click **"Variables"** tab, add:

```
PORT=3000
NODE_ENV=production
CLIENT_URL=https://mangoteamapphoctap.web.app
```

Click **"Save Configuration"** → **"Deploy"**

#### 5. Wait for Deployment

Watch the "Deploy" tab:
```
✓ Building...
✓ Installing dependencies...
✓ Server is running...
```

✅ Server deployed! Look for message:
```
✅ EXAM MASTER CHAT SERVER STARTED
Server: http://localhost:3000
```

#### 6. Copy Server URL

Go to **Settings → Domain**

You'll see something like:
```
https://exam-master-prod-xxx.railway.app
```

**Copy this URL** (you need it for frontend)

---

### Phase 3: Deploy Frontend (2 minutes)

#### 1. Update Frontend Config

Open `.env.production` and replace `chat-server-xxxx.railway.app` with your actual Railway URL:

```env
VITE_SOCKET_URL=https://exam-master-prod-xxx.railway.app
```

#### 2. Build

```bash
npm run build
```

You should see:
```
✓ built in 38.83s
dist/
  ├── index.html
  ├── assets/
  └── quiz.html
```

#### 3. Deploy to Firebase

```bash
firebase deploy
```

Wait for:
```
✓ Deploy complete!
Hosting URL: https://mangoteamapphoctap.web.app
```

✅ Frontend deployed!

---

## 🧪 Test Production Chat

1. Open **https://mangoteamapphoctap.web.app**
2. Click "Chat Online" (or wait for popup)
3. Set nickname (e.g., "Linh")
4. You should see: ✅ **Đã kết nối** (Connected)

Open another tab and test messaging:

| Browser 1 | Browser 2 |
|-----------|-----------|
| User: Linh | User: Mèo |
| Send: "Xin chào!" | Receive: "Xin chào!" |

✅ Real-time chat working!

---

## 🔧 Troubleshooting

### ❌ "Connection refused"
```bash
# Check server logs on Railway
# Settings → Logs

# Should show:
# ✅ EXAM MASTER CHAT SERVER STARTED
# If not, rebuild: Click "Redeploy"
```

### ❌ "CORS error in browser console"
```
→ Check .env.production on server has:
  CLIENT_URL=https://mangoteamapphoctap.web.app

→ If using different domain, update it
→ Redeploy server
```

### ❌ "Socket.IO connection timeout"
```
→ Frontend .env.production must match Railway URL exactly
→ Must include: https://
→ Rebuild frontend: npm run build
→ Redeploy: firebase deploy
```

### ❌ "Messages not syncing"
```bash
# Check browser console (F12)
# Look for connection status

# Check server logs:
# Should see: [MSG] nickname: message text

# If not, server might be down
# Restart on Railway: Settings → Redeploy
```

---

## 📊 Monitor Production

### View Logs

Railway Dashboard → Logs:
```
[CONNECT] socket-id-123
[JOIN] Linh (🐶 Chó)
[MSG] Linh: Xin chào!
[STATUS] Linh - online: true
[DISCONNECT] Linh
```

### View Metrics

Railway Dashboard → Metrics:
- CPU usage
- Memory usage
- Request count
- Error rate

---

## 💾 Make Updates

### Update Server Code

```bash
# Make changes locally
# Commit and push
git add .
git commit -m "Add rate limiting to server"
git push

# Railway auto-deploys!
# Watch the Deployment tab
```

### Update Frontend Code

```bash
# Make changes locally
npm run build
firebase deploy

# Done! Live on Firebase
```

---

## 📈 Scale Up (Future)

### Add Database (MongoDB)

```bash
# 1. Get MongoDB Atlas URL
# 2. Add to Railway env:
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/db

# 3. Update server code to use DB instead of memory
```

### Add Caching (Redis)

```bash
# For multi-server deployments
# Railway has add-on marketplace
```

---

## 🎯 Production Checklist

- [x] Server on Railway
- [x] Frontend on Firebase Hosting
- [x] Environment variables set
- [ ] Test chat in production
- [ ] Monitor logs for 24 hours
- [ ] Set up error alerts (optional)
- [ ] Backup database (future)

---

## 💰 Monthly Cost

| Service | Cost |
|---------|------|
| Railway Server | $5-10 |
| Firebase Hosting | Free-1 |
| **Total** | **~$5-11/mo** |

---

## 🎉 Success!

Your production chat is now LIVE:
- **Frontend**: https://mangoteamapphoctap.web.app
- **Server**: https://exam-master-prod-xxx.railway.app
- **Real-time**: WebSocket/Socket.IO
- **Secure**: HTTPS/WSS
- **Scalable**: Pay as you go

Share the link with friends and start chatting! 🚀

---

## 📞 Need Help?

**Railway Issues**: https://docs.railway.app
**Socket.IO Issues**: https://socket.io/docs
**Firebase Issues**: https://firebase.google.com/support

---

### 🎊 Congratulations!

You've successfully deployed a full-stack Socket.IO chat application! 🎉
