'use client';

import { useEffect, useMemo, useState } from 'react';
import {formatPhone,useSiteSettings} from '@/components/useSiteSettings';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function normalizeVietnamPhone(raw:string){const digits=raw.replace(/\D/g,'');if(digits.startsWith('84')&&digits.length===11)return `0${digits.slice(2)}`;return digits}

export function BookingInquiry({product,kind='dịch vụ'}:{product:string;kind?:string}){
  const [state,setState]=useState<'idle'|'sending'|'saved'|'fallback'>('idle');
  const [code,setCode]=useState('');
  const [message,setMessage]=useState('');
  const [selectedUnit,setSelectedUnit]=useState('');
  const settings=useSiteSettings();
  const phoneDigits=settings.hotline.replace(/\D/g,'');
  const phoneLabel=formatPhone(settings.hotline);
  const zaloDigits=settings.zalo.replace(/\D/g,'')||phoneDigits;
  const normalized=kind.toLowerCase();
  const isTour=normalized.includes('tour');
  const isCruise=normalized.includes('du thuyền')||normalized.includes('cruise');
  const isStay=!isTour&&!isCruise;
  const today=useMemo(()=>{const d=new Date();const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`},[]);

  useEffect(()=>{
    const select=(event:Event)=>{const detail=(event as CustomEvent<{code?:string;name?:string}>).detail||{};const value=[detail.code,detail.name].filter(Boolean).join(' · ');if(value)setSelectedUnit(value)};
    window.addEventListener('tn:select-unit',select as EventListener);
    try{const stored=JSON.parse(localStorage.getItem('tn_selected_unit')||'null');if(stored?.product===product){const value=[stored.code,stored.unit].filter(Boolean).join(' · ');if(value)setSelectedUnit(value);localStorage.removeItem('tn_selected_unit')}}catch{}
    return()=>window.removeEventListener('tn:select-unit',select as EventListener)
  },[product]);

  const clearUnit=()=>{setSelectedUnit('');try{localStorage.removeItem('tn_selected_unit')}catch{}};

  async function send(form:HTMLFormElement){
    setMessage('');setState('idle');
    const data=new FormData(form);const name=String(data.get('name')||'').trim();const phone=normalizeVietnamPhone(String(data.get('phone')||''));const from=String(data.get('from')||'');const to=String(data.get('to')||'');
    if(name.length<2){setMessage('Vui lòng nhập họ tên đầy đủ.');return}if(!/^0\d{9}$/.test(phone)){setMessage('Số điện thoại chưa đúng. Có thể nhập 0969 973 949, 0969.973.949 hoặc +84 969 973 949.');return}if(!from){setMessage(isStay?'Vui lòng chọn ngày nhận phòng.':isTour?'Vui lòng chọn ngày khởi hành.':'Vui lòng chọn ngày đi.');return}if(from<today){setMessage('Ngày đi/nhận phòng không thể ở trong quá khứ.');return}if(isStay&&!to){setMessage('Vui lòng chọn ngày trả phòng.');return}if(isStay&&to<=from){setMessage('Ngày trả phòng phải sau ngày nhận phòng.');return}
    const rawNote=String(data.get('note')||'').trim();const note=[selectedUnit?`Căn/phòng/cabin đã chọn: ${selectedUnit}`:'',rawNote].filter(Boolean).join('\n');
    const payload={kind,product,customerName:name,phone,email:String(data.get('email')||'').trim(),startDate:from,endDate:isStay?to:null,adults:Number(data.get('adults')||2),children:Number(data.get('children')||0),rooms:isTour?1:Number(data.get('rooms')||1),note,source:'website'};
    let apiFailed=false;
    if(API_BASE){try{setState('sending');const response=await fetch(`${API_BASE.replace(/\/$/,'')}/api/bookings`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!response.ok)throw new Error('Booking API error');const result=await response.json();setCode(result.code||'');setState('saved');form.reset();clearUnit();return}catch(error){console.error(error);apiFailed=true}}
    const unitLabel=isCruise?'Số cabin':isStay?'Số phòng':'';
    const text=[`YÊU CẦU TƯ VẤN ${kind.toUpperCase()}`,`Sản phẩm: ${product}`,selectedUnit?`Đang chọn: ${selectedUnit}`:'',`Khách hàng: ${payload.customerName}`,`Điện thoại: ${payload.phone}`,`Email: ${payload.email||'Không cung cấp'}`,`Ngày đi/nhận: ${payload.startDate}`,isStay?`Ngày trả: ${payload.endDate}`:'',`Người lớn: ${payload.adults}`,`Trẻ em: ${payload.children}`,unitLabel?`${unitLabel}: ${payload.rooms}`:'',`Ghi chú: ${rawNote||'Không có'}`].filter(Boolean).join('\n');
    try{navigator.clipboard?.writeText(text).catch(()=>{})}catch{}
    setState('fallback');setMessage(apiFailed?'Hệ thống lưu đơn chưa kết nối được. Nội dung yêu cầu đã được chuẩn bị và website sẽ chuyển sang Zalo.':'Nội dung yêu cầu đã được chuẩn bị. Website sẽ chuyển sang Zalo để gửi nhanh.');window.location.assign(`https://zalo.me/${zaloDigits}`);
  }

  return <form className="inquiry-form" onSubmit={e=>{e.preventDefault();send(e.currentTarget)}}><div className="inquiry-head"><small>YÊU CẦU ĐẶT DỊCH VỤ</small><h3>{product}</h3><p>{API_BASE?'Điền thông tin, đơn sẽ được gửi trực tiếp về hệ thống quản trị.':'Hiện website đang ở chế độ demo GitHub Pages; yêu cầu sẽ chuyển qua Zalo. Khi có hosting, form này sẽ lưu thẳng vào quản trị.'}</p></div>{selectedUnit&&<div className="inquiry-selected"><span>Đang chọn</span><b>{selectedUnit}</b><button type="button" onClick={clearUnit}>Đổi</button></div>}<label>Họ và tên<input name="name" required autoComplete="name" placeholder="Nguyễn Văn A"/></label><label>Số điện thoại<input name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder={phoneLabel}/></label><label>Email<input name="email" type="email" autoComplete="email" placeholder="email@example.com"/></label><div className={isStay?'inquiry-two':'inquiry-one'}><label>{isStay?'Ngày nhận phòng':isTour?'Ngày khởi hành':'Ngày đi'}<input name="from" type="date" min={today} required/></label>{isStay&&<label>Ngày trả phòng<input name="to" type="date" min={today} required/></label>}</div><div className="inquiry-three"><label>Người lớn<input name="adults" type="number" min="1" max="50" defaultValue="2"/></label><label>Trẻ em<input name="children" type="number" min="0" max="50" defaultValue="0"/></label>{!isTour&&<label>{isCruise?'Số cabin':'Số phòng'}<input name="rooms" type="number" min="1" max="20" defaultValue="1"/></label>}</div><label>Ghi chú<textarea name="note" rows={3} placeholder={isTour?'Điểm đón, yêu cầu ăn uống, tuổi trẻ em...':isCruise?'Hạng cabin, tuổi trẻ em, yêu cầu riêng...':'Hạng phòng/căn, tuổi trẻ em, yêu cầu riêng...'}/></label>{message&&<p className={state==='fallback'?'inquiry-warning':'inquiry-error'}>{message}</p>}<button className="inquiry-submit" type="submit" disabled={state==='sending'||state==='saved'}>{state==='sending'?'Đang gửi...':state==='saved'?`Đã gửi · ${code}`:state==='fallback'?'Chuyển sang Zalo':'Gửi yêu cầu đặt dịch vụ'}</button>{state==='saved'&&<p className="inquiry-success">✓ Đơn đã được ghi nhận. Mã yêu cầu: <b>{code}</b>. Nhân viên sẽ liên hệ lại.</p>}<a className="inquiry-call" href={`tel:${phoneDigits}`}>☎ Gọi {phoneLabel}</a></form>;
}
