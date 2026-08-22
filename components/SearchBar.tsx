'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const services = [
  ['all','Tất cả'],['tour','Tour du lịch'],['villa','Villa & Resort'],['hotel','Khách sạn'],['cruise','Du thuyền']
] as const;

function Counter({label,value,min=0,onChange}:{label:string;value:number;min?:number;onChange:(n:number)=>void}){
  return <div className="guest-counter"><span>{label}</span><div><button type="button" onClick={()=>onChange(Math.max(min,value-1))}>−</button><b>{value}</b><button type="button" onClick={()=>onChange(value+1)}>+</button></div></div>
}

export function SearchBar() {
  const router = useRouter();
  const guestRef = useRef<HTMLDivElement>(null);
  const [service, setService] = useState('all');
  const [guestOpen,setGuestOpen]=useState(false);
  const [adults,setAdults]=useState(2);
  const [children,setChildren]=useState(0);
  const [rooms,setRooms]=useState(1);

  useEffect(()=>{
    const close=(e:MouseEvent)=>{if(guestRef.current&&!guestRef.current.contains(e.target as Node))setGuestOpen(false)};
    document.addEventListener('mousedown',close);return()=>document.removeEventListener('mousedown',close);
  },[]);

  return (
    <div className="mock-search-panel">
      <div className="mock-search-tabs">
        {services.map(([value,label]) => <button type="button" key={value} className={service===value?'active':''} onClick={()=>setService(value)}>{label}</button>)}
      </div>
      <form className="mock-search-form booking-search-live" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const destination = String(form.get('destination') || '').trim();
        const checkin=String(form.get('checkin')||'');
        const checkout=String(form.get('checkout')||'');
        let path = '/stay';
        const params=new URLSearchParams();
        if(service==='tour') path='/tours';
        if(service==='cruise') path='/cruises';
        if(service==='villa') params.set('type','villa');
        if(service==='hotel') params.set('type','hotel');
        if(destination) params.set('q',destination);
        if(checkin) params.set('checkin',checkin);
        if(checkout) params.set('checkout',checkout);
        params.set('adults',String(adults));params.set('children',String(children));params.set('rooms',String(rooms));
        router.push(`${path}?${params.toString()}`);
      }}>
        <label className="mock-search-field mock-destination"><span>⌖</span><div><small>Điểm đến</small><input name="destination" placeholder="Bạn muốn đi đâu?" autoComplete="off" /></div></label>
        <label className="mock-search-field"><span>▣</span><div><small>Ngày đi / nhận phòng</small><input name="checkin" type="date" /></div></label>
        <label className="mock-search-field"><span>▣</span><div><small>Ngày về / trả phòng</small><input name="checkout" type="date" /></div></label>
        <div className="mock-search-field guest-picker" ref={guestRef}><span>♙</span><div><small>Khách & phòng</small><button className="guest-trigger" type="button" onClick={()=>setGuestOpen(v=>!v)}>{adults} người lớn · {children} trẻ em · {rooms} phòng</button>{guestOpen&&<div className="guest-popover"><Counter label="Người lớn" value={adults} min={1} onChange={setAdults}/><Counter label="Trẻ em" value={children} onChange={setChildren}/><Counter label="Phòng" value={rooms} min={1} onChange={setRooms}/><button type="button" className="guest-done" onClick={()=>setGuestOpen(false)}>Xong</button></div>}</div></div>
        <button className="mock-search-button" type="submit">Tìm kiếm</button>
      </form>
      <div className="mock-search-benefits"><span>✓ Giá tốt nhất</span><span>✓ Tư vấn minh bạch</span><span>✓ Hỗ trợ 24/7</span><span>✓ Xác nhận nhanh</span></div>
    </div>
  );
}
