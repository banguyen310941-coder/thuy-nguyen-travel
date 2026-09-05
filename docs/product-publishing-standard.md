# Quy trình chuẩn đăng sản phẩm HappyGo Travel

Tài liệu này là **chuẩn bắt buộc** cho mọi sản phẩm mới sau này. Mục tiêu là sản phẩm nào đăng lên cũng đi cùng một luồng: khách xem đúng thông tin và giá bán công khai; CTV sau khi đăng nhập mới được lấy bộ ảnh bán hàng và link giới thiệu.

## 1. Nguyên tắc cố định

Có 3 lớp dữ liệu phải tách riêng:

1. **Trang public cho khách**: thông tin sản phẩm, ảnh xem sản phẩm, hạng phòng/căn/cabin, lịch giá và booking.
2. **Giá bán**: giá cấu hình của đúng hạng + giá production theo ngày nếu có.
3. **Bộ công cụ CTV**: caption, affiliate link, album ảnh tải về. Chỉ xuất hiện sau đăng nhập CTV.

Không được đưa album tải bán hàng của CTV ra trang sản phẩm public.

## 2. Chuẩn giá bán cho Khách sạn / Villa / Resort / Du thuyền

Mỗi hạng phòng/căn/cabin lưu bảng giá trong `product_units.data` với các trường chuẩn:

- `lowWeekdayPrice`
- `lowWeekendPrice`
- `weekdayPrice`
- `weekendPrice`
- `highWeekdayPrice`
- `highWeekendPrice`
- `holidayPrice`

`rate_rules` production dùng để ghi đè giá theo ngày/khoảng ngày, tồn bán, tạm giữ hoặc hết phòng.

### Thứ tự ưu tiên khi hiển thị lịch giá public

1. Nếu ngày có `rate_rules` và đang mở bán: dùng đúng `retail_price_vnd` của rate.
2. Nếu ngày có `rate_rules` trạng thái hold/soldout hoặc inventory = 0: hiển thị trạng thái tương ứng, không lấy giá nền lấp vào.
3. Nếu ngày chưa có `rate_rules`: dùng giá cấu hình của đúng hạng phòng/căn/cabin theo mùa/ngày thường/cuối tuần/lễ.
4. Nếu cả rate và giá cấu hình đều chưa có: hiển thị `Liên hệ`.

Như vậy lịch tháng phải có giá ngay khi hạng đã được nhập bảng giá; Admin chỉ cần tạo `rate_rules` khi muốn ghi đè giá hoặc quản lý tồn theo ngày.

## 3. Chuẩn trang sản phẩm public

### Album đầu trang

- Hiển thị cover và gallery sản phẩm theo giao diện public hiện tại.
- Có thể mở lightbox để khách xem ảnh.
- Không hiển thị các nhãn như `ẢNH NGUỒN SẢN PHẨM`, `Album CTV`, `Tải ảnh gốc`, `Tải cả album`.
- Không biến trang public thành kho ảnh bán hàng.

### Ảnh từng hạng phòng/căn/cabin

- Mỗi unit có ảnh riêng trong `product_units.data.images`.
- Public chỉ dùng giao diện xem ảnh gọn: ảnh chính + một số ảnh preview + nút xem thêm/lightbox.
- Không hiển thị toàn bộ ảnh thành lưới dài trên card unit.
- Không có nút tải ảnh bán hàng trên trang public.
- Không dùng ảnh sai hạng để lấp chỗ trống.

### Lịch giá

- Luôn chọn được đúng hạng đang xem.
- Mỗi ô ngày hiển thị giá nếu đã có giá cấu hình hoặc rate production.
- Giá production theo ngày luôn ưu tiên hơn giá nền.
- Ngày hết/tạm giữ hiển thị trạng thái, không hiển thị giá nền.
- Khách bấm ngày có giá để cập nhật `checkin` / `checkout` và xem đúng giá từng hạng.

## 4. Chuẩn khu CTV

CTV phải đăng nhập trước khi truy cập bộ công cụ bán hàng.

Luồng chuẩn:

1. CTV đăng nhập trang CTV.
2. Tìm/chọn đúng sản phẩm muốn bán.
3. Hệ thống tạo đúng affiliate link của sản phẩm đó.
4. CTV copy caption + link.
5. CTV xem và tải album ảnh đúng sản phẩm tại đây.
6. Nếu có thư mục Drive nguồn, cho phép mở/tải cả album từ khu CTV.

Album CTV được gom từ:

- cover sản phẩm;
- gallery sản phẩm;
- ảnh các hạng phòng/căn/cabin của chính sản phẩm đó.

Phải loại ảnh trùng. Không để API public trả về chức năng download album CTV.

## 5. Dữ liệu bắt buộc trước khi publish

### Sản phẩm

- `name`
- `slug`
- `type`
- `place`
- `summary`
- `cover`
- `gallery`
- chính sách / tiện ích phù hợp loại sản phẩm
- ít nhất 1 unit đối với Khách sạn, Villa/Resort, Du thuyền

### Mỗi unit

- mã
- tên
- trạng thái bán
- sức chứa
- ảnh đúng hạng
- ít nhất một mức giá bán cấu hình nếu muốn lịch public có giá ngay

Nếu chưa có bảng giá unit, sản phẩm vẫn có thể lưu draft nhưng không nên publish như một sản phẩm đã sẵn sàng bán.

## 6. Checklist vận hành khi đăng sản phẩm mới

1. Tạo sản phẩm và chọn đúng loại.
2. Nhập nội dung public.
3. Tải cover + gallery public.
4. Tạo từng phòng/căn/cabin.
5. Tải ảnh đúng cho từng unit.
6. Nhập bảng giá unit: ngày thường/cuối tuần/lễ và mùa nếu có.
7. Chỉ tạo `rate_rules` cho ngày cần giá riêng, tồn riêng, tạm giữ hoặc soldout.
8. Mở preview public và kiểm tra lịch tháng đã hiện giá theo từng ngày.
9. Chọn thử một ngày để kiểm tra giá card unit và booking.
10. Kiểm tra ảnh unit đang ở giao diện xem gọn, không phải album nguồn dài.
11. Đăng nhập CTV, tìm đúng sản phẩm, kiểm tra affiliate link.
12. Kiểm tra CTV tải được ảnh đúng sản phẩm và trang public không có nút tải ảnh CTV.
13. Kiểm tra mobile trước khi publish.
14. Publish.

## 7. Chuẩn theo loại sản phẩm

### Khách sạn

Unit = hạng phòng. Giá hiển thị theo phòng/đêm.

### Villa & Resort

Unit = căn/villa. Giá hiển thị theo căn/đêm. Phụ thu quá người quản lý riêng.

### Du thuyền

Unit = cabin. Giá hiển thị theo cabin/ngày khởi hành hoặc cabin/đêm theo cấu hình sản phẩm.

### Tour

Tour không dùng lịch phòng/cabin. Giá tour và lịch khởi hành đi theo luồng Tour riêng, nhưng quy tắc CTV vẫn giống nhau: ảnh tải bán hàng chỉ nằm trong khu CTV sau đăng nhập.

## 8. Quy tắc kỹ thuật không được phá vỡ

- `ProductGallery` public không được chứa album tải bán hàng.
- `UnitPhotoGallery` public chỉ là viewer gọn, không render toàn bộ album nguồn dài.
- `ProductRateCalendar` phải có fallback từ giá cấu hình unit khi không có rate ngày.
- `rate_rules` phải ưu tiên hơn fallback giá unit.
- `AffiliateSalesToolkit` phải là nơi chứa album CTV tải về.
- Affiliate API không được trả giá NET/NCC.
- Không công khai `sourceImageFolder` qua API public catalog.
- Không tự đoán giá.
- Không dùng ảnh sai sản phẩm hoặc sai hạng.

## 9. Definition of Done cho mọi sản phẩm mới

Một sản phẩm chỉ được coi là hoàn tất khi đồng thời đạt 4 điều kiện:

- **Public đúng**: giao diện ảnh gọn, thông tin đầy đủ.
- **Giá đúng**: lịch tháng hiện giá từ unit hoặc rate production theo đúng ưu tiên.
- **CTV đúng**: đăng nhập, chọn đúng sản phẩm, có link giới thiệu và tải được album đúng sản phẩm.
- **Mobile đúng**: không vỡ layout, lịch giá bấm được và ảnh không kéo trang quá dài.

Các thay đổi code sau này làm vi phạm các nguyên tắc này phải bị regression check chặn trước khi build production.
