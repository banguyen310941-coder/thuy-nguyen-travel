'use client';

const groups=[
  {title:'Tài khoản Đối tác / CTV',items:[['Chờ duyệt','Hồ sơ mới, chưa được phép vận hành'],['Đang hoạt động','Đã được Admin kích hoạt'],['Cần bổ sung','Hồ sơ cần cập nhật thêm thông tin'],['Đã khóa','Tạm dừng quyền truy cập']]},
  {title:'Sản phẩm đối tác',items:[['Bản nháp','Đối tác đang soạn'],['Chờ duyệt','Đã gửi Admin kiểm tra'],['Cần chỉnh sửa','Admin trả lại để bổ sung'],['Đã xuất bản','Đã duyệt và được phép lên catalog']]},
  {title:'Thanh toán hoa hồng',items:[['Chờ đối soát','Yêu cầu rút tiền đang chờ Admin xử lý'],['Đã thanh toán','Đã duyệt và ghi nhận chi'],['Đã từ chối','Yêu cầu rút tiền không được duyệt']]},
] as const;

export function AdminNetworkStatusLegend(){
  return <section className="admin-panel" aria-label="Quy ước trạng thái mạng lưới hợp tác">
    <div className="admin-panel-head"><div><small>QUY ƯỚC TRẠNG THÁI</small><h3>Một ngôn ngữ vận hành chung</h3><p>Status kỹ thuật trong database vẫn giữ nguyên; toàn bộ nhân viên dùng các nhãn tiếng Việt dưới đây khi vận hành.</p></div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
      {groups.map(group=><article key={group.title} style={{border:'1px solid #e5e7eb',borderRadius:10,padding:12,background:'#fff'}}><b>{group.title}</b><div style={{display:'grid',gap:8,marginTop:10}}>{group.items.map(([label,note])=><div key={label}><strong style={{display:'block'}}>{label}</strong><small>{note}</small></div>)}</div></article>)}
    </div>
  </section>;
}
