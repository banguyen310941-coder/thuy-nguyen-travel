# HappyGo Travel - Booking Backend

Backend này được tách độc lập để sau này chuyển website từ GitHub Pages sang Vercel/hosting/VPS mà không phải viết lại form đặt dịch vụ.

## Yêu cầu
- Node.js 20+
- MySQL 8+ hoặc MariaDB tương thích
- Domain/subdomain API, ví dụ `https://api.happygo.vn`

## Cài đặt
1. Tạo database `happygo_travel`.
2. Chạy file `schema.sql`.
3. Sao chép `.env.example` thành `.env` và điền `DATABASE_URL`, `ADMIN_API_KEY`, `ALLOWED_ORIGINS`.
4. Chạy `npm install` trong thư mục `backend`.
5. Chạy `npm start` hoặc dùng PM2/systemd trên VPS.

## API
- `GET /api/health`: kiểm tra backend/database.
- `POST /api/bookings`: khách tạo đơn, không cần khóa quản trị.
- `GET /api/bookings`: Admin xem đơn, cần header `x-admin-key`.
- `PATCH /api/bookings/:id`: Admin đổi trạng thái/ghi chú, cần header `x-admin-key`.

## Nối frontend
Ở build frontend, đặt:

`NEXT_PUBLIC_API_BASE_URL=https://api.tenmiencuaban.vn`

Sau đó build lại website. `BookingInquiry` sẽ tự gửi đơn về API thay vì chỉ chuyển qua Zalo. Admin nhập giá trị `ADMIN_API_KEY` trong màn hình Đơn đặt dịch vụ để tải/cập nhật đơn.

## Trạng thái đơn
- `new`: Mới
- `contacting`: Đang tư vấn
- `confirmed`: Đã xác nhận
- `completed`: Hoàn thành
- `cancelled`: Hủy

## Bảo mật khi đưa vào vận hành
Nên bổ sung đăng nhập Admin bằng session/JWT, HTTPS, rate limiting, CAPTCHA cho form công khai, backup database, nhật ký thao tác và phân quyền nhân viên. Kiến trúc API hiện tại đã tách riêng để có thể bổ sung các lớp này mà không đổi giao diện khách hàng.
