# Thúy Nguyên Travel - Backend v2

Backend production-ready cho website Thúy Nguyên Travel. Frontend hiện vẫn có fallback localStorage để chạy trên GitHub Pages; khi có hosting chỉ cần triển khai backend này, MySQL và cấu hình `NEXT_PUBLIC_API_BASE_URL`.

## 1. Yêu cầu
- Node.js 20+
- MySQL 8+ / MariaDB tương thích
- HTTPS cho API, ví dụ `https://api.thuynguyentravel.vn`
- Domain frontend thật được thêm vào `ALLOWED_ORIGINS`

## 2. Khởi tạo database
1. Tạo database `thuy_nguyen_travel`.
2. Chạy `schema.sql`.
3. Chạy tiếp `migrations/002_customer_accounts_payments.sql`.
4. Thiết lập backup database tự động trước khi vận hành thật.

## 3. Cấu hình backend
Sao chép `.env.example` thành `.env` rồi điền:
- `DATABASE_URL`: chuỗi kết nối MySQL.
- `ADMIN_API_KEY`: khóa quản trị dài, ngẫu nhiên; không đưa lên GitHub.
- `ALLOWED_ORIGINS`: domain website được phép gọi API.
- `BANK_NAME`, `BANK_ACCOUNT_NAME`, `BANK_ACCOUNT_NUMBER`: tài khoản nhận chuyển khoản.

Trong thư mục `backend`:

```bash
npm install
npm start
```

Production nên chạy bằng PM2/systemd hoặc service của hosting và bật restart tự động.

## 4. Nối frontend
Trong môi trường build frontend đặt:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.thuynguyentravel.vn
```

Sau khi build lại, các module hiện tại sẽ tự chuyển từ dữ liệu demo sang backend thật:
- Form đặt dịch vụ / Checkout → MySQL.
- Admin Đơn đặt dịch vụ → API.
- CRM khách hàng → API.
- Tra cứu booking → API công khai có mã booking + số điện thoại.
- Tài khoản khách hàng → đăng ký/đăng nhập/session backend.
- Lịch sử booking → tài khoản khách hàng.
- Thanh toán chuyển khoản → tạo `paymentCode` và nội dung đối soát riêng.

## 5. API chính
### Public / customer
- `GET /api/health`
- `POST /api/bookings`
- `GET /api/public/bookings/lookup?code=&phone=`
- `GET /api/public/bookings/by-phone?phone=`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/account/me`
- `GET /api/account/bookings`
- `POST /api/payments`
- `GET /api/payments/:code?phone=`

### Admin
Các API Admin yêu cầu header `x-admin-key`.
- `GET /api/bookings`
- `PATCH /api/bookings/:id`
- `GET /api/customers`
- `PATCH /api/customers/:id`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `PATCH /api/admin/payments/:code`
- `PUT /api/site-settings/:key`

## 6. Tài khoản khách hàng
Mật khẩu không lưu thô. Backend dùng `crypto.scrypt` + salt riêng cho từng tài khoản. Session token ngẫu nhiên được hash trong database và có hạn 30 ngày. Frontend chỉ giữ token phiên để gọi API tài khoản.

## 7. Thanh toán
Hiện backend đã hỗ trợ luồng chuyển khoản ngân hàng ở mức production foundation:
1. Khách tra đúng booking bằng mã + số điện thoại.
2. Backend tạo `paymentCode` riêng.
3. Trả thông tin ngân hàng và nội dung chuyển khoản chứa `paymentCode + bookingCode`.
4. Admin/đối soát cập nhật giao dịch thành `paid`, `failed`, `cancelled` hoặc `refunded`.

VNPay và MoMo cần tài khoản merchant thật, secret thật và callback/IPN. Không đưa secret vào frontend hoặc repository.

## 8. Checklist trước khi mở bán thật
- Domain + SSL frontend/API.
- MySQL production + backup hằng ngày.
- Đổi `ADMIN_API_KEY` thành secret mạnh.
- Giới hạn CORS đúng domain thật.
- Tài khoản ngân hàng doanh nghiệp/cá nhân dùng để thu tiền được xác nhận.
- Merchant VNPay/MoMo nếu dùng.
- SMTP/email hoặc dịch vụ SMS/Zalo OA nếu cần gửi xác nhận tự động.
- CAPTCHA/rate limiting cho endpoint public khi lượng truy cập tăng.
- Nhật ký thao tác Admin và phân quyền nhân viên ở giai đoạn production tiếp theo.

## 9. Nguyên tắc chuyển hosting
Không xóa localStorage ngay khi chuyển. Nên bật backend trước, test booking/CRM/account/payment trên staging, sau đó mới dùng database làm nguồn dữ liệu chính. Cấu trúc frontend đã được thiết kế để chuyển dần mà không phải làm lại giao diện.
