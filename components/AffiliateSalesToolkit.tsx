'use client';

import {useEffect,useMemo,useState} from 'react';

type Villa={id:string;name:string;place:string;publicPrice:number;affiliateLink:string};
type Props={villas:Villa[];commissionRate:number;referralCode:string};
const money=(v:number)=>new Intl.NumberFormat('vi-VN').format(Math.round(v))+'đ';

export function AffiliateSalesToolkit({villas,commissionRate,referralCode}:Props){
 const[selectedId,setSelectedId]=useState(''),[copied,setCopied]=useState('');
 useEffect(()=>{if(!selectedId&&villas[0])setSelectedId(villas[0].id)},[selectedId,villas]);
 const villa=useMemo(()=>villas.find(v=>v.id===selectedId)||villas[0]||null,[selectedId,villas]);
 const caption=useMemo(()=>villa?`🏡 ${villa.name}${villa.place?` · ${villa.place}`:''}\n${villa.publicPrice?`Giá công khai từ ${money(villa.publicPrice)}. `:''}HappyGo hỗ trợ tư vấn và đặt chỗ nhanh.\n\nXem chi tiết & đặt phòng: ${villa.affiliateLink}\n\nMã CTV: ${referralCode}`:'',[villa,referralCode]);
 async function copy(kind:'caption'|'link'){
  if(!villa)return;
  try{await navigator.clipboard.writeText(kind==='caption'?caption:villa.affiliateLink);setCopied(kind);window.setTimeout(()=>setCopied(''),1600)}catch{setCopied('error');window.setTimeout(()=>setCopied(''),1800)}
 }
 return <section className="affiliate-panel affiliate-toolkit">
  <div className="affiliate-panel-head"><div><small>BỘ CÔNG CỤ BÁN HÀNG</small><h2>Caption và link chia sẻ sẵn</h2><p>Chọn villa, copy nội dung rồi đăng lên Zalo, Facebook, TikTok bio hoặc gửi trực tiếp cho khách.</p></div></div>
  <div className="affiliate-toolkit-grid">
   <div className="affiliate-toolkit-builder">
    <label>Chọn villa<select value={villa?.id||''} onChange={e=>setSelectedId(e.target.value)} disabled={!villas.length}>{villas.map(v=><option key={v.id} value={v.id}>{v.name}{v.place?` · ${v.place}`:''}</option>)}</select></label>
    {villa?<>
     <textarea readOnly value={caption}/>
     <div className="affiliate-toolkit-actions"><button type="button" onClick={()=>void copy('link')}>{copied==='link'?'✓ Đã copy link':'Copy link'}</button><button type="button" className="primary" onClick={()=>void copy('caption')}>{copied==='caption'?'✓ Đã copy caption':'Copy caption + link'}</button></div>
     {copied==='error'&&<span className="affiliate-form-hint">Trình duyệt không cho phép copy tự động. Bạn có thể bôi đen nội dung để sao chép.</span>}
    </>:<div className="affiliate-empty">Chưa có villa công khai để tạo nội dung chia sẻ.</div>}
   </div>
   <aside className="affiliate-policy-card">
    <small>CHÍNH SÁCH HOA HỒNG HIỆN TẠI</small>
    <strong>{commissionRate}%</strong>
    <ul><li>Link giới thiệu được ghi nhận trong 30 ngày trên trình duyệt khách.</li><li>Hoa hồng chỉ phát sinh khi booking chuyển sang trạng thái hoàn tất.</li><li>Booking hủy hoặc không hoàn tất không được cộng hoa hồng.</li><li>Số tiền = giá trị bán của booking × tỷ lệ hoa hồng của CTV.</li><li>CTV gửi yêu cầu rút tiền; Admin đối soát rồi mới trừ số dư ví.</li></ul>
   </aside>
  </div>
 </section>;
}
