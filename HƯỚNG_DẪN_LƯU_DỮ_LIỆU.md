# 📋 Hướng dẫn lưu trữ & khôi phục dữ liệu

## ✅ Vấn đề đã được sửa

**Lỗi cũ**: Tất cả các task sẽ bị mất khi reload trang hoặc đóng trình duyệt.

**Giải pháp**: 
- ✓ Ứng dụng hiện **lưu dữ liệu tự động** vào localStorage trình duyệt
- ✓ Tất cả tasks, exams, thống kê sẽ được **khôi phục tự động** khi mở lại ứng dụng
- ✓ Có tính năng **Sao lưu (Backup)** và **Khôi phục (Restore)**

---

## 🎯 Cách sử dụng

### 1. **Lưu dữ liệu tự động** 💾
- Mỗi khi bạn:
  - ✏️ Thêm/sửa/xóa task
  - ✏️ Thêm/sửa/xóa subtask
  - ✏️ Đánh dấu hoàn thành
  - ✏️ Thay đổi exam
- Dữ liệu **sẽ tự động lưu** vào localStorage
- Bạn sẽ thấy thông báo: **"Dữ liệu được lưu tự động"** 💚

### 2. **Xuất dữ liệu (Sao lưu)** 📥
Để tạo file backup:
1. Nhấp vào **"Tùy chọn dữ liệu"** ⚙️ ở phía trên cùng
2. Chọn **"📥 Xuất dữ liệu"**
3. File `exam-master-backup-{timestamp}.json` sẽ được tải về
4. Lưu file này ở nơi an toàn (ví dụ: Google Drive, Dropbox, USB)

### 3. **Nhập dữ liệu (Khôi phục từ backup)** 📤
Để khôi phục từ file backup:
1. Nhấp vào **"Tùy chọn dữ liệu"** ⚙️
2. Chọn **"📤 Nhập dữ liệu"**
3. Chọn file `.json` bạn vừa download
4. Dữ liệu sẽ được khôi phục ngay lập tức ✓

### 4. **Khôi phục mặc định** 🔄
Nếu bạn muốn quay lại trạng thái ban đầu:
1. Nhấp vào **"Tùy chọn dữ liệu"** ⚙️
2. Chọn **"🔄 Khôi phục mặc định"**
3. Xác nhận khi hỏi
4. **⚠️ Cảnh báo**: Tất cả dữ liệu hiện tại sẽ bị xóa!

---

## 📍 Vị trí menu tùy chọn dữ liệu

```
┌─────────────────────────────────────┐
│  🎯 Exam Master                     │
│  ⚙️  Tùy chọn dữ liệu ▼           │ ← Click ở đây
│  💚 Dữ liệu được lưu tự động        │
└─────────────────────────────────────┘
```

---

## 🛡️ Các trường hợp cần sử dụng sao lưu

### **Khi nào cần Xuất dữ liệu?**
✓ Trước khi:
- Định dùng thiết bị mới
- Cài đặt lại trình duyệt
- Xóa lịch sử/cookie của trình duyệt
- Để an toàn, nên sao lưu hàng tuần

### **Khi nào cần Nhập dữ liệu?**
✓ Khi:
- Vô tình xóa toàn bộ tasks
- Chuyển sang thiết bị mới
- Muốn khôi phục từ backup cũ

---

## 📝 Dữ liệu được lưu gồm:

1. **Tất cả Tasks**
   - Tiêu đề, môn học, ưu tiên, deadline
   - Subtasks (các bước nhỏ)
   - Trạng thái hoàn thành

2. **Tất cả Exams**
   - Tên kỳ thi
   - Ngày thi

3. **Toàn bộ trạng thái ứng dụng**
   - Bộ lọc tasks
   - Cài đặt Pomodoro
   - Tất cả dữ liệu khác

---

## 💡 Mẹo & Lưu ý

| Vấn đề | Giải pháp |
|--------|---------|
| Data không được lưu? | Kiểm tra xem trình duyệt có cho phép localStorage không |
| Quên backup trước khi xóa? | Thực hiện "Khôi phục mặc định" rồi nhập backup cũ |
| Backup file quá cũ? | Xuất dữ liệu hiện tại để tạo backup mới |
| Sợ mất dữ liệu? | Xuất dữ liệu mỗi tuần 1 lần |

---

## ✨ Tạo ngay backup lần đầu!

**Khuyến nghị**: Ngay bây giờ, hãy:
1. Nhấp **"Tùy chọn dữ liệu"** ⚙️
2. Chọn **"📥 Xuất dữ liệu"**
3. Lưu file vào Google Drive hoặc Dropbox
4. ✅ Xong! Dữ liệu của bạn giờ đã được bảo vệ!

---

**Được cập nhật**: 11/05/2026
**Phiên bản**: 2.0 (Có hỗ trợ lưu dữ liệu)
