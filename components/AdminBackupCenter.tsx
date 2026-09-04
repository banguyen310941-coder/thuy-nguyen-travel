'use client';

import {useEffect,useState} from 'react';

type Meta={createdAt:string;source:string;summary:{sections:number;records:number}};
type Activity={id:string;at:string;fileName:string;records:number};
const ACTIVITY_KEY='happygo_backup_activity_v2';
function time(value?:string){if(!value)return'—';const parsed=new Date(value);return Number.isNaN(+parsed)?value:parsed.toLocaleString('vi-VN')}
function readActivity():Activity[]{try{const value=JSON.parse(localStorage.getItem(ACTIVITY_KEY)||'[]');return Array.isArray(value)?value:[]}catch{return[]}}
function saveActivity(entry:Activity){const next=[entry,...readActivity()].slice(0,20);localStorage.setItem(ACTIVITY_KEY,JSON.stringify(next));return next}
async function message(response:Response){const data=await response.json().catch(()=>({})) as {error?:string};return data.error||`HTTP ${response.status}`}

export function AdminBackupCenter(){
 const[meta,setMeta]=useState<Meta|null>(null),[activity,setActivity]=useState<Activity[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 async function load(){setLoading(true);setActivity(readActivity());try{const response=await fetch('/api/admin/backup?meta=1',{cache:'no-store'});if(!response.ok)throw new Error(await message(response));const data=await response.json() as Meta&{ok?:boolean};setMeta({createdAt:data.createdAt,source:data.source,summary:data.summary})}catch(error){setNotice(error instanceof Error?error.message:'Không đọc được trạng thái sao lưu production.')}finally{setLoading(false)}}
 useEffect(()=>{void load()},[]);
 async function exportNow(){setBusy(true);setNotice('');try{const response=await fetch('/api/admin/backup',{cache:'no-store'});if(!response.ok)throw new Error(await message(response));const blob=await response.blob(),header=response.headers.get('content-disposition')||'',match=header.match(/filename="?([^";]+)"?/i),fileName=match?.[1]||`happygo-production-backup_${Date.now()}.json`,url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=fileName;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);const records=meta?.summary.records||0;setActivity(saveActivity({id:`backup_${Date.now()}`,at:new Date().toISOString(),fileName,records}));setNotice(`Đã tạo bản sao lưu production gồm ${records} bản ghi. File không chứa mật khẩu hoặc khóa phiên đăng nhập.`);await load()}catch(error){setNotice(error instanceof Error?error.message:'Không thể tạo file sao lưu production.')}finally{setBusy(false)}}
 return <section className="admin-panel backup-center">
  <div className="admin-panel-head"><div><small>OWNER ONLY · PRODUCTION BACKUP</small><h2>Sao lưu dữ liệu HappyGo</h2><p>File được tạo trực tiếp từ Neon production và trạng thái dùng chung trên server, không còn quét localStorage của máy đang mở.</p></div><span className="backup-security">Không xuất password hash, mật khẩu hoặc session</span></div>
  {notice&&<p className="admin-api-note backup-message">{notice}</p>}
  <div className="service-kpis"><article><small>NGUỒN</small><b>Production</b></article><article><small>NHÓM DỮ LIỆU</small><b>{loading?'…':meta?.summary.sections??0}</b></article><article><small>BẢN GHI</small><b>{loading?'…':meta?.summary.records??0}</b></article><article><small>KIỂM TRA GẦN NHẤT</small><b>{meta?new Date(meta.createdAt).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}):'—'}</b></article></div>
  <div className="backup-actions"><article><div><span>1</span><div><b>Xuất bản sao lưu production</b><p>Bao gồm CRM, booking, đối tác, sản phẩm, tài chính và các snapshot dùng chung hiện hành trên server.</p></div></div><button className="admin-primary" disabled={busy||loading||!meta} onClick={()=>void exportNow()}>{busy?'Đang tạo file…':'Tải backup production'}</button></article><article><div><span>2</span><div><b>Khôi phục production</b><p>Không cho phép ghi đè toàn hệ thống trực tiếp từ trình duyệt. Việc khôi phục phải qua quy trình kiểm tra và xác nhận riêng để tránh mất dữ liệu.</p></div></div><button disabled title="Được khóa chủ động để bảo vệ production">Đã khóa an toàn</button></article></div>
  <section className="backup-preview valid"><header><div><small>TRẠNG THÁI NGUỒN SAO LƯU</small><h3>{meta?.source||'Đang kiểm tra Neon production...'}</h3><p>{meta?`Snapshot kiểm tra lúc ${time(meta.createdAt)}`:'Đang tải...'}</p></div><strong>{meta?'✓ Server':'…'}</strong></header><div className="backup-preview-stats"><span><b>{meta?.summary.sections??0}</b> nhóm dữ liệu</span><span><b>{meta?.summary.records??0}</b> bản ghi</span><span><b>0</b> mật khẩu được xuất</span></div></section>
  <section className="backup-history"><div><small>LỊCH SỬ TẢI FILE TRÊN THIẾT BỊ NÀY</small><b>{activity.length?`${activity.length} lần gần nhất`:'Chưa tải backup production'}</b></div>{activity.slice(0,8).map(item=><article key={item.id}><span className="export">↓</span><div><b>Đã tải backup production</b><small>{item.fileName} · khoảng {item.records} bản ghi</small></div><time>{time(item.at)}</time></article>)}</section>
 </section>
}
