# HappyGo Travel

Website và hệ thống điều hành du lịch của **HappyGo Travel**, xây dựng bằng Next.js 15, TypeScript và App Router, chuẩn bị triển khai chính trên Vercel.

## Thông tin thương hiệu

- Thương hiệu: **HappyGo Travel**
- Hotline: **0969 973 949**
- Email: **info@happygo.vn**
- Tên miền dự kiến: **happygo.vn**
- Slogan: **Hành trình hạnh phúc · Kết nối yêu thương**

## Công nghệ

- Next.js 15
- React 19
- TypeScript
- App Router
- Neon/PostgreSQL-ready server utilities
- PWA manifest + service worker
- GitHub Actions dùng để lint, typecheck và build trước khi deploy

## Các khu vực chính

- `/` — Trang chủ
- `/stay` — Villa, khách sạn, resort
- `/tours` — Tour
- `/cruises` — Du thuyền
- `/destinations` — Điểm đến
- `/guide` — Cẩm nang du lịch
- `/checkout` — Đặt dịch vụ
- `/partner` — Cổng đối tác
- `/account` — Tài khoản khách hàng
- `/admin` — Hệ thống quản trị
- `/api/health` — Kiểm tra server runtime

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Kiểm tra trước khi deploy

```bash
npm run verify
```

Lệnh này chạy lần lượt lint, TypeScript typecheck và Next.js build.

## Deploy lên Vercel

1. Vào Vercel → **Add New → Project**.
2. Import repository này từ GitHub.
3. Đặt Project Name là `happygo-travel` nếu tên đó còn khả dụng.
4. Framework Preset: **Next.js**.
5. Root Directory: `./`.
6. Giữ Build Command và Output Directory theo mặc định của Vercel.
7. Deploy lần đầu mà chưa cần gắn tên miền riêng.
8. Sau khi có URL production của Vercel, cấu hình các biến môi trường cần thiết trong Project Settings.
9. Chỉ đặt `NEXT_PUBLIC_SITE_URL=https://happygo.vn` và `PUBLIC_SITE_URL=https://happygo.vn` sau khi domain `happygo.vn` đã được gắn và hoạt động.

Xem `.env.example` để biết danh sách biến môi trường. Không commit khóa bí mật vào GitHub.

## Dữ liệu cũ và khả năng tương thích

Một số khóa `localStorage` vẫn dùng tiền tố `tn_`. Đây là **khóa kỹ thuật tương thích dữ liệu cũ**, không phải tên thương hiệu hiển thị. Không đổi các khóa này trước khi có migration dữ liệu vì có thể làm mất dữ liệu CMS/admin đang lưu trên trình duyệt.

Thư mục `backend/` là backend Express/MySQL độc lập từ giai đoạn trước. Nó được giữ để tham chiếu/migration và **không phải cấu hình deploy mặc định của project Next.js trên Vercel**.

## Backup trước khi chuẩn hóa Vercel

Bản repo trước khi dọn prototype/GitHub Pages đã được giữ tại branch:

`archive-pre-vercel-cleanup-20260903`
