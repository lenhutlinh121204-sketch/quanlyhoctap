# 📚 DEPLOYMENT DOCUMENTATION INDEX

This project has a full Socket.IO real-time chat system with both frontend and backend. Here's where to find deployment guides:

---

## 🚀 Quick Links

| Goal | Read This |
|------|-----------|
| **Deploy in 5 min** | [RAILWAY-QUICKSTART.md](RAILWAY-QUICKSTART.md) ⭐ |
| **Full deployment guide** | [DEPLOYMENT.md](DEPLOYMENT.md) |
| **Server production guide** | [server/PRODUCTION.md](server/PRODUCTION.md) |
| **Server docs** | [server/README.md](server/README.md) |

---

## 🎯 Choose Your Deployment Path

### Path 1: Production (Railway) - RECOMMENDED ⭐

**Time:** 5 minutes  
**Cost:** $5-10/month  
**Difficulty:** Easy  

```bash
# Read:
RAILWAY-QUICKSTART.md

# Then:
# 1. Push code to GitHub
# 2. Deploy server on Railway
# 3. Deploy frontend on Firebase
# 4. Done!
```

👉 **[Start here for Railway](RAILWAY-QUICKSTART.md)**

---

### Path 2: Full Documentation

**Time:** 20 minutes  
**Cost:** Varies  
**Difficulty:** Medium  

Comprehensive guide covering Railway, Render, and Heroku with all options:

👉 **[Read DEPLOYMENT.md](DEPLOYMENT.md)**

---

### Path 3: Server Admin

**Time:** Varies  
**Difficulty:** Advanced  

Deep dive into server production setup, monitoring, scaling:

👉 **[Read server/PRODUCTION.md](server/PRODUCTION.md)**

---

## 🔄 Project Structure

```
exam-master/
├── src/
│   ├── App.jsx          ← React app with Socket.IO client
│   ├── firebase.js      ← Firebase config
│   └── main.jsx
├── server/              ← Socket.IO server
│   ├── index.js         ← Server code
│   ├── package.json     ← Server dependencies
│   ├── README.md        ← Server docs
│   ├── .env.production  ← Production variables
│   └── PRODUCTION.md    ← Server deployment
├── .env.production      ← Frontend env (update with server URL)
├── package.json         ← Frontend dependencies
├── DEPLOYMENT.md        ← Full guide (all platforms)
├── RAILWAY-QUICKSTART.md ← Railway 5-min guide
└── firebase.json        ← Firebase hosting config
```

---

## 📋 Deployment Checklist

### Phase 1: Prepare (Local)
- [x] Socket.IO server created
- [x] React frontend integrated with Socket.IO
- [x] Environment files created (.env.production)
- [x] Dependencies installed

### Phase 2: GitHub
- [ ] Create GitHub repo
- [ ] Push code
- [ ] Keep it public (for Railway GitHub sync)

### Phase 3: Deploy Server
- [ ] Create Railway account
- [ ] Deploy server from GitHub
- [ ] Set environment variables
- [ ] Get public server URL

### Phase 4: Deploy Frontend
- [ ] Update `.env.production` with server URL
- [ ] Run `npm run build`
- [ ] Run `firebase deploy`
- [ ] Verify Firebase deployment

### Phase 5: Test
- [ ] Open https://mangoteamapphoctap.web.app
- [ ] Set nickname → see "✅ Đã kết nối"
- [ ] Open in another tab
- [ ] Send message → should appear real-time
- [ ] Check server logs for messages

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│         Frontend (React/Vite)                           │
│  https://mangoteamapphoctap.web.app                     │
│                                                          │
│  - React components                                     │
│  - Socket.IO client                                     │
│  - Real-time chat UI                                    │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTPS (Socket.IO/WebSocket)
                    │ VITE_SOCKET_URL
                    │
┌───────────────────▼─────────────────────────────────────┐
│         Backend (Node.js/Socket.IO)                     │
│  https://chat-server-xxx.railway.app                    │
│                                                          │
│  - Express.js                                           │
│  - Socket.IO server                                     │
│  - Message handling                                     │
│  - User tracking                                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Start Deploying

### Recommended: Railway (Fastest)

1. **Read** [RAILWAY-QUICKSTART.md](RAILWAY-QUICKSTART.md)
2. **Follow** the 5 steps
3. **Done!** 🎉

### Want Full Options?

1. **Read** [DEPLOYMENT.md](DEPLOYMENT.md)
2. **Compare** Railway vs Render vs Heroku
3. **Choose** your platform
4. **Deploy**

---

## 💡 Key Environment Variables

### Server (.env.production)
```env
PORT=3000
NODE_ENV=production
CLIENT_URL=https://mangoteamapphoctap.web.app
```

### Frontend (.env.production)
```env
VITE_SOCKET_URL=https://chat-server-xxx.railway.app
```

**Important:** Update `VITE_SOCKET_URL` after deploying server!

---

## 🧪 Testing Production

### Local Testing (Before Deploy)
```bash
# Terminal 1: Server
cd server
npm run dev

# Terminal 2: Frontend
npm run dev

# Open http://localhost:5173
# Chat should work locally
```

### Production Testing (After Deploy)
1. Open https://mangoteamapphoctap.web.app
2. Click "Chat Online"
3. Set nickname
4. Look for: "✅ Đã kết nối" (Connected)
5. Open another browser/tab
6. Send message
7. Should appear real-time in both

---

## 🐛 Troubleshooting

### Most Common Issues

| Issue | Solution |
|-------|----------|
| "Connection refused" | Server not deployed on Railway. Check logs. |
| "CORS error" | Update `CLIENT_URL` in server .env.production |
| "WebSocket fails" | `VITE_SOCKET_URL` doesn't match server. Rebuild frontend. |
| "No connection badge" | Frontend not configured correctly. Check `.env.production` |

### Where to Debug

1. **Browser Console** (F12) - Socket.IO errors
2. **Railway Logs** - Server errors
3. **Network Tab** - WebSocket connection
4. **Firebase Console** - Hosting logs

---

## 📊 Costs

| Service | Free Tier | Production |
|---------|-----------|------------|
| Railway | $5 credit | $5-10/month |
| Firebase | ✅ Free | ~$1/month |
| **Total** | **✅ FREE** | **~$5-11/month** |

---

## 🎓 Learning Resources

### Socket.IO
- [Official Docs](https://socket.io/docs)
- [CORS Setup](https://socket.io/docs/v4/handling-cors/)
- [Example Code](https://github.com/socketio/socket.io/tree/main/examples)

### Firebase
- [Hosting Docs](https://firebase.google.com/docs/hosting)
- [Deployment Guide](https://firebase.google.com/docs/hosting/quickstart)

### Railway
- [Documentation](https://docs.railway.app)
- [GitHub Integration](https://docs.railway.app/guides/github)

---

## 🎉 Success!

Once deployed:
- ✅ Server running on Railway
- ✅ Frontend on Firebase Hosting
- ✅ Chat working in real-time
- ✅ WebSocket (WSS) encrypted
- ✅ HTTPS everywhere

Share the URL and start chatting! 🚀

---

## 📞 Need Help?

1. **Quick questions?** → Check [RAILWAY-QUICKSTART.md](RAILWAY-QUICKSTART.md)
2. **Specific issues?** → See troubleshooting above
3. **Server questions?** → See [server/PRODUCTION.md](server/PRODUCTION.md)
4. **Platform docs?** → Links provided in [DEPLOYMENT.md](DEPLOYMENT.md)

---

## ✅ Deployment Ready

Your app is fully configured and ready to deploy. Choose your platform and follow the guide. Good luck! 🚀
