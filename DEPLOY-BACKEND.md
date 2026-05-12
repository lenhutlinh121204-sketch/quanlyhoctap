# 🚀 HƯỚNG DẪN DEPLOY CHAT SERVER LÊN RAILWAY

## 🔴 VẤN ĐỀ HIỆN TẠI
Chat server backend vẫn chạy `localhost:3001` → Không kết nối được từ Firebase Hosting

## ✅ GIẢI PHÁP: DEPLOY LÊN RAILWAY (MIỄN PHÍ)

### Bước 1: Tạo tài khoản Railway
1. Truy cập: https://railway.app
2. Đăng ký với GitHub hoặc Email
3. Xác thực tài khoản

### Bước 2: Chuẩn bị repository
```bash
# Tạo Git repository (nếu chưa có)
cd d:\quản lí lịch
git init
git add .
git commit -m "Initial commit - Chat app"
```

### Bước 3: Đẩy lên GitHub
```bash
# Tạo repo trên GitHub (https://github.com/new)
# Rồi chạy:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Bước 4: Deploy trên Railway
1. Vào https://railway.app/dashboard
2. Click **New Project** → **Deploy from GitHub**
3. Chọn repository vừa tạo
4. Railway sẽ tự phát hiện `server/` folder
5. Cấu hình Environment:
   ```
   NODE_ENV=production
   PORT=3000
   CLIENT_URL=https://mangoteamapphoctap.web.app
   ```

### Bước 5: Lấy URL backend
1. Sau khi deploy xong, Railway sẽ tạo URL dạng:
   ```
   https://your-app-production.up.railway.app
   ```
2. Copy URL này

### Bước 6: Cập nhật Frontend
1. Mở file [.env.production](.env.production)
2. Thay URL:
   ```
   VITE_SOCKET_URL=https://your-app-production.up.railway.app
   ```
3. Build lại:
   ```bash
   npm run build
   firebase deploy
   ```

## 🔧 NẾUY MUỐN CHẠY LOCAL TRƯỚC
```bash
cd server
npm install
npm run dev
```
Server sẽ chạy ở http://localhost:3001

## 📋 CHECKLIST
- [ ] Tạo tài khoản Railway
- [ ] Tạo GitHub repo
- [ ] Deploy backend trên Railway
- [ ] Cập nhật .env.production
- [ ] Build & deploy frontend lên Firebase
- [ ] Test chat trên https://mangoteamapphoctap.web.app

## ❓ TROUBLESHOOTING

### Lỗi: "Cannot connect to socket server"
→ Kiểm tra VITE_SOCKET_URL trong .env.production có đúng không

### Lỗi: "CORS error"
→ Kiểm tra CLIENT_URL trong server/.env có khớp Firebase URL không

### Server tắt sau vài phút
→ Cần upgrade Railway plan (miễn phí có giới hạn)

---
**Liên hệ hỗ trợ:** railway.app support
