'use client';

import {useCallback,useEffect,useState} from 'react';

type Affiliate={id:string;name:string;email:string;phone:string;zalo:string;referralCode:string;status:string;createdAt:string;salesOwnerId?:string;salesOwnerName?:string};
type Payload={approvalAccess?:boolean;affiliates:Affiliate[]};
const date=(v:string)=>v?new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short'}).format(new Date(v)):'—';

export function AdminAffiliateApplications(){
 const[items,setItems]=useState<Affiliate[]>([]),[canApprove,setCanApprove]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const load=useCallback(async()=>{
  try{
   const r=await fetch('/api/admin/affiliates',{cache:'no-store'});
   const d=(await r.json().catch(()=>({}))) as Partial<Payload>&{error?:string};
   if(!r.ok){setMessage(d.error||'Không đọc được hồ sơ CTV.');return}
   const allowed=Boolean(d.approvalAccess);setCanApprove(allowed);setItems(allowed?(d.affiliates||[]).filter(a=>a.status==='pending'):[]);setMessage('');
  }catch{setMessage('Không kết nối được hàng chờ duyệt CTV.')}
 },[]);
 useEffect(()=>{void load();const refresh=()=>void load();window.addEventListener('happygo-network-updated',refresh);return()=>window.removeEventListener('happygo-network-updated',refresh)},[load]);
 async function resolve(a:Affiliate,status:'active'|'blocked'){
  if(!canApprove)return setMessage('Chỉ Admin/Owner được duyệt trạng thái CTV.');
  if(status==='blocked'&&!window.confirm(`Khóa hồ sơ CTV của ${a.name}?`))return;
  setBusy(true);setMessage('');
  try{
   const r=await fetch('/api/admin/affiliates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'update',id:a.id,status})});
   const d=await r.json().catch(()=>({}));
   if(!r.ok){setMessage(d.error||'Không thể cập nhật hồ sơ CTV.');return}
   setMessage(status==='active'?`Đã kích hoạt CTV ${a.name}.`:`Đã khóa hồ sơ ${a.name}.`);
   await load();
   window.dispatchEvent(new Event('happygo-network-updated'));
  }catch{setMessage('Không kết nối được API duyệt CTV.')}finally{setBusy(false)}
 }
 if(!canApprove)return null;
 if(!items.length&&!message)return null;
 return <section className="admin-panel affiliate-application-queue">
  <div className="admin-panel-head"><div><small>CTV · HỒ SƠ ĐĂNG KÝ MỚI</small><h2>CTV chờ duyệt</h2><p>Chỉ Admin/Owner được kích hoạt hoặc khóa hồ sơ; Sale phụ trách tiếp tục chăm sóc sau khi được duyệt.</p></div><span className="affiliate-application-count">{items.length} chờ duyệt</span></div>
  {message&&<p className="admin-api-note">{message}</p>}
  <div className="affiliate-application-grid">{items.map(a=><article key={a.id}>
   <div><small>{date(a.createdAt)} · {a.referralCode}</small><h3>{a.name}</h3><p>{a.email}</p><span>{a.phone||'Chưa có SĐT'}{a.zalo?` · Zalo ${a.zalo}`:''}</span><span>Sale phụ trách: <b>{a.salesOwnerName||'Chưa phân công'}</b></span></div>
   <div className="affiliate-application-actions"><button type="button" onClick={()=>void resolve(a,'blocked')} disabled={busy}>Khóa hồ sơ</button><button type="button" className="approve" onClick={()=>void resolve(a,'active')} disabled={busy}>✓ Kích hoạt</button></div>
  </article>)}</div>
 </section>;
}
