'use client';

import { useState } from 'react';
import { AdminBookings } from '@/components/AdminBookings';
import { AdminCustomers } from '@/components/AdminCustomers';

const modules = ['Tổng quan','Khách hàng / CRM','Đơn đặt dịch vụ','Sản phẩm','Tour','Villa','Khách sạn','Du thuyền','Trang chủ','Album ảnh & video','Bài viết / Cẩm nang','SEO','Import Google Drive','Cài đặt'];

const productRows = [
  ['Oceanami Villas & Beach Club','Villa','Phước Hải','Đang bán'],
  ['NovaWorld Phan Thiết','Villa','Phan Thiết','Đang bán'],
  ['Vinpearl Resort Nha Trang','Resort','Nha Trang','Đang bán'],
  ['Ambassador I - Vịnh Hạ Long','Du thuyền','Hạ Long','Đang bán'],
];

function DataTable({rows}:{rows:string[][]}) {return <div className="admin-table">{rows.map((row,i)=><div key={i}>{row.map((cell,j)=>j===0?<b key={j}>{cell}</b>:j===row.length-1?<em key={j}>{cell}</em>:<span key={j}>{cell}</span>)}</div>)}</div>;}

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
      {active==='Tổng quan' && <><div className="admin-stats"><div><span>Khách hàng</span><b>CRM</b><small>Tự gom theo số điện thoại</small></div><div><span>Yêu cầu đặt dịch vụ</span><b>LIVE</b><small>Đọc từ API khi bật hosting</small></div><div><span>Sản phẩm</span><b>17</b><small>Villa, phòng, tour, cruise</small></div><div><span>Bài viết SEO</span><b>12</b><small>Nháp & đã xuất bản</small></div></div><section className="admin-panel"><div className="admin-panel-head"><div><h2>Hệ thống quản trị đã sẵn sàng</h2><p>Khi kết nối backend, đơn khách gửi sẽ tự tạo CRM và lưu lịch sử theo số điện thoại.</p></div></div><DataTable rows={[["Form đặt dịch vụ","Tạo đơn + khách hàng tự động","Sẵn sàng"],["CRM","Gom lịch sử nhiều đơn theo SĐT","Sẵn sàng"],["Trạng thái đơn","Mới → Tư vấn → Xác nhận → Hoàn thành","Sẵn sàng"]]}/></section></>}
      {active==='Khách hàng / CRM' && <AdminCustomers />}
      {active==='Đơn đặt dịch vụ' && <AdminBookings />}
      {['Sản phẩm','Tour','Villa','Khách sạn','Du thuyền'].includes(active) && <section className="admin-panel"><div className="admin-panel-head"><div><h2>{active}</h2><p>Quản lý nội dung, giá, ảnh, SEO, trạng thái hiển thị và liên kết đặt dịch vụ.</p></div></div><div className="admin-form-row"><label>Tìm sản phẩm<input placeholder="Nhập tên sản phẩm..."/></label><label>Trạng thái<select><option>Tất cả</option><option>Đang bán</option><option>Ẩn</option><option>Nháp</option></select></label></div><DataTable rows={productRows}/></section>}
      {active==='Trang chủ' && <section className="admin-panel"><div className="admin-panel-head"><div><h2>Chỉnh sửa trang chủ</h2><p>Quản lý banner, dịch vụ nổi bật, điểm đến, sản phẩm nổi bật và CTA.</p></div></div><div className="admin-form-row"><label>Tiêu đề banner<input defaultValue="Du lịch trọn gói – Nghỉ dưỡng đẳng cấp"/></label><label>Hotline<input defaultValue="0969 973 949"/></label></div><div className="admin-form-row"><label>Mô tả banner<input defaultValue="Vé · Tour · Villa · Resort · Du thuyền – Khám phá thế giới cùng chúng tôi!"/></label><label>Ảnh banner<input placeholder="Chọn từ Album ảnh"/></label></div><div className="editor-actions"><button>Xem trước</button><button className="admin-primary">Lưu thay đổi</button></div></section>}
      {active==='Album ảnh & video' && <section className="admin-panel"><div className="admin-panel-head"><div><h2>Thư viện ảnh & video</h2><p>Tải lên, phân nhóm và tái sử dụng media trong sản phẩm hoặc bài viết.</p></div></div><div className="drive-drop"><b>Kéo thả ảnh / video vào đây</b><span>JPG, PNG, WebP, MP4 · có thể nối Google Drive</span><button className="admin-primary">Chọn tệp</button></div></section>}
      {active==='Bài viết / Cẩm nang' && <section className="admin-panel editor-panel"><div className="admin-form-row"><label>Tiêu đề<input defaultValue="Kinh nghiệm du lịch Phan Thiết cho gia đình"/></label><label>Danh mục<select><option>Cẩm nang du lịch</option><option>Villa</option><option>Tour</option><option>Du thuyền</option></select></label></div><div className="word-editor"><div className="editor-toolbar"><button><b>B</b></button><button><i>I</i></button><button>H2</button><button>H3</button><button>• Danh sách</button><button>🔗 Link</button><button>🖼 Ảnh</button><button>🎬 Video</button></div><div className="editor-canvas" contentEditable suppressContentEditableWarning><h2>Soạn bài như Word</h2><p>Phần backend sẽ lưu bài viết, media, SEO và lịch sử chỉnh sửa.</p></div></div><div className="editor-actions"><button>Lưu nháp</button><button className="admin-primary">Đăng bài</button></div></section>}
      {active==='SEO' && <section className="admin-panel"><div className="admin-panel-head"><div><h2>SEO website</h2><p>Quản lý title, description, slug, từ khóa và dữ liệu chia sẻ mạng xã hội.</p></div></div><div className="admin-form-row"><label>SEO Title<input defaultValue="Thúy Nguyên Travel - Tour, Villa, Khách sạn & Du thuyền"/></label><label>Slug<input defaultValue="/"/></label></div></section>}
      {active==='Import Google Drive' && <section className="admin-panel"><h2>Google Drive → Website</h2><p>Chọn thư mục Drive → đọc ảnh/tài liệu/bảng giá → chuẩn hóa dữ liệu → tạo bản nháp → duyệt → xuất bản.</p><div className="drive-drop"><b>Thư mục Google Drive</b><span>Kết nối Drive để đồng bộ sản phẩm</span><button className="admin-primary">Kết nối Google Drive</button></div></section>}
      {active==='Cài đặt' && <section className="admin-panel"><div className="admin-panel-head"><div><h2>Cài đặt website</h2><p>Thông tin thương hiệu và kênh liên hệ chính.</p></div></div><div className="admin-form-row"><label>Tên website<input defaultValue="Thúy Nguyên Travel"/></label><label>Hotline<input defaultValue="0969973949"/></label></div><div className="admin-form-row"><label>Zalo<input defaultValue="https://zalo.me/0969973949"/></label><label>Email<input defaultValue="info@thuynguyentravel.com"/></label></div></section>}
    </main>
  </div>
}
