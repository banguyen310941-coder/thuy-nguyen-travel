# HappyGo Travel Affiliate / CTV

## Luồng nghiệp vụ
1. CTV có thể tự đăng ký tại `/affiliate/register` hoặc Admin tạo trực tiếp tại `/admin/affiliates`.
2. Hồ sơ tự đăng ký được tạo ở trạng thái `pending`; tài khoản staff ở trạng thái `inactive` nên chưa thể đăng nhập.
3. Admin mở `/admin/affiliates`, duyệt hồ sơ để chuyển CTV sang `active`; API đồng thời kích hoạt staff tương ứng.
4. CTV đăng nhập `/affiliate`, mở Dashboard và sử dụng Bộ công cụ bán hàng để copy link/caption cho từng Villa.
5. Website nhận `ref` + `villa_id`, ghi click và attribution HttpOnly 30 ngày.
6. Khi khách đặt booking, server tạo `affiliate_referrals` trạng thái `pending`.
7. Khi booking chuyển `completed`, API Booking tự đối soát: `selling_total_vnd * commission_rate / 100`, chuyển referral sang `approved` và cộng ví CTV.
8. CTV tự cập nhật SĐT/Zalo/ngân hàng trên Dashboard và gửi yêu cầu rút hoa hồng. Mỗi CTV chỉ có một payout `pending` tại một thời điểm.
9. Admin duyệt hoặc từ chối yêu cầu rút. Chỉ khi Admin duyệt, số dư ví mới bị trừ và payout chuyển sang `paid`.

## Chính sách hiển thị trong Dashboard CTV
- Attribution theo trình duyệt có thời hạn 30 ngày.
- Hoa hồng chỉ phát sinh khi booking ở trạng thái `completed`.
- Booking hủy hoặc không hoàn tất không phát sinh hoa hồng.
- Công thức hiện tại: `selling_total_vnd * commission_rate / 100`.
- Tỷ lệ hoa hồng được cấu hình riêng trên từng CTV bởi Admin.
- CTV phải cập nhật đủ ngân hàng, số tài khoản và chủ tài khoản trước khi gửi yêu cầu rút tiền.

## Bảo mật dữ liệu nguồn cung
Các API `/api/affiliate/*` chỉ SELECT whitelist trường public của Villa (`id`, `slug`, `name`, `place`, `cover`, giá retail/promo). Không SELECT `net_price_vnd`, dữ liệu chủ nhà, số điện thoại chủ nhà hay địa chỉ chi tiết.

## API chính
- `POST /api/affiliate/auth/register`: tạo hồ sơ CTV `pending`.
- `POST /api/affiliate/auth/login`: chỉ cho phép CTV + staff đều `active`.
- `GET /api/affiliate/dashboard`: dữ liệu Dashboard, villa public, referral và payout.
- `POST /api/affiliate/dashboard` với `update_profile`: CTV cập nhật thông tin cá nhân/ngân hàng.
- `POST /api/affiliate/dashboard` với `request_payout`: CTV tạo yêu cầu rút hoa hồng.
- `POST /api/admin/affiliates` với `update`: Admin duyệt/khóa CTV.
- `POST /api/admin/affiliates` với `resolve_payout`: Admin duyệt/từ chối payout.

## Webhook tùy chọn
`POST /api/affiliate/booking-completed` với body `{ "event": "booking_completed", "booking_id": "..." }`.
- Có thể xác thực bằng phiên Admin có quyền Booking.
- Hoặc cấu hình `AFFILIATE_WEBHOOK_SECRET` và gửi header `x-affiliate-webhook-secret`.

## Database
Migration nền: `db/affiliate-module.sql`.
Các chức năng đăng ký, duyệt hồ sơ, cập nhật ngân hàng và yêu cầu rút tiền dùng lại các bảng `staff`, `affiliates` và `commission_payouts`, không cần migration bổ sung.
