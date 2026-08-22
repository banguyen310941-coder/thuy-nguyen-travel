'use client';

import { useState } from 'react';

const modules = ['Tổng quan','Khách hàng / CRM','Đơn đặt dịch vụ','Sản phẩm','Tour','Villa','Khách sạn','Du thuyền','Trang chủ','Album ảnh & video','Bài viết / Cẩm nang','SEO','Import Google Drive','Cài đặt'];

export default function AdminPage(){
  const [active,setActive]=useState('Tổng quan');
  return <div className="admin-app">
    <aside className="admin-sidebar">
      <div className="admin-brand"><span>TN</span><div><b>THÚY NGUYÊN</b><small>ADMIN</small></div></div>
      <nav>{modules.map((item)=><button key={item} className={active===item?'active':''} onClick={()=>setActive(item)}>{item}</button>)}</nav>
      <a className="admin-back" href="/">← Xem website</a>
    </aside>
    <main className="admin-main">
      <div className="admin-top"><div><small>THÚY NGUYÊN TRAVEL / CMS</small><h1>{active}</h1></div><button className="admin-primary">+ Thêm mới</button></div>
      {active==='Tổng quan' && <>
        <div className="admin-stats"><div><span>Khách hàng</span><b>128</b><small>CRM & khách tiềm năng</small></div><div><span>Yêu cầu đặt dịch vụ</span><b>24</b><small>Chờ tư vấn / xác nhận</small></div><div><span>Sản phẩm</span><b>17</b><small>Villa, phòng, tour, cruise</small></div><div><span>Bài viết SEO</span><b>12</b><small>Nháp & đã xuất bản</small></div></div>
        <section className="admin-panel"><div className="admin-panel-head"><div><h2>Hàng chờ xử lý</h2><p>Những việc quản trị viên cần kiểm tra.</p></div></div><div className="admin-table"><div><b>Oceanami Villas</b><span>Cập nhật giá theo ngày</span><em>Villa</em></div><div><b>Ambassador I</b><span>Bổ sung hạng cabin</span><em>Du thuyền</em></div><div><b>Tour Bắc Kinh</b><span>Thêm lịch khởi hành</span><em>Tour</em></div></div></section>
      </>}
      {active==='Bài viết / Cẩm nang' && <section className="admin-panel editor-panel"><div className="admin-form-row"><label>Tiêu đề<input defaultValue="Kinh nghiệm du lịch Phan Thiết cho gia đình"/></label><label>Danh mục<select><option>Cẩm nang du lịch</option><option>Villa</option><option>Tour</option></select></label></div><div className="word-editor"><div className="editor-toolbar"><button><b>B</b></button><button><i>I</i></button><button>H2</button><button>H3</button><button>• Danh sách</button><button>🔗 Link</button><button>🖼 Ảnh</button><button>🎬 Video</button><button>↶</button><button>↷</button></div><div className="editor-canvas" contentEditable suppressContentEditableWarning><h2>Phan Thiết có gì phù hợp cho gia đình?</h2><p>Soạn nội dung trực tiếp tại đây như Word. Bản backend sẽ nối trình biên tập Tiptap/CKEditor, thư viện ảnh, video, bảng, liên kết sản phẩm và công cụ SEO.</p></div></div><div className="editor-actions"><button>Lưu nháp</button><button className="admin-primary">Đăng bài</button></div></section>}
      {active==='Import Google Drive' && <section className="admin-panel"><h2>Google Drive → Website</h2><p>Luồng dự kiến: chọn thư mục Drive → đọc ảnh/tài liệu/bảng giá → AI chuẩn hóa dữ liệu → tạo bản nháp → duyệt → xuất bản.</p><div className="drive-drop"><b>Thư mục Google Drive</b><span>Kết nối Drive để đồng bộ sản phẩm</span><button className="admin-primary">Kết nối Google Drive</button></div><div className="admin-form-row"><label>Chế độ<select><option>Duyệt trước khi đăng</option><option>Tự động đăng sau khi chuẩn hóa</option></select></label><label>Loại nội dung<select><option>Tự nhận diện</option><option>Villa</option><option>Khách sạn</option><option>Tour</option><option>Du thuyền</option></select></label></div></section>}
      {!['Tổng quan','Bài viết / Cẩm nang','Import Google Drive'].includes(active) && <section className="admin-panel"><div className="admin-panel-head"><div><h2>{active}</h2><p>Module đã có trong kiến trúc quản trị. Bước backend sẽ nối database, phân quyền và thao tác CRUD thực tế.</p></div></div><div className="admin-placeholder"><span>◫</span><b>{active}</b><p>Danh sách, tìm kiếm, bộ lọc, thêm/sửa/xóa và lịch sử thay đổi sẽ nằm tại đây.</p></div></section>}
    </main>
  </div>
}
