# 3dohub

> **3DoHub Enterprise** — Nền tảng tiện ích số & dịch vụ trực tuyến đa lĩnh vực dành cho cơ quan, tổ chức và doanh nghiệp.

---

## 🌟 Giới thiệu

**3DoHub** là hệ sinh thái tiện ích web hiện đại, hiệu năng cao, xây dựng trên nền tảng **FastAPI (Python)** và **Next.js (React, TypeScript, Ant Design)**. Hệ thống cung cấp các công cụ chuẩn hóa văn phòng, xử lý tài liệu và các tiện ích số thiết yếu với tiêu chuẩn bảo mật doanh nghiệp cao nhất.

### Các module & tính năng cốt lõi:
1. **Chuẩn hóa văn bản hành chính & Đảng (`van_ban`)**:
   - Tương thích 100% quy chuẩn văn thư theo Nghị định 30/2020/NĐ-CP và Quyết định 399-QĐ/TW.
   - Hỗ trợ 5 khối thể thức: Đảng, Chính quyền, Công an, Quân đội, MTTQ.
   - Tự động tách bảng Quốc hiệu/Tiêu ngữ, căn chỉnh lề A4, đánh số trang, tự động kẻ bảng Kính gửi & Nơi nhận/Chữ ký.
   - Rà soát 18 quy tắc lỗi thể thức logic (`LogicReportModal`).
   - Sao chép định dạng Word chuẩn MSO HTML và tải file `.docx` nguyên bản.

2. **Chuẩn hóa bảng tính Excel in ấn trang A4 (`excel_norm`)**:
   - Pipeline 11 bước căn chỉnh in A4 tự động từ macro `ChuanHoa_Excel.xlam`.
   - Tự động phát hiện tiêu đề, chống lỗi tràn số `###`, căn lề trang in A4 chuẩn.
   - Tính toán chiều cao hàng tự động (auto-wrap text height), phân bổ chiều cao ô gộp (merge cell).
   - Hỗ trợ hoàn tác (Undo) 1 chạm về trạng thái ban đầu.

3. **Tiện ích rút gọn liên kết (`short_link`)**:
   - Rút gọn đường dẫn URL dài tức thì, tùy chỉnh mã ngắn (custom slug).
   - Quản lý trạng thái bật/tắt liên kết, đặt thời hạn sử dụng.
   - Theo dõi chi tiết thống kê số lượt truy cập (clicks, thiết bị, nguồn giới thiệu).
   - Bảo mật riêng tư theo từng phiên thiết bị ẩn danh (`session_id`).

4. **Tiện ích tạo mã QR (`qr_code`)**:
   - Tạo mã QR tức thì cho URL, Văn bản, Wi-Fi, Danh thiếp (vCard), Email, Số điện thoại.
   - Đầy đủ tùy biến màu sắc, kích thước, mức sửa lỗi (L/M/Q/H) và chèn logo.
   - Hỗ trợ tải ảnh định dạng PNG sắc nét và file vector SVG vô hạn độ phân giải.

---

## 🛠️ Công nghệ sử dụng

- **Backend**:
  - Python 3.11+
  - FastAPI (Asynchronous Web Framework)
  - SQLAlchemy ORM & PostgreSQL (Aiven Cloud Database)
  - Pydantic v2 (Data Validation)
  - python-docx & openpyxl (Office OpenXML Processing)
- **Frontend**:
  - Next.js 14 (App Router, Server & Client Components)
  - TypeScript
  - Ant Design v5 (Enterprise Tech Design System: `#1D4ED8`, `borderRadius: 4`)
  - Axios (Secure API Client)
- **Bảo mật**:
  - Zero-Data-Retention: Cam kết không lưu trữ nội dung tài liệu văn bản/bảng tính trên máy chủ.
  - SHA-256 Payload Checksum & HMAC Canonical Request Signer.
  - Anti-Replay Nonce & Timestamp Guard.

---

## 🚀 Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Khởi chạy Backend (FastAPI)

```bash
cd backend

# Cài đặt thư viện phụ thuộc
pip install -r requirements.txt

# Tạo file cấu hình môi trường từ mẫu
cp .env.example .env

# Chạy máy chủ Uvicorn
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Tài liệu API Swagger tự động tại: `http://127.0.0.1:8000/docs`

### 2. Khởi chạy Frontend (Next.js)

```bash
cd frontend

# Cài đặt gói npm
npm install

# Khởi chạy môi trường phát triển
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`

---

## 📞 Hỗ trợ kỹ thuật & Đóng góp ý kiến

- **Email**: [3do.service@gmail.com](mailto:3do.service@gmail.com)
- **Hotline kỹ thuật**:
  - `0774.88.9191` (Mr. Cường)
  - `0865.341.745` (Mr. Kim)

---

## 📄 Bản quyền & Điều khoản

© 2026 **3DoHub Enterprise**. Bảo lưu mọi quyền.

