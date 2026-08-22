'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const services = [
  ['all','Tất cả'],['tour','Tour du lịch'],['villa','Villa & Resort'],['hotel','Khách sạn'],['cruise','Du thuyền']
];

export function SearchBar() {
  const router = useRouter();
  const [service, setService] = useState('all');

  return (
    <div className="mock-search-panel">
      <div className="mock-search-tabs">
        {services.map(([value,label]) => <button type="button" key={value} className={service===value?'active':''} onClick={()=>setService(value)}>{label}</button>)}
      </div>
      <form className="mock-search-form" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const destination = String(form.get('destination') || '').trim();
        let target = '/stay';
        if(service==='tour') target='/tours';
        if(service==='cruise') target='/cruises';
        if(service==='villa') target='/stay?type=villa';
        if(service==='hotel') target='/stay?type=hotel';
        if(destination) target += (target.includes('?')?'&':'?') + `q=${encodeURIComponent(destination)}`;
        router.push(target);
      }}>
        <label className="mock-search-field mock-destination"><span>⌖</span><div><small>Điểm đến</small><input name="destination" placeholder="Nhập địa điểm..." /></div></label>
        <label className="mock-search-field"><span>▣</span><div><small>Ngày đi</small><input name="checkin" type="date" /></div></label>
        <label className="mock-search-field"><span>▣</span><div><small>Ngày về</small><input name="checkout" type="date" /></div></label>
        <label className="mock-search-field"><span>♙</span><div><small>Khách & phòng</small><select name="guests" defaultValue="2-1"><option value="2-1">2 khách, 1 phòng</option><option value="4-2">4 khách, 2 phòng</option><option value="family">Gia đình</option><option value="group">Đoàn 10+ khách</option></select></div></label>
        <button className="mock-search-button" type="submit">Tìm kiếm</button>
      </form>
      <div className="mock-search-benefits"><span>✓ Giá tốt nhất</span><span>✓ Thanh toán an toàn</span><span>✓ Hỗ trợ 24/7</span><span>✓ Xác nhận nhanh</span></div>
    </div>
  );
}
