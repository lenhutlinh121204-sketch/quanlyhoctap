# ✅ HƯỚNG DẪN SỬ DỤNG CHAT - EXAM MASTER

## 🎉 TÌNH HÌNH HIỆN TẠI

✅ **Frontend:** Đã deploy lên Firebase Hosting  
✅ **Backend:** Đang chạy LOCAL trên `localhost:3001`  
✅ **Chat Local:** Hoạt động bình thường

❌ **Chat trên Firebase:** Không hoạt động (backend chưa deploy)

---

## 🔴 VẤN ĐỀ & GIẢI PHÁP

### Tại sao chat không hoạt động trên https://mangoteamapphoctap.web.app?

- Frontend (Firebase Hosting) tại `https://mangoteamapphoctap.web.app`  
- Backend cấu hình kết nối `localhost:3001`  
- Browser **không thể truy cập localhost từ internet** ❌

### ✅ Giải pháp: **Deploy Backend lên Railway**

---

## 📋 BƯỚC CHI TIẾT

### **BƯỚC 1: Chạy Backend Local (để test)**

```bash
cd server
npm install
npm start
```

Server sẽ chạy trên `http://localhost:3001`

---

### **BƯỚC 2: Test Chat Local**

```bash
cd ..
npm run dev
```

Mở: http://localhost:5173  
→ Chat sẽ hoạt động ✅

---

### **BƯỚC 3: Deploy Backend lên Railway (QUAN TRỌNG)**

#### **3a. Tạo GitHub Repository**

```bash
git init
git add .
git commit -m "Initial commit - Exam Master Chat App"
git branch -M main

# Tạo repo trên https://github.com/new
# Đặt tên: exam-master-chat
# Chọn: Public

git remote add origin https://github.com/YOUR_USERNAME/exam-master-chat.git
git push -u origin main
```

#### **3b. Deploy lên Railway**

1. Truy cập: https://railway.app
2. Đăng ký/Đăng nhập bằng GitHub
3. Click **New Project** → **Deploy from GitHub Repo**
4. Chọn `exam-master-chat`
5. Chọn thư mục: `server`
6. Thêm Environment Variables:
   ```
   NODE_ENV=production
   CLIENT_URL=https://mangoteamapphoctap.web.app
   ```
7. Click **Deploy** ✅

#### **3c. Lấy URL Backend**

Sau khi deploy (khoảng 2-5 phút), Railway sẽ cấp URL:
```
https://your-app-production.up.railway.app
```

Copy URL này!

---

### **BƯỚC 4: Cập nhật Frontend**

1. Mở file [.env.production](.env.production)
2. Thay URL:
   ```
   VITE_SOCKET_URL=https://your-app-production.up.railway.app
   ```
   (Thay `your-app-production` bằng tên thực tế)

3. Build lại:
   ```bash
   npm run build
   firebase deploy
   ```

---

### **BƯỚC 5: Test trên Production**

Mở: https://mangoteamapphoctap.web.app

✅ Chat sẽ hoạt động!

---

## 📌 QUICK REFERENCE

| Tình huống | Lệnh | Kết quả |
|-----------|------|--------|
| **Test local** | `npm run dev` | localhost:5173 (Chat hoạt động) |
| **Build prod** | `npm run build` | Tạo thư mục `dist/` |
| **Deploy** | `firebase deploy` | Cập nhật Firebase Hosting |
| **Backend** | `cd server && npm start` | Chạy server trên :3001 |

---

## 🔧 TROUBLESHOOTING

### ❌ Lỗi: "0 người đang online" trên localhost

**Nguyên nhân:** Backend không chạy  
**Giải pháp:**
```bash
cd server
npm start
```

### ❌ Lỗi: CORS trên production

**Nguyên nhân:** Backend URL sai hoặc CORS không cấu hình  
**Giải pháp:** Kiểm tra:
- `CLIENT_URL` trong `server/.env` khớp với Firebase URL
- `VITE_SOCKET_URL` trong `.env.production` khớp với backend URL

### ❌ Chat không gửi được trên production

**Nguyên nhân:** Backend chưa deploy  
**Giải pháp:** Làm theo **BƯỚC 3 & 4** ở trên

### ❌ Lỗi: "Connection refused"

**Nguyên nhân:** Backend port bị chiếm  
**Giải pháp:**
```bash
# Windows: Tìm process dùng port 3001
netstat -ano | findstr :3001

# Tắt process (thay PID bằng số thực tế)
taskkill /PID 1234 /F

# Chạy lại server
npm start
```

---

## 📞 CẦN GIÚP?

1. **Kiểm tra console browser:** F12 → Console → Tìm lỗi Socket
2. **Kiểm tra backend logs:** Terminal chạy `npm start`
3. **Kiểm tra Firebase:** https://console.firebase.google.com/project/mangoteamapphoctap

---

**Ghi chú:** Sau khi deploy backend, chat sẽ hoạt động trên:  
✅ http://localhost:5173 (local)  
✅ https://mangoteamapphoctap.web.app (production)
