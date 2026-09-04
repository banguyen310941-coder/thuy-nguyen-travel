'use client';

import {useEffect,useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';

type Villa={id:string;slug:string;name:string;place:string;cover:string;publicPrice:number;affiliateLink:string};
type Referral={id:string;bookingCode:string;bookingStatus:string;villaName:string;customerPhone:string;commissionAmount:number;status:string;createdAt:string;creditedAt:string};
type Payout={id:string;amount:number;status:string;payoutDate:string;receiptUrl:string;createdAt:string};
type Affiliate={name:string;email:string;referralCode:string;phone:string;zalo:string;balance:number;totalCommission:number;commissionRate:number;status:string;bankAccount:string;bankName:string;accountHolder:string};
type Dashboard={affiliate:Affiliate;stats:{clicks:number;closedOrders:number};villas:Villa[];referrals:Referral[];payouts:Payout[]};
type ProfileForm={phone:string;zalo:string;bankAccount:string;bankName:string;accountHolder:string};

const money=(v:number)=>new Intl.NumberFormat('vi-VN').format(Math.round(v))+'đ';
const date=(v:string)=>v?new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short'}).format(new Date(v)):'—';
const statusLabel=(v:string)=>({pending:'Chờ xử lý',approved:'Đã duyệt',paid:'Đã thanh toán',cancelled:'Đã hủy',new:'Mới',contacting:'Đang tư vấn',confirmed:'Đã xác nhận',completed:'Hoàn tất'} as Record<string,string>)[v]||v;
const profileOf=(a:Affiliate):ProfileForm=>({phone:a.phone||'',zalo:a.zalo||'',bankAccount:a.bankAccount||'',bankName:a.bankName||'',accountHolder:a.accountHolder||''});

export function AffiliateDashboard(){
 const router=useRouter();
 const[data,setData]=useState<Dashboard|null>(null),[msg,setMsg]=useState(''),[q,setQ]=useState(''),[busy,setBusy]=useState(true),[copied,setCopied]=useState(''),[editingProfile,setEditingProfile]=useState(false),[profile,setProfile]=useState<ProfileForm>({phone:'',zalo:'',bankAccount:'',bankName:'',accountHolder:''}),[payoutAmount,setPayoutAmount]=useState('');

 async function load(){
  setBusy(true);
  try{
   const r=await fetch('/api/affiliate/dashboard',{cache:'no-store'});
   if(r.status===401){router.replace('/affiliate');return}
   const d=await r.json().catch(()=>({}));
   if(!r.ok){setMsg(d.error||'Không tải được dashboard.');return}
   setData(d);
   setProfile(profileOf(d.affiliate));
  }catch{setMsg('Không kết nối được dashboard CTV.')}finally{setBusy(false)}
 }
 useEffect(()=>{void load()},[]);

 async function logout(){await fetch('/api/affiliate/auth/logout',{method:'POST'}).catch(()=>{});router.replace('/affiliate');router.refresh()}
 async function copy(v:Villa){try{await navigator.clipboard.writeText(v.affiliateLink);setCopied(v.id);setTimeout(()=>setCopied(''),1800)}catch{setMsg('Không thể copy link trên trình duyệt này.')}}
 async function action(payload:Record<string,unknown>,success:string){
  setBusy(true);setMsg('');
  try{
   const r=await fetch('/api/affiliate/dashboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   if(r.status===401){router.replace('/affiliate');return false}
   const d=await r.json().catch(()=>({}));
   if(!r.ok){setMsg(d.error||'Không thể cập nhật tài khoản CTV.');return false}
   setMsg(success);
   await load();
   return true;
  }catch{setMsg('Không kết nối được API CTV.');return false}finally{setBusy(false)}
 }
 async function saveProfile(){if(await action({action:'update_profile',...profile},'Đã cập nhật thông tin nhận hoa hồng.'))setEditingProfile(false)}
 async function requestPayout(){
  const amount=Math.round(Number(payoutAmount)||0);
  if(amount<=0){setMsg('Vui lòng nhập số tiền muốn rút.');return}
  if(await action({action:'request_payout',amount},'Đã gửi yêu cầu rút hoa hồng. HappyGo sẽ đối soát và thanh toán.'))setPayoutAmount('');
 }

 const villas=useMemo(()=>{const n=q.trim().toLowerCase();return(data?.villas||[]).filter(v=>!n||`${v.name} ${v.place}`.toLowerCase().includes(n))},[data,q]);
 if(busy&&!data)return <main className="affiliate-shell"><div className="affiliate-loading">Đang tải Dashboard CTV...</div></main>;
 if(!data)return <main className="affiliate-shell"><div className="affiliate-loading">{msg||'Không có dữ liệu CTV.'}</div></main>;

 const a=data.affiliate;
 const pendingPayout=data.payouts.find(p=>p.status==='pending');
 const hasBank=Boolean(a.bankName&&a.bankAccount&&a.accountHolder);

 return <main className="affiliate-shell">
  <header className="affiliate-topbar">
   <div><div className="affiliate-logo small">HG</div><div><small>HAPPYGO TRAVEL · CTV</small><b>{a.name}</b><span>Mã giới thiệu: {a.referralCode}</span></div></div>
   <button onClick={()=>void logout()}>Đăng xuất</button>
  </header>
  <div className="affiliate-content">
   {msg&&<p className="affiliate-message">{msg}</p>}
   <section className="affiliate-welcome">
    <div><small>DASHBOARD CỘNG TÁC VIÊN</small><h1>Hoa hồng rõ ràng, link chia sẻ sẵn sàng</h1><p>Hoa hồng được ghi nhận khi booking hoàn tất. Tỷ lệ hiện tại: <b>{a.commissionRate}%</b>.</p></div>
    <div className="affiliate-security-note">🔒 Dashboard không truy vấn hoặc hiển thị tên/SĐT chủ nhà, địa chỉ cụ thể hay giá net.</div>
   </section>

   <section className="affiliate-kpis">
    <article><small>SỐ DƯ VÍ</small><strong>{money(a.balance)}</strong><span>Có thể gửi yêu cầu rút hoa hồng</span></article>
    <article><small>TỔNG HOA HỒNG</small><strong>{money(a.totalCommission)}</strong><span>Đã ghi nhận từ booking hoàn tất</span></article>
    <article><small>LƯỢT CLICK</small><strong>{data.stats.clicks}</strong><span>Click hợp lệ theo ngày</span></article>
    <article><small>ĐƠN CHỐT THÀNH CÔNG</small><strong>{data.stats.closedOrders}</strong><span>Đã duyệt / đã thanh toán</span></article>
   </section>

   <section className="affiliate-panel">
    <div className="affiliate-panel-head"><div><small>LINK AFFILIATE</small><h2>Chọn villa để copy link</h2><p>Link tự gắn mã CTV và villa. Khách đặt sau khi truy cập link sẽ được ghi nhận referral.</p></div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm tên villa / khu vực"/></div>
    <div className="affiliate-villa-grid">
     {villas.map(v=><article key={v.id}><div className="affiliate-villa-cover">{v.cover?<img src={v.cover} alt={v.name}/>:<span>🏡</span>}</div><div className="affiliate-villa-body"><small>{v.place||'Villa & Resort'}</small><h3>{v.name}</h3><p>Giá công khai từ <b>{v.publicPrice?money(v.publicPrice):'Liên hệ'}</b></p><div className="affiliate-link-box"><input readOnly value={v.affiliateLink}/><button onClick={()=>void copy(v)}>{copied===v.id?'✓ Đã copy':'Copy link'}</button></div></div></article>)}
     {!villas.length&&<div className="affiliate-empty">Chưa có villa phù hợp.</div>}
    </div>
   </section>

   <section className="affiliate-panel">
    <div className="affiliate-panel-head"><div><small>LỊCH SỬ ĐƠN HÀNG</small><h2>Booking & trạng thái duyệt tiền</h2></div></div>
    <div className="affiliate-table-wrap"><table className="affiliate-table"><thead><tr><th>Booking</th><th>Villa</th><th>Khách</th><th>Trạng thái booking</th><th>Hoa hồng</th><th>Duyệt tiền</th><th>Ngày</th></tr></thead><tbody>{data.referrals.map(r=><tr key={r.id}><td><b>{r.bookingCode}</b></td><td>{r.villaName}</td><td>{r.customerPhone||'—'}</td><td><span className={`affiliate-status ${r.bookingStatus}`}>{statusLabel(r.bookingStatus)}</span></td><td><b>{money(r.commissionAmount)}</b></td><td><span className={`affiliate-status ${r.status}`}>{statusLabel(r.status)}</span></td><td>{date(r.createdAt)}</td></tr>)}{!data.referrals.length&&<tr><td colSpan={7}>Chưa có booking affiliate.</td></tr>}</tbody></table></div>
   </section>

   <section className="affiliate-two">
    <section className="affiliate-panel">
     <div className="affiliate-panel-head"><div><small>THANH TOÁN</small><h2>Lịch sử & yêu cầu rút hoa hồng</h2><p>Yêu cầu mới sẽ ở trạng thái chờ cho đến khi HappyGo đối soát.</p></div></div>
     <div className="affiliate-payout-request">
      {pendingPayout?<div className="affiliate-pending-note"><b>Đang chờ xử lý: {money(pendingPayout.amount)}</b><span>Gửi lúc {date(pendingPayout.createdAt)}. Bạn có thể tạo yêu cầu mới sau khi yêu cầu này được xử lý.</span></div>:<>
       <label>Số tiền muốn rút<input type="number" min="1" step="1000" max={Math.max(a.balance,0)} value={payoutAmount} onChange={e=>setPayoutAmount(e.target.value)} placeholder={a.balance>0?String(Math.round(a.balance)):'0'}/></label>
       <div className="affiliate-payout-actions"><button type="button" onClick={()=>setPayoutAmount(String(Math.round(a.balance)))} disabled={a.balance<=0}>Rút toàn bộ</button><button type="button" className="primary" onClick={()=>void requestPayout()} disabled={busy||a.balance<=0||!hasBank}>Gửi yêu cầu rút</button></div>
       {!hasBank&&<span className="affiliate-form-hint">Cập nhật đủ thông tin ngân hàng trước khi gửi yêu cầu rút.</span>}
      </>}
     </div>
     <div className="affiliate-table-wrap"><table className="affiliate-table"><thead><tr><th>Ngày</th><th>Số tiền</th><th>Trạng thái</th><th>Biên nhận</th></tr></thead><tbody>{data.payouts.map(p=><tr key={p.id}><td>{date(p.payoutDate||p.createdAt)}</td><td><b>{money(p.amount)}</b></td><td><span className={`affiliate-status ${p.status}`}>{statusLabel(p.status)}</span></td><td>{p.receiptUrl?<a href={p.receiptUrl} target="_blank" rel="noreferrer">Xem biên nhận</a>:'—'}</td></tr>)}{!data.payouts.length&&<tr><td colSpan={4}>Chưa có yêu cầu hoặc đợt thanh toán.</td></tr>}</tbody></table></div>
    </section>

    <aside className="affiliate-bank-card">
     <small>TÀI KHOẢN NHẬN HOA HỒNG</small>
     {!editingProfile?<>
      <h3>{a.accountHolder||'Chưa cập nhật'}</h3><p>{a.bankName||'Chưa có ngân hàng'}</p><strong>{a.bankAccount||'—'}</strong><span>SĐT: {a.phone||'—'} · Zalo: {a.zalo||'—'}</span>
      <button type="button" onClick={()=>{setProfile(profileOf(a));setEditingProfile(true)}}>Cập nhật thông tin</button>
     </>:<div className="affiliate-profile-form">
      <label>Ngân hàng<input value={profile.bankName} onChange={e=>setProfile({...profile,bankName:e.target.value})} placeholder="VD: Vietcombank"/></label>
      <label>Số tài khoản<input value={profile.bankAccount} onChange={e=>setProfile({...profile,bankAccount:e.target.value})} inputMode="numeric"/></label>
      <label>Chủ tài khoản<input value={profile.accountHolder} onChange={e=>setProfile({...profile,accountHolder:e.target.value.toUpperCase()})}/></label>
      <label>Số điện thoại<input value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} inputMode="tel"/></label>
      <label>Zalo<input value={profile.zalo} onChange={e=>setProfile({...profile,zalo:e.target.value})}/></label>
      <div className="affiliate-bank-actions"><button type="button" onClick={()=>{setProfile(profileOf(a));setEditingProfile(false)}} disabled={busy}>Hủy</button><button type="button" className="save" onClick={()=>void saveProfile()} disabled={busy}>Lưu thông tin</button></div>
     </div>}
    </aside>
   </section>
  </div>
 </main>;
}
