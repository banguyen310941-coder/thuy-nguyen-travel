'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const services = [
  ['all','Tất cả'],['tour','Tour du lịch'],['villa','Villa & Resort'],['hotel','Khách sạn'],['cruise','Du thuyền']
] as const;
type Service=(typeof services)[number][0];

function Counter({label,value,min=0,onChange}:{label:string;value:number;min?:number;onChange:(n:number)=>void}){
  return <div className="guest-counter"><span>{label}</span><div><button type="button" onClick={()=>onChange(Math.max(min,value-1))}>−</button><b>{value}</b><button type="button" onClick={()=>onChange(value+1)}>+</button></div></div>
}

export function SearchBar() {
  const router = useRouter();
  const guestRef = useRef<HTMLDivElement>(null);
  const [service, setService] = useState<Service>('all');
  const [guestOpen,setGuestOpen]=useState(false);
  const [adults,setAdults]=useState(2);
  const [children,setChildren]=useState(0);
  const [rooms,setRooms]=useState(1);
  const [cabins,setCabins]=useState(1);

  useEffect(()=>{
    const close=(e:MouseEvent)=>{if(guestRef.current&&!guestRef.current.contains(e.target as Node))setGuestOpen(false)};
    document.addEventListener('mousedown',close);return()=>document.removeEventListener('mousedown',close);
  },[]);

  const isStay=service==='villa'||service==='hotel';
  const isTour=service==='tour';
  const isCruise=service==='cruise';

  function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form=new FormData(event.currentTarget);
    const q=String(form.get('destination')||'').trim();
    const start=String(form.get('start')||'');
    const end=String(form.get('end')||'');
    const departure=String(form.get('departure')||'');
    const duration=String(form.get('duration')||'');
    const params=new URLSearchParams();
    if(q)params.set('q',q);
    if(start)params.set(isStay?'checkin':'date',start);
    if(end&&isStay)params.set('checkout',end);
    if(departure)params.set('departure',departure);
    if(duration)params.set('duration',duration);
    params.set('adults',String(adults));
    params.set('children',String(children));
    if(isStay)params.set('rooms',String(rooms));
    if(isCruise)params.set('cabins',String(cabins));

    let path='/search';
    if(service==='tour')path='/tours';
    if(service==='villa'){path='/stay';params.set('type','villa')}
    if(service==='hotel'){path='/stay';params.set('type','hotel')}
    if(service==='cruise')path='/cruises';
    if(service==='all')params.set('service','all');
    router.push(`${path}?${params.toString()}`);
  }

  const destinationLabel=isTour?'Điểm đến / tên tour':isCruise?'Vịnh / tên du thuyền':isStay?'Điểm đến / tên chỗ nghỉ':'Bạn muốn tìm gì?';
  const destinationPlaceholder=isTour?'Trung Quốc, Đà Nẵng, Phú Quốc...':isCruise?'Hạ Long, Lan Hạ, Ambassador...':isStay?'Phan Thiết, Nha Trang, Phú Quốc...':'Tour, villa, khách sạn, du thuyền...';

  return <div className="mock-search-panel search-panel-v2">
    <div className="mock-search-tabs">
      {services.map(([value,label])=><button type="button" key={value} className={service===value?'active':''} onClick={()=>{setService(value);setGuestOpen(false)}}>{label}</button>)}
    </div>
    <form className="mock-search-form booking-search-live search-form-v2" onSubmit={submit}>
      <label className="mock-search-field mock-destination"><span>⌖</span><div><small>{destinationLabel}</small><input name="destination" placeholder={destinationPlaceholder} autoComplete="off"/></div></label>

      {isTour&&<>
        <label className="mock-search-field"><span>✈</span><div><small>Khởi hành từ</small><select name="departure" defaultValue=""><option value="">Tất cả điểm khởi hành</option><option>Hà Nội</option><option>TP.HCM</option><option>Đà Nẵng</option></select></div></label>
        <label className="mock-search-field"><span>▣</span><div><small>Ngày khởi hành</small><input name="start" type="date"/></div></label>
      </>}

      {isStay&&<>
        <label className="mock-search-field"><span>▣</span><div><small>Ngày nhận phòng</small><input name="start" type="date"/></div></label>
        <label className="mock-search-field"><span>▣</span><div><small>Ngày trả phòng</small><input name="end" type="date"/></div></label>
      </>}

      {isCruise&&<>
        <label className="mock-search-field"><span>▣</span><div><small>Ngày đi</small><input name="start" type="date"/></div></label>
        <label className="mock-search-field"><span>◷</span><div><small>Thời lượng</small><select name="duration" defaultValue=""><option value="">Tất cả hành trình</option><option value="day">Trong ngày</option><option value="2n1d">2 ngày 1 đêm</option><option value="3n2d">3 ngày 2 đêm</option></select></div></label>
      </>}

      {service==='all'&&<>
        <label className="mock-search-field"><span>▣</span><div><small>Ngày bắt đầu</small><input name="start" type="date"/></div></label>
        <label className="mock-search-field"><span>▣</span><div><small>Ngày kết thúc</small><input name="end" type="date"/></div></label>
      </>}

      <div className="mock-search-field guest-picker" ref={guestRef}><span>♙</span><div><small>{isCruise?'Khách & cabin':isStay?'Khách & phòng':'Số khách'}</small><button className="guest-trigger" type="button" onClick={()=>setGuestOpen(v=>!v)}>{adults} NL · {children} TE{isStay?` · ${rooms} phòng`:isCruise?` · ${cabins} cabin`:''}</button>{guestOpen&&<div className="guest-popover"><Counter label="Người lớn" value={adults} min={1} onChange={setAdults}/><Counter label="Trẻ em" value={children} onChange={setChildren}/>{isStay&&<Counter label="Phòng" value={rooms} min={1} onChange={setRooms}/>} {isCruise&&<Counter label="Cabin" value={cabins} min={1} onChange={setCabins}/>}<button type="button" className="guest-done" onClick={()=>setGuestOpen(false)}>Xong</button></div>}</div></div>
      <button className="mock-search-button" type="submit">{isTour?'Tìm tour':isCruise?'Tìm du thuyền':isStay?'Tìm phòng':'Tìm tất cả'}</button>
    </form>
    <div className="search-mode-hint">{isTour?'Tìm đúng tour theo điểm đến, nơi khởi hành và ngày đi.':service==='villa'?'Chỉ hiển thị Villa & Resort phù hợp.':service==='hotel'?'Chỉ hiển thị Khách sạn/Resort phù hợp.':isCruise?'Tìm theo vịnh, ngày đi và thời lượng hành trình.':'Tìm đồng thời Tour, Villa, Khách sạn và Du thuyền.'}</div>
    <div className="mock-search-benefits"><span>✓ Giá tốt nhất</span><span>✓ Tư vấn minh bạch</span><span>✓ Hỗ trợ 24/7</span><span>✓ Xác nhận nhanh</span></div>
  </div>;
}
