'use client';

import {useCallback,useEffect,useMemo,useState} from 'react';

type State='ok'|'warning'|'optional';
type Module={id:string;label:string;state:State;detail:string;count:number|null};
type Health={ok:boolean;database:boolean;serverTime?:string;modules:Module[]};

export function AdminConnectivityPanel(){
 const[data,setData]=useState<Health>({ok:false,database:false,modules:[]}),[loading,setLoading]=useState(true),[message,setMessage]=useState('');
 const load=useCallback(async()=>{setLoading(true);setMessage('');try{const response=await fetch('/api/admin/system-health',{cache:'no-store'});const json=await response.json().catch(()=>({}));if(!response.ok)throw new Error(response.status===401?'Phiên quản trị đã hết hạn.':json.error||'Không kiểm tra được production.');setData(json)}catch(error){setMessage(error instanceof Error?error.message:'Không kiểm tra được production.')}finally{setLoading(false)}},[]);
 useEffect(()=>{void load();const timer=window.setInterval(()=>void load(),60000);return()=>window.clearInterval(timer)},[load]);
 const core=useMemo(()=>data.modules.filter(item=>item.state!=='optional'),[data.modules]);const green=core.filter(item=>item.state==='ok').length;const warnings=core.filter(item=>item.state==='warning').length;
 return <section className="admin-panel admin-connectivity-panel"><div className="admin-panel-head"><div><small>PRODUCTION HEALTH</small><h2>Kiểm tra kết nối toàn hệ thống</h2><p>Trạng thái lấy trực tiếp từ Vercel và Neon; không còn đánh giá dựa vào localStorage của máy đang mở.</p></div><button type="button" onClick={()=>void load()} disabled={loading}>↻ {loading?'Đang kiểm tra':'Kiểm tra lại'}</button></div>{message&&<p className="admin-api-note">{message}</p>}<div className="admin-connect-summary"><span><b>{green}/{core.length}</b> kết nối lõi đang xanh</span><span className={warnings?'bad':'good'}>{warnings?`${warnings} mục cần cấu hình`:'Toàn bộ kết nối lõi hoạt động'}</span>{data.serverTime&&<small>Máy chủ: {new Date(data.serverTime).toLocaleString('vi-VN')}</small>}</div><div className="admin-connect-grid">{data.modules.map(row=><article key={row.id} className={`admin-connect-item ${row.state==='ok'?'ok':row.state==='optional'?'empty':'invalid'}`}><div><b>{row.label}</b><small>{row.detail}</small></div><strong>{row.state==='ok'?'✓':row.state==='optional'?'○':'!'}</strong><span>{row.state==='ok'?'Đã kết nối':row.state==='optional'?'Tùy chọn':'Cần cấu hình'}{row.count!==null?` · ${row.count}`:''}</span></article>)}</div>{!loading&&!data.modules.length&&<div className="admin-empty-state">Chưa đọc được trạng thái hệ thống.</div>}<p className="admin-connect-note">Google Drive được xếp là tích hợp tùy chọn. Trạng thái Drive không làm website, Booking, CRM, Kế toán, Đối tác, CMS hoặc vận hành bị đỏ.</p></section>;
}
