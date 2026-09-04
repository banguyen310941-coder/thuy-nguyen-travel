# Hardening remaining modules — 2026-09-04

Checkpoint GitHub-only trong thời gian Vercel production đang rate limited.

## Đã chuyển khỏi browser mirror

- Khách cũ & cơ hội bán lại: đọc Booking + CRM production.
- Công việc hôm nay: tổng hợp Booking/Điều hành + CRM follow-up + phản hồi khách production.
- Báo cáo Điều hành theo kỳ: đọc trạng thái bàn giao và nhật ký phân công production.
- API Điều hành trả role/phạm vi actor; lần nhận bàn giao mới lưu thêm `handoffAcceptedById` để báo cáo không phụ thuộc tên nhân viên.

## Quy tắc triển khai

Branch này chưa merge vào `main` trong lúc Vercel bị giới hạn build. Chỉ merge sau khi GitHub CI Lint + Typecheck + Build xanh và khi sẵn sàng triển khai production.
