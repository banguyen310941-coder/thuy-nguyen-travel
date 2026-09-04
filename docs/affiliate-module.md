# HappyGo Travel Affiliate / CTV

## Luồng nghiệp vụ
1. Admin tạo CTV tại `/admin/affiliates`.
2. CTV đăng nhập `/affiliate`, mở Dashboard và copy link của từng Villa.
3. Website nhận `ref` + `villa_id`, ghi click và attribution HttpOnly 30 ngày.
4. Khi khách đặt booking, server tạo `affiliate_referrals` trạng thái `pending`.
5. Khi booking chuyển `completed`, API Booking tự đối soát: `selling_total_vnd * commission_rate / 100`, chuyển referral sang `approved` và cộng ví CTV.
6. Admin chi hoa hồng trong màn CTV; payout được lưu `commission_payouts`.

## Bảo mật dữ liệu nguồn cung
Các API `/api/affiliate/*` chỉ SELECT whitelist trường public của Villa (`id`, `slug`, `name`, `place`, `cover`, giá retail/promo). Không SELECT `net_price_vnd`, dữ liệu chủ nhà, số điện thoại chủ nhà hay địa chỉ chi tiết.

## Webhook tùy chọn
`POST /api/affiliate/booking-completed` với body `{ "event": "booking_completed", "booking_id": "..." }`.
- Có thể xác thực bằng phiên Admin có quyền Booking.
- Hoặc cấu hình `AFFILIATE_WEBHOOK_SECRET` và gửi header `x-affiliate-webhook-secret`.

## Database
Migration: `db/affiliate-module.sql`.
