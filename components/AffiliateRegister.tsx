'use client';

import Link from 'next/link';
import {FormEvent,useState} from 'react';

export function AffiliateRegister(){
 const[name,setName]=useState(''),[email,setEmail]=useState(''),[phone,setPhone]=useState(''),[zalo,setZalo]=useState(''),[password,setPassword]=useState(''),[accepted,setAccepted]=useState(false),[busy,setBusy]=useState(false),[msg,setMsg]=useState(''),[done,setDone]=useState(false);
 async function submit(e:FormEvent){
  e.preventDefault();setBusy(true);setMsg('');
  try{
   const r=await fetch('/api/affiliate/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,phone,zalo,password,acceptedPolicy:accepted})});
   const d=await r.json().catch(()=>({}));
   if(!r.ok){setMsg(d.error||'Không thể gửi đăng ký CTV.');return}
   setDone(true);setMsg(d.message||'Đăng ký thành công. Tài khoản đang chờ duyệt.');
  }catch{setMsg('Không kết nối được hệ thống CTV.')}finally{setBusy(false)}
 }
 return <main className="affiliate-register-shell">
  <section className="affiliate-register-intro">
   <div className="affiliate-logo">HG</div>
   <small>HAPPYGO TRAVEL · ĐĂNG KÝ CTV</small>
   <h1>Đăng ký một lần, chia sẻ sản phẩm trên toàn hệ thống</h1>
   <p>Sau khi HappyGo duyệt, bạn sẽ có mã giới thiệu riêng, dashboard theo dõi click, booking, hoa hồng và yêu cầu rút tiền.</p>
   <div className="affiliate-register-benefits"><span>✓ Không cần nhập giá net hoặc dữ liệu nhà cung cấp</span><span>✓ Hoa hồng ghi nhận khi booking hoàn tất</span><span>✓ Link giới thiệu có thời gian ghi nhận 30 ngày</span></div>
  </section>
  <form className="affiliate-register-card" onSubmit={submit}>
   <small>HỒ SƠ CỘNG TÁC VIÊN</small><h2>{done?'Đăng ký đã được ghi nhận':'Tạo hồ sơ CTV'}</h2>
   {done?<div className="affiliate-register-success"><b>✓ Hồ sơ đang chờ HappyGo duyệt</b><p>Bạn chưa thể đăng nhập cho đến khi tài khoản được kích hoạt. Sau khi duyệt, dùng chính email và mật khẩu đã đăng ký để vào Dashboard CTV.</p><Link href="/affiliate">Về trang đăng nhập</Link></div>:<>
    <label>Họ và tên<input required minLength={2} value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/></label>
    <label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label>
    <div className="affiliate-register-row"><label>Số điện thoại<input required value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" autoComplete="tel"/></label><label>Zalo<input value={zalo} onChange={e=>setZalo(e.target.value)} inputMode="tel"/></label></div>
    <label>Mật khẩu<input required type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/><span>Tối thiểu 8 ký tự.</span></label>
    <label className="affiliate-register-policy"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span>Tôi đồng ý chính sách CTV: hoa hồng chỉ được ghi nhận cho booking hợp lệ và hoàn tất; booking hủy/không hoàn tất không phát sinh hoa hồng.</span></label>
    {msg&&<p className="affiliate-message">{msg}</p>}
    <button disabled={busy||!accepted}>{busy?'Đang gửi hồ sơ...':'Gửi đăng ký CTV'}</button>
    <Link href="/affiliate">Đã có tài khoản? Đăng nhập</Link>
   </>}
   {done&&msg&&<p className="affiliate-message success">{msg}</p>}
  </form>
 </main>;
}
