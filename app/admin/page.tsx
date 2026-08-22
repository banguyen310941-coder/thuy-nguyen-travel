export const metadata = { title: 'Quản trị' };

const modules = ['Tổng quan','Khách hàng / CRM','Đơn đặt dịch vụ','Sản phẩm','Tour','Villa','Khách sạn','Du thuyền','Trang chủ','Album ảnh & video','Bài viết / Cẩm nang','SEO','Import Google Drive','Cài đặt'];

export default function AdminPage(){return <div style={{minHeight:'100vh',background:'#f5f7f8',padding:'32px'}}><div style={{maxWidth:1180,margin:'auto'}}><h1>Quản trị Thúy Nguyên Travel</h1><p>Trang này là shell quản trị tách riêng và không xuất hiện trên menu website khách hàng.</p><div className="type-grid">{modules.map((item)=><div className="type-card" key={item}><h3>{item}</h3><p>Sẵn sàng nối database và phân quyền ở giai đoạn backend.</p></div>)}</div></div></div>}
