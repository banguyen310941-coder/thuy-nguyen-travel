'use client';

import { useState } from 'react';

export function BookingInquiry({product,kind='dịch vụ'}:{product:string;kind?:string}){
  const [copied,setCopied]=useState(false);
  async function send(form:HTMLFormElement){
    const data=new FormData(form);
    const text=[
      `YÊU CẦU TƯ VẤN ${kind.toUpperCase()}`,
      `Sản phẩm: ${product}`,
      `Khách hàng: ${data.get('name')||''}`,
      `Điện thoại: ${data.get('phone')||''}`,
      `Ngày đi/nhận: ${data.get('from')||''}`,
      `Ngày về/trả: ${data.get('to')||''}`,
      `Số khách: ${data.get('guests')||''}`,
      `Ghi chú: ${data.get('note')||''}`,
    ].join('\n');
    try{await navigator.clipboard.writeText(text);setCopied(true)}catch{}
    window.open('https://zalo.me/0969973949','_blank','noopener,noreferrer');
  }
  return <form className="inquiry-form" onSubmit={e=>{e.preventDefault();send(e.currentTarget)}}>
    <div className="inquiry-head"><small>YÊU CẦU TƯ VẤN</small><h3>{product}</h3><p>Điền thông tin, hệ thống sẽ sao chép nội dung yêu cầu và mở Zalo Thúy Nguyên Travel.</p></div>
    <label>Họ và tên<input name="name" required placeholder="Nguyễn Văn A"/></label>
    <label>Số điện thoại<input name="phone" type="tel" required placeholder="09xx xxx xxx"/></label>
    <div className="inquiry-two"><label>Ngày đi / nhận<input name="from" type="date"/></label><label>Ngày về / trả<input name="to" type="date"/></label></div>
    <label>Số khách<select name="guests" defaultValue="2"><option value="1">1 khách</option><option value="2">2 khách</option><option value="3">3 khách</option><option value="4">4 khách</option><option value="6">5–6 khách</option><option value="10+">10+ khách</option></select></label>
    <label>Ghi chú<textarea name="note" rows={3} placeholder="Hạng phòng, trẻ em, yêu cầu riêng..."/></label>
    <button className="inquiry-submit" type="submit">{copied?'Đã sao chép · Mở Zalo':'Gửi yêu cầu qua Zalo'}</button>
    <a className="inquiry-call" href="tel:0969973949">☎ Gọi 0969 973 949</a>
  </form>
}
