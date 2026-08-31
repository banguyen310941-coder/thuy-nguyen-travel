export function PartnerApiGuide(){
 const sample=`{
  "data": {
    "products": [
      {
        "id": "HT001",
        "name": "Happy Bay Hotel",
        "type": "hotel",
        "location": "Nha Trang",
        "address": "12 Trần Phú, Nha Trang",
        "price": 2500000,
        "description": "Khách sạn gần biển...",
        "thumbnail": "https://example.com/hotel-cover.jpg",
        "gallery": [
          "https://example.com/1.jpg",
          "https://example.com/2.jpg"
        ],
        "amenities": ["Hồ bơi", "Ăn sáng", "Wi-Fi"],
        "checkin": "14:00",
        "checkout": "12:00",
        "rooms": [
          {"name":"Deluxe Ocean View","capacity":2}
        ]
      }
    ]
  }
}`;
 return <article className="partner-api-guide-article">
  <header><span>HƯỚNG DẪN DÀNH CHO ĐỐI TÁC</span><h2>Cách đồng bộ sản phẩm qua API với HappyGo</h2><p>Nếu doanh nghiệp đã có website hoặc phần mềm quản lý sản phẩm, bạn có thể cung cấp một API trả về dữ liệu JSON để HappyGo lấy danh sách Villa, Khách sạn, Du thuyền hoặc Tour mà không cần nhập lại thủ công.</p></header>
  <section><h3>1. API cần chuẩn bị những gì?</h3><p>Đối tác cần một đường dẫn API dạng HTTPS có thể truy cập từ trình duyệt. API nên dùng phương thức <b>GET</b> và trả về JSON. Nếu API có bảo mật, HappyGo Partner Hub hiện hỗ trợ Bearer Token.</p><div className="partner-api-cards"><div><b>API endpoint</b><span>Ví dụ: https://api.doanhnghiep.vn/products</span></div><div><b>Bearer Token</b><span>Nhập token nếu API của bạn yêu cầu Authorization.</span></div><div><b>itemsPath</b><span>Chỉ vị trí mảng sản phẩm trong JSON, ví dụ data.products.</span></div></div></section>
  <section><h3>2. Cấu trúc JSON mẫu</h3><p>HappyGo có thể tự nhận nhiều tên trường phổ biến như <code>name</code>/<code>title</code>, <code>type</code>/<code>category</code>, <code>location</code>/<code>place</code>, <code>thumbnail</code>/<code>image</code>. Cấu trúc dưới đây là mẫu khuyến nghị.</p><pre><code>{sample}</code></pre></section>
  <section><h3>3. Điền “Đường dẫn danh sách sản phẩm” như thế nào?</h3><p>Nếu API trả thẳng một mảng sản phẩm ở cấp ngoài cùng thì để trống ô này. Nếu JSON trả về dạng <code>{`{ "items": [...] }`}</code> thì nhập <b>items</b>. Nếu mảng nằm trong <code>data.products</code> như ví dụ trên thì nhập chính xác <b>data.products</b>.</p></section>
  <section><h3>4. Các loại sản phẩm HappyGo nhận diện</h3><div className="partner-api-type-grid"><span><b>Villa & Resort</b><small>villa, resort</small></span><span><b>Khách sạn</b><small>hotel, khách sạn</small></span><span><b>Du thuyền</b><small>cruise, du thuyền</small></span><span><b>Tour du lịch</b><small>tour</small></span></div><p>Nếu giá trị <code>type</code> không nhận diện được, hệ thống tạm xếp sản phẩm vào Villa & Resort để HappyGo kiểm tra lại trước khi duyệt.</p></section>
  <section><h3>5. Ảnh và album ảnh</h3><p>Nên gửi URL ảnh công khai bằng HTTPS. Trường ảnh đại diện có thể dùng <code>thumbnail</code>, <code>image</code> hoặc <code>cover_url</code>. Album có thể là mảng URL trong trường <code>gallery</code>. Không nên gửi ảnh dạng base64 qua API vì dữ liệu sẽ rất nặng.</p></section>
  <section><h3>6. Quy trình sau khi bấm “Kiểm tra & đồng bộ”</h3><div className="partner-api-steps"><span>1. HappyGo gọi API</span><i>→</i><span>2. Đọc JSON</span><i>→</i><span>3. Mapping sản phẩm</span><i>→</i><span>4. Chuyển sang Chờ duyệt</span><i>→</i><span>5. Đối tác setup giá</span><i>→</i><span>6. HappyGo duyệt & mở bán</span></div><p>Sản phẩm đồng bộ qua API <b>không tự động public ngay</b>. HappyGo vẫn kiểm tra nội dung, giá và chính sách trước khi cho hiển thị trên website.</p></section>
  <section><h3>7. Lỗi thường gặp</h3><div className="partner-api-errors"><div><b>API trả về 401 / 403</b><span>Kiểm tra Bearer Token và quyền truy cập.</span></div><div><b>Không tìm thấy mảng sản phẩm</b><span>Kiểm tra lại itemsPath. Ví dụ data.products.</span></div><div><b>Failed to fetch / CORS</b><span>Máy chủ API cần cho phép domain HappyGo gọi từ trình duyệt hoặc cần tích hợp qua backend HappyGo.</span></div><div><b>Ảnh không hiển thị</b><span>Đảm bảo URL ảnh là HTTPS, truy cập công khai và không chặn hotlink.</span></div></div></section>
  <section className="partner-api-security"><h3>8. Lưu ý bảo mật</h3><p>Không gửi mật khẩu quản trị website, mật khẩu database hoặc API key có quyền cao. Chỉ tạo token riêng cho HappyGo với quyền <b>đọc dữ liệu sản phẩm cần đồng bộ</b>. Khi HappyGo triển khai backend chính thức, token sẽ được lưu phía server thay vì trình duyệt như bản mẫu hiện tại.</p></section>
  <footer><b>Cần hỗ trợ kỹ thuật?</b><p>Đối tác có thể gửi tài liệu API hoặc một endpoint mẫu cho bộ phận kỹ thuật HappyGo. HappyGo sẽ hỗ trợ xác định itemsPath và mapping trường dữ liệu phù hợp.</p></footer>
 </article>
}
