'use client';

import {useCallback,useEffect,useState} from 'react';

type Affiliate={id:string;name:string;email:string;phone:string;zalo:string;referralCode:string;status:string;createdAt:string};
type Payload={affiliates:Affiliate[]};
const date=(v:string)=>v?new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short'}).format(new Date(v)):'—';

export function AdminAffiliateApplications(){
 const[items,setItems]=useState<Affiliate[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const load=useCallback(async()=>{
  try{
   const r=await fetch('/api/admin/affiliates',{cache:'no-store'});
   const d=(await r.json().catch(()=>({}))) as Partial<Payload>&{error?:string};
   if(!r.ok){setMessage(d.error||'Không đọc được hồ sơ CTV.');return}
   setItems((d.affiliates||[]).filter(a=>a.status==='pending'));
  }catch{setMessage('Không kết nối được hàng chờ duyệt CTV.')}
 },[]);
 useEffect(()=>{void load();const refresh=()=>void load();window.addEventListener('happygo-network-updated',refresh);return()=>window.removeEventListener('happygo-network-updated',refresh)},[load]);
 async function resolve(a:Affiliate,status:'active'|'blocked'){
  if(status==='blocked'&&!window.confirm(`Từ chối hồ sơ CTV của ${a.name}?`))return;
  setBusy(true);setMessage('');
  try{
   const r=await fetch('/api/admin/affiliates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'update',id:a.id,status})});
   const d=await r.json().catch(()=>({}));
   if(!r.ok){setMessage(d.error||'Không thể cập nhật hồ sơ CTV.');return}
   setMessage(status==='active'?`Đã kích hoạt CTV ${a.name}.`:`Đã từ chối hồ sơ ${a.name}.`);
   await load();
   window.dispatchEvent(new Event('happygo-network-updated'));
  }catch{setMessage('Không kết nối được API duyệt CTV.')}finally{setBusy(false)}
 }
 if(!items.length&&!message)return null;
 return <section className="admin-panel affiliate-application-queue">
  <div className="admin-panel-head"><div><small>CTV · HỒ SƠ ĐĂNG KÝ MỚI</small><h2>Chờ duyệt cộng tác viên</h2><p>Hồ sơ chỉ đăng nhập được sau khi Admin kích hoạt.</p></div><span className="affiliate-application-count">{items.length} đang chờ</span></div>
  {message&&<p className="admin-api-note">{message}</p>}
  <div className="affiliate-application-grid">{items.map(a=><article key={a.id}>
   <div><small>{date(a.createdAt)} · {a.referralCode}</small><h3>{a.name}</h3><p>{a.email}</p><span>{a.phone||'Chưa có SĐT'}{a.zalo?` · Zalo ${a.zalo}`:''}</span></div>
   <div className="affiliate-application-actions"><button type="button" onClick={()=>void resolve(a,'blocked')} disabled={busy}>Từ chối</button><button type="button" className="approve" onClick={()=>void resolve(a,'active')} disabled={busy}>✓ Duyệt & kích hoạt</button></div>
  </article>)}</div>
 </section>;
}
