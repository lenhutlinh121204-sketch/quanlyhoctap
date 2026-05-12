# 🎯 Exam Master - Quản lý lịch học

## 📌 Phiên bản 2.0 - Có hỗ trợ lưu dữ liệu ✅

### 🔧 Các sửa lỗi chính

#### **❌ Lỗi cũ (v1.0)**
- Tất cả tasks sẽ **mất hết** khi reload trang (F5) hoặc đóng tab
- Không có cơ chế lưu trữ dữ liệu
- User mất công nhập dữ liệu rồi phải nhập lại

#### **✅ Sửa lỗi (v2.0)**
- Dữ liệu được **lưu tự động** vào `localStorage`
- Khi mở lại ứng dụng, tất cả dữ liệu sẽ được **khôi phục tự động**
- Có tính năng **Export/Import** để sao lưu dữ liệu
- Có tính năng **Reset** để quay lại mặc định nếu cần

---

## 🎨 Giao diện thay đổi

### Header mới có:
```
┌─────────────────────────────────────────────┐
│  🎯 Exam Master                             │
│  ⚙️  Tùy chọn dữ liệu  (MENU MỚI)          │
│  💚 Dữ liệu được lưu tự động (BADGE MỚI)  │
└─────────────────────────────────────────────┘
```

### Menu "Tùy chọn dữ liệu" gồm:
- **📥 Xuất dữ liệu** - Download backup .json
- **📤 Nhập dữ liệu** - Upload backup .json
- **🔄 Khôi phục mặc định** - Reset về trạng thái ban đầu

---

## 🔍 Thay đổi code chi tiết

### File thay đổi: `src/App.jsx`

#### 1️⃣ **Thêm constants mặc định**
```javascript
const DEFAULT_TASKS = [...];  // Dữ liệu tasks mặc định
const DEFAULT_EXAMS = [...];  // Dữ liệu exams mặc định
```

#### 2️⃣ **Load dữ liệu từ localStorage khi mount**
```javascript
const [tasks, setTasks] = useState(() => {
  try {
    const saved = localStorage.getItem('exam_master_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  } catch (e) {
    return DEFAULT_TASKS;
  }
});
```

#### 3️⃣ **Lưu dữ liệu vào localStorage mỗi lần thay đổi**
```javascript
useEffect(() => {
  try {
    localStorage.setItem('exam_master_tasks', JSON.stringify(tasks));
  } catch (e) {
    console.error('Lỗi khi lưu tasks:', e);
  }
}, [tasks]);
```

#### 4️⃣ **Hàm Export dữ liệu**
```javascript
const exportData = () => {
  // Tạo object chứa tasks + exams + timestamp
  // Tạo file JSON
  // Tải xuống với tên: exam-master-backup-{timestamp}.json
};
```

#### 5️⃣ **Hàm Import dữ liệu**
```javascript
const importData = () => {
  // Mở dialog chọn file
  // Đọc file JSON
  // Validate dữ liệu
  // Khôi phục tasks + exams
};
```

#### 6️⃣ **Hàm Reset mặc định**
```javascript
const resetToDefaults = () => {
  // Ask confirmation
  // Khôi phục DEFAULT_TASKS + DEFAULT_EXAMS
  // Lưu vào localStorage
};
```

#### 7️⃣ **UI menu tùy chọn**
```jsx
<details> {/* Collapsible menu */}
  <summary>⚙️ Tùy chọn dữ liệu</summary>
  <div>
    <button onClick={exportData}>📥 Xuất dữ liệu</button>
    <button onClick={importData}>📤 Nhập dữ liệu</button>
    <button onClick={resetToDefaults}>🔄 Khôi phục mặc định</button>
  </div>
</details>
```

---

## 📊 Các dữ liệu được lưu

### localStorage keys:
- `exam_master_tasks` - JSON array chứa toàn bộ tasks
- `exam_master_exams` - JSON array chứa toàn bộ exams

### Cấu trúc Task:
```javascript
{
  id: number,
  title: string,
  subject: string,
  deadline: string,
  priority: 'Cao' | 'Trung bình' | 'Thấp',
  completed: boolean,
  subtasks: [
    {
      id: number,
      title: string,
      completed: boolean
    }
  ]
}
```

### Cấu trúc Exam:
```javascript
{
  id: number,
  name: string,
  date: string (YYYY-MM-DD)
}
```

---

## 🧪 Cách kiểm tra

### 1. **Kiểm tra lưu dữ liệu tự động**
1. Mở ứng dụng
2. Thêm task mới
3. Reload trang (F5)
4. ✅ Task mới vẫn ở đó

### 2. **Kiểm tra Export**
1. Click "Tùy chọn dữ liệu"
2. Click "Xuất dữ liệu"
3. ✅ File `exam-master-backup-*.json` được tải về

### 3. **Kiểm tra Import**
1. Xóa một số tasks
2. Click "Tùy chọn dữ liệu" → "Nhập dữ liệu"
3. Chọn file backup vừa tải
4. ✅ Dữ liệu được khôi phục

---

## 🚀 Công nghệ sử dụng

- **React Hooks**: useState, useEffect
- **Browser APIs**: localStorage, File API, Blob, URL
- **JSON**: Serialize/Deserialize dữ liệu
- **Tailwind CSS**: UI styling (không thay đổi)

---

## 📁 File thay đổi

```
d:\quản lí lịch\
├── src/
│   └── App.jsx                    ✏️ (Sửa)
└── HƯỚNG_DẪN_LƯU_DỮ_LIỆU.md    ✨ (Tạo mới)
```

---

## 🎯 Lợi ích của v2.0

| Tính năng | v1.0 | v2.0 |
|----------|------|------|
| Lưu dữ liệu tự động | ❌ | ✅ |
| Khôi phục khi mở lại | ❌ | ✅ |
| Export/Import | ❌ | ✅ |
| Reset mặc định | ❌ | ✅ |
| Backup file | ❌ | ✅ |
| Thông báo lưu | ❌ | ✅ |

---

## 📋 Checklist tính năng

- [x] Load dữ liệu từ localStorage
- [x] Lưu dữ liệu vào localStorage
- [x] Tính năng Export (.json)
- [x] Tính năng Import (.json)
- [x] Tính năng Reset mặc định
- [x] UI Menu tùy chọn dữ liệu
- [x] Thông báo "Dữ liệu được lưu tự động"
- [x] Error handling
- [x] Hướng dẫn sử dụng

---

## 💬 Cách sử dụng cho user

Xem file: **`HƯỚNG_DẪN_LƯU_DỮ_LIỆU.md`**

---

## 🔐 Bảo mật

- ⚠️ localStorage chỉ lưu dữ liệu trên **máy tính này**
- ⚠️ Nếu xóa cookies/cache → dữ liệu sẽ mất
- ✅ **Giải pháp**: Xuất dữ liệu thường xuyên
- ✅ Lưu backup trên cloud (Google Drive, Dropbox)

---

## 📝 Ghi chú phát triển

### Có thể cải thiện trong tương lai:
- [ ] Lưu dữ liệu lên Firebase/Database
- [ ] Đồng bộ giữa nhiều thiết bị
- [ ] Lịch sử (Undo/Redo)
- [ ] Cloud backup tự động
- [ ] Export PDF/Excel

---

**Cập nhật lần cuối**: 11/05/2026  
**Phiên bản**: 2.0  
**Trạng thái**: ✅ Đã hoàn thành
