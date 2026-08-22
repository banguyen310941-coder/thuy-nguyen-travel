# Thúy Nguyên Travel — Next.js application

Đây là bản rebuild ứng dụng thật, thay cho prototype HTML tĩnh.

## Kiến trúc
- Next.js 15 + TypeScript + App Router.
- `app/`: route website thật (`/`, `/stay`, `/tours`, `/cruises`, `/destinations`, `/guide`, `/admin`).
- `components/`: Header, Footer, SearchBar, PropertyCard dùng lại toàn site.
- `data/`: dữ liệu mẫu tách khỏi giao diện, chuẩn bị thay bằng database/API.
- `app/globals.css`: hệ design responsive desktop/mobile.
- `/admin` tách khỏi public header/footer và không có link trên website khách hàng.

## Giai đoạn tiếp theo
1. PostgreSQL/Supabase cho sản phẩm, phòng, giá, đơn đặt dịch vụ và CRM.
2. Đăng nhập và phân quyền quản trị.
3. CMS bài viết kiểu Word bằng Tiptap/CKEditor.
4. Google Drive API để đọc thư mục sản phẩm, chuẩn hóa dữ liệu và tạo bản nháp.
5. Search thật theo điểm đến, ngày, số khách/phòng và availability.
6. SEO: metadata động, sitemap, schema Hotel/LodgingBusiness/TouristTrip, canonical.

## Chạy local
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```
Next.js xuất bản tĩnh ra thư mục `out/` để có thể preview bằng GitHub Pages. Backend/admin động sẽ cần môi trường server khi triển khai chính thức.
