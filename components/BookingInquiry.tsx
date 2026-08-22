'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function BookingInquiry({product,kind='dịch vụ'}:{product:string;kind?:string}){
  const [state,setState]=useState<'idle'|'sending'|'saved'|'fallback'|'error'>('idle');
  const [code,setCode]=useState('');

  async function send(form:HTMLFormElement){
    const data=new FormData(form);
    const payload={
      kind,
      product,
      customerName:String(data.get('name')||''),
      phone:String(data.get('phone')||''),
      email:String(data.get('email')||''),
      startDate:String(data.get('from')||'') || null,
      endDate:String(data.get('to')||'') || null,
      adults:Number(data.get('adults')||2),
      children:Number(data.get('children')||0),
      rooms:Number(data.get('rooms')||1),
      note:String(data.get('note')||''),
      source:'website'
    };

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
        return;
      }catch(error){
        console.error(error);
        setState('error');
      }
    }

    const text=[
      `YÊU CẦU TƯ VẤN ${kind.toUpperCase()}`,
      `Sản phẩm: ${product}`,
      `Khách hàng: ${payload.customerName}`,
      `Điện thoại: ${payload.phone}`,
      `Ngày đi/nhận: ${payload.startDate||''}`,
      `Ngày về/trả: ${payload.endDate||''}`,
      `Người lớn: ${payload.adults}`,
      `Trẻ em: ${payload.children}`,
      `Số phòng: ${payload.rooms}`,
      `Ghi chú: ${payload.note}`,
    ].join('\n');
    try{await navigator.clipboard.writeText(text)}catch{}
    setState('fallback');
    window.open('https://zalo.me/0969973949','_blank','noopener,noreferrer');
  }

  return <form className="inquiry-form" onSubmit={e=>{e.preventDefault();send(e.currentTarget)}}>
    <div className="inquiry-head"><small>YÊU CẦU ĐẶT DỊCH VỤ</small><h3>{product}</h3><p>{API_BASE?'Điền thông tin, đơn sẽ được gửi trực tiếp về hệ thống quản trị.':'Form đã sẵn sàng kết nối hệ thống quản trị khi có hosting; hiện tại yêu cầu sẽ chuyển qua Zalo.'}</p></div>
    <label>Họ và tên<input name="name" required placeholder="Nguyễn Văn A"/></label>
    <label>Số điện thoại<input name="phone" type="tel" required placeholder="09xx xxx xxx"/></label>
    <label>Email<input name="email" type="email" placeholder="email@example.com"/></label>
    <div className="inquiry-two"><label>Ngày đi / nhận<input name="from" type="date"/></label><label>Ngày về / trả<input name="to" type="date"/></label></div>
    <div className="inquiry-three"><label>Người lớn<input name="adults" type="number" min="1" defaultValue="2"/></label><label>Trẻ em<input name="children" type="number" min="0" defaultValue="0"/></label><label>Số phòng<input name="rooms" type="number" min="1" defaultValue="1"/></label></div>
    <label>Ghi chú<textarea name="note" rows={3} placeholder="Hạng phòng, tuổi trẻ em, yêu cầu riêng..."/></label>
    <button className="inquiry-submit" type="submit" disabled={state==='sending'}>{state==='sending'?'Đang gửi...':state==='saved'?`Đã gửi · ${code}`:state==='fallback'?'Đã mở Zalo':'Gửi yêu cầu đặt dịch vụ'}</button>
    {state==='saved'&&<p className="inquiry-success">✓ Đơn đã được ghi nhận. Mã yêu cầu: <b>{code}</b>. Nhân viên sẽ liên hệ lại.</p>}
    {state==='error'&&<p className="inquiry-error">Không kết nối được hệ thống lưu đơn. Yêu cầu đã chuyển sang phương án Zalo.</p>}
    <a className="inquiry-call" href="tel:0969973949">☎ Gọi 0969 973 949</a>
  </form>
}
