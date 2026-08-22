'use client';

import { useEffect, useMemo, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function BookingInquiry({product,kind='dịch vụ'}:{product:string;kind?:string}){
  const [state,setState]=useState<'idle'|'sending'|'saved'|'fallback'>('idle');
  const [code,setCode]=useState('');
  const [message,setMessage]=useState('');
  const [selectedUnit,setSelectedUnit]=useState('');
  const normalized=kind.toLowerCase();
  const isTour=normalized.includes('tour');
  const isCruise=normalized.includes('du thuyền')||normalized.includes('cruise');
  const isStay=!isTour&&!isCruise;
  const today=useMemo(()=>{
    const d=new Date(); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  },[]);

  useEffect(()=>{
    const select=(event:Event)=>{
      const detail=(event as CustomEvent<{code?:string;name?:string}>).detail||{};
      const value=[detail.code,detail.name].filter(Boolean).join(' · ');
      if(value)setSelectedUnit(value);
    };
    window.addEventListener('tn:select-unit',select as EventListener);
    return()=>window.removeEventListener('tn:select-unit',select as EventListener);
  },[]);

  async function send(form:HTMLFormElement){
    setMessage('');
    const data=new FormData(form);
    const name=String(data.get('name')||'').trim();
    const phone=String(data.get('phone')||'').replace(/\s+/g,'').trim();
    const from=String(data.get('from')||'');
    const to=String(data.get('to')||'');
    if(name.length<2){setMessage('Vui lòng nhập họ tên đầy đủ.');return;}
    if(!/^(0|\+84)\d{9,10}$/.test(phone)){setMessage('Số điện thoại chưa đúng định dạng Việt Nam.');return;}
    if(from&&from<today){setMessage('Ngày đi/nhận phòng không thể ở trong quá khứ.');return;}
    if(isStay&&from&&to&&to<=from){setMessage('Ngày trả phòng phải sau ngày nhận phòng.');return;}

    const rawNote=String(data.get('note')||'').trim();
    const note=[selectedUnit?`Căn/phòng/cabin đã chọn: ${selectedUnit}`:'',rawNote].filter(Boolean).join('\n');
    const payload={
      kind,
      product,
      customerName:name,
      phone,
      email:String(data.get('email')||'').trim(),
      startDate:from || null,
      endDate:isStay?(to || null):null,
      adults:Number(data.get('adults')||2),
      children:Number(data.get('children')||0),
      rooms:isTour?1:Number(data.get('rooms')||1),
      note,
      source:'website'
    };

    let apiFailed=false;
    if(API_BASE){
      try{
        setState('sending');
        const response=await fetch(`${API_BASE.replace(/\/$/,'')}/api/bookings`,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify(payload)
        });
        if(!response.ok) throw new Error('Booking API error');
        const result=await response.json();
        setCode(result.code||'');
        setState('saved');
        form.reset();
        setSelectedUnit('');
        return;
      }catch(error){
        console.error(error);
        apiFailed=true;
      }
    }

    const unitLabel=isCruise?'Số cabin':isStay?'Số phòng':'';
    const text=[
      `YÊU CẦU TƯ VẤN ${kind.toUpperCase()}`,
      `Sản phẩm: ${product}`,
      selectedUnit?`Đang chọn: ${selectedUnit}`:'',
      `Khách hàng: ${payload.customerName}`,
      `Điện thoại: ${payload.phone}`,
      `Email: ${payload.email||'Không cung cấp'}`,
      `Ngày đi/nhận: ${payload.startDate||'Chưa chọn'}`,
      isStay?`Ngày trả: ${payload.endDate||'Chưa chọn'}`:'',
      `Người lớn: ${payload.adults}`,
      `Trẻ em: ${payload.children}`,
      unitLabel?`${unitLabel}: ${payload.rooms}`:'',
      `Ghi chú: ${rawNote||'Không có'}`,
    ].filter(Boolean).join('\n');
    try{navigator.clipboard?.writeText(text).catch(()=>{})}catch{}
    setState('fallback');
    setMessage(apiFailed?'Hệ thống lưu đơn chưa kết nối được. Nội dung yêu cầu đã được chuẩn bị và website sẽ chuyển sang Zalo.':'Nội dung yêu cầu đã được chuẩn bị. Website sẽ chuyển sang Zalo để gửi nhanh.');
    window.location.assign('https://zalo.me/0969973949');
  }

  return <form className="inquiry-form" onSubmit={e=>{e.preventDefault();send(e.currentTarget)}}>
    <div className="inquiry-head"><small>YÊU CẦU ĐẶT DỊCH VỤ</small><h3>{product}</h3><p>{API_BASE?'Điền thông tin, đơn sẽ được gửi trực tiếp về hệ thống quản trị.':'Hiện website đang ở chế độ demo GitHub Pages; yêu cầu sẽ chuyển qua Zalo. Khi có hosting, form này sẽ lưu thẳng vào quản trị.'}</p></div>
    {selectedUnit&&<div className="inquiry-selected"><span>Đang chọn</span><b>{selectedUnit}</b><button type="button" onClick={()=>setSelectedUnit('')}>Đổi</button></div>}
    <label>Họ và tên<input name="name" required autoComplete="name" placeholder="Nguyễn Văn A"/></label>
    <label>Số điện thoại<input name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="0969 973 949"/></label>
    <label>Email<input name="email" type="email" autoComplete="email" placeholder="email@example.com"/></label>
    <div className={isStay?'inquiry-two':'inquiry-one'}><label>{isStay?'Ngày nhận phòng':isTour?'Ngày khởi hành':'Ngày đi'}<input name="from" type="date" min={today}/></label>{isStay&&<label>Ngày trả phòng<input name="to" type="date" min={today}/></label>}</div>
    <div className="inquiry-three"><label>Người lớn<input name="adults" type="number" min="1" defaultValue="2"/></label><label>Trẻ em<input name="children" type="number" min="0" defaultValue="0"/></label>{!isTour&&<label>{isCruise?'Số cabin':'Số phòng'}<input name="rooms" type="number" min="1" defaultValue="1"/></label>}</div>
    <label>Ghi chú<textarea name="note" rows={3} placeholder={isTour?'Điểm đón, yêu cầu ăn uống, tuổi trẻ em...':isCruise?'Hạng cabin, tuổi trẻ em, yêu cầu riêng...':'Hạng phòng/căn, tuổi trẻ em, yêu cầu riêng...'}/></label>
    {message&&<p className={state==='fallback'?'inquiry-warning':'inquiry-error'}>{message}</p>}
    <button className="inquiry-submit" type="submit" disabled={state==='sending'||state==='saved'}>{state==='sending'?'Đang gửi...':state==='saved'?`Đã gửi · ${code}`:state==='fallback'?'Chuyển sang Zalo':'Gửi yêu cầu đặt dịch vụ'}</button>
    {state==='saved'&&<p className="inquiry-success">✓ Đơn đã được ghi nhận. Mã yêu cầu: <b>{code}</b>. Nhân viên sẽ liên hệ lại.</p>}
    <a className="inquiry-call" href="tel:0969973949">☎ Gọi 0969 973 949</a>
  </form>
}
