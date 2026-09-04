# Chuẩn đóng gói sản phẩm HappyGo Travel

Tài liệu này biến Anyla Sầm Sơn thành mẫu chuẩn để áp dụng lại cho Khách sạn, Villa/Resort và Du thuyền.

## 1. Nguyên tắc nguồn dữ liệu

Có 2 lớp giá tách biệt, không được trộn:

### A. Giá đề xuất / tham khảo
Lưu tại từng hạng phòng/căn/cabin trong `product_units.data`.

Các trường chuẩn:
- `lowWeekdayPrice`: mùa thấp điểm trong tuần
- `lowWeekendPrice`: mùa thấp điểm cuối tuần
- `weekdayPrice`: mùa thường trong tuần
- `weekendPrice`: mùa thường cuối tuần
- `highWeekdayPrice`: mùa cao điểm trong tuần
- `highWeekendPrice`: mùa cao điểm cuối tuần
- `holidayPrice`: lễ/Tết

Giá này chỉ dùng để khách tham khảo khi chưa chọn ngày. Không được dùng để tự điền vào Lịch giá theo ngày.

### B. Giá xác nhận theo ngày
Nguồn duy nhất là `rate_rules` production và được public thành `tn_cms_daily_rates_v1`.

Mỗi ngày/khoảng ngày phải có:
- `unit_id`
- `start_date`
- `end_date`
- `retail_price_vnd`
- `inventory`
- trạng thái / minimum stay nếu có

Quy tắc bắt buộc:
- Có rate thật -> hiển thị đúng giá rate.
- Hết/tạm giữ -> hiển thị trạng thái tương ứng.
- Không có rate -> `Chưa mở giá` / `Liên hệ`.
- Tuyệt đối không lấy giá đề xuất để lấp ngày chưa có rate.

## 2. Luồng khách hàng

1. Khách mở trang sản phẩm.
2. Phần đầu trang chỉ hiển thị `Giá đề xuất / tham khảo`.
3. `Lịch giá theo ngày` hiển thị giá xác nhận thật.
4. Khách bấm một ngày có giá hoặc chọn ngày trong form booking.
5. URL được cập nhật bằng `checkin` / `checkout`.
6. `PublishedUnits` đọc ngày đã chọn và chỉ lấy rate thật của hạng đó.
7. Card hạng phòng đổi từ `GIÁ ĐỀ XUẤT / THAM KHẢO` sang `GIÁ XÁC NHẬN THEO NGÀY`.
8. Nếu ngày chưa có rate, card hiển thị `Chưa mở giá`, không dùng bảng đề xuất thay thế.

## 3. Chuẩn hình ảnh

### Album sản phẩm
- Ảnh cover rõ sản phẩm.
- Album tổng gồm ngoại cảnh, sảnh, nhà hàng, hồ bơi, tiện ích và phòng.
- Bấm ảnh mở lightbox trong chính trang, không chuyển trang mới.

### Ảnh hạng phòng/căn/cabin
- Mỗi unit có album riêng trong `product_units.data.images`.
- Ảnh đầu lớn, ảnh phụ hiển thị dạng strip như Booking.com.
- Bấm bất kỳ ảnh nào mở lightbox của riêng hạng đó.
- Không dùng ảnh phòng khác để lấp ảnh thiếu.

## 4. Chuẩn thông tin sản phẩm

Bắt buộc trước khi publish:
- `name`
- `slug`
- `type`
- `place`
- `address` nếu có
- `summary`
- `cover`
- `gallery`
- `category` / hạng dịch vụ
- check-in / check-out cho lưu trú
- tiện ích
- chính sách
- ít nhất 1 unit bán

Mỗi unit bắt buộc:
- mã
- tên
- sức chứa
- diện tích nếu có
- loại giường nếu có
- ảnh riêng
- trạng thái bán
- bảng giá đề xuất nếu đã có

## 5. Chuẩn SEO

URL canonical:
- `/product/<slug>`
- Ví dụ: `/product/anyla-sam-son`

URL cũ `/product?slug=<slug>` chỉ dùng tương thích và phải redirect 308 sang canonical.

Mỗi sản phẩm production có:
- title riêng
- meta description riêng
- canonical
- robots `index, follow`
- Open Graph title/description/image
- Twitter card
- schema `Hotel` hoặc `LodgingBusiness` cho lưu trú
- schema `Product` cho sản phẩm khác
- `BreadcrumbList`
- sitemap lấy trực tiếp danh sách product production
- `robots.txt` cho phép `/product/`

Không đưa điểm đánh giá giả vào schema. Chỉ thêm aggregate rating khi có đánh giá khách hàng thật và đủ dữ liệu.

## 6. Checklist đăng một sản phẩm mới

1. Tạo product và chọn đúng loại.
2. Tải cover + album tổng.
3. Tạo từng unit.
4. Tải ảnh riêng từng unit.
5. Nhập bảng giá đề xuất theo mùa nếu có.
6. Import/tạo lịch giá xác nhận theo ngày vào production.
7. Kiểm tra lịch: ngày không có rate phải hiện `Chưa mở`.
8. Chọn thử 1 ngày trong form booking và xác nhận card unit đổi sang giá đúng ngày.
9. Nhập SEO title + SEO description.
10. Publish.
11. Kiểm tra URL canonical `/product/<slug>`.
12. Kiểm tra source page có JSON-LD và sitemap có URL sản phẩm.
13. Test mobile: album, unit gallery, calendar, booking form.

## 7. Quy tắc áp dụng cho loại khác

### Khách sạn
Unit = hạng phòng. Giá xác nhận theo phòng/đêm.

### Villa & Resort
Unit = căn/villa. Giá xác nhận theo căn/đêm. Có thể bổ sung phụ thu quá người.

### Du thuyền
Unit = cabin. Lịch giá theo ngày khởi hành. Giá đề xuất chỉ tham khảo; ngày khởi hành có rate thật mới hiển thị giá xác nhận.

### Tour
Không dùng bảng giá phòng. Sử dụng lịch khởi hành và giá theo khách/gói riêng của luồng Tour.

## 8. Nguyên tắc không được phá vỡ

- Không tự đoán giá.
- Không tự điền lịch ngày bằng giá tham khảo.
- Không hiển thị rating mặc định.
- Không công khai giá net/NCC.
- Không dùng ảnh sai hạng phòng.
- Không publish sản phẩm thiếu nguồn giá mà lại hiển thị như giá đã xác nhận.
