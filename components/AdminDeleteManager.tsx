'use client';

import {useEffect,useState} from 'react';

type Row={id:string;kind:'products'|'tours'|'articles';label:string;name:string;count?:number;updatedAt?:string};
type ApiResult={ok?:boolean;rows?:Row[];key?:string;value?:unknown;error?:string};
const EVENTS:Record<Row['kind'],string>={products:'tn-products-updated',tours:'tn-tours-updated',articles:'tn-articles-updated'};

async function request(body?:unknown){const response=await fetch('/api/admin/cms-trash',body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'});const data=await response.json().catch(()=>({})) as ApiResult;if(!response.ok)throw new Error(data.error||'Không thể xử lý dữ liệu production.');return data}

export function AdminDeleteManager(){
 const[rows,setRows]=useState<Row[]>([]),[msg,setMsg]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState('');
 async function load(){setLoading(true);try{const data=await request();setRows(data.rows||[])}catch(error){setMsg(error instanceof Error?error.message:'Không đọc được dữ liệu production.')}finally{setLoading(false)}}
 useEffect(()=>{void load()},[]);
 async function remove(row:Row){const detail=row.kind==='tours'?`${row.count||0} ngày lịch trình`:row.kind==='articles'?'toàn bộ nội dung bài':`${row.count||0} căn/phòng/cabin`;if(!window.confirm(`Xóa vĩnh viễn “${row.name}”?\n\nSẽ xóa cả ${detail} khỏi dữ liệu production dùng chung. Thao tác này được ghi audit và không thể hoàn tác từ giao diện.`))return;setBusy(`${row.kind}:${row.id}`);setMsg('');try{const data=await request({action:'delete',kind:row.kind,id:row.id});if(data.key){localStorage.setItem(data.key,JSON.stringify(data.value??[]));window.dispatchEvent(new Event(EVENTS[row.kind]));window.dispatchEvent(new Event('storage'))}setMsg(`Đã xóa khỏi production: ${row.name}`);await load()}catch(error){setMsg(error instanceof Error?error.message:'Không thể xóa dữ liệu production.')}finally{setBusy('')}}
 return <section className="admin-panel"><div className="admin-panel-head"><div><small>OWNER ONLY · PRODUCTION</small><h2>Xóa dữ liệu</h2><p>Danh sách được đọc từ dữ liệu production dùng chung. Xóa tại đây cập nhật server trước rồi mới đồng bộ cache trình duyệt.</p></div></div>{msg&&<p className="admin-delete-message">{msg}</p>}<div className="wp-content-list">{loading?<div className="unit-empty">Đang tải dữ liệu production...</div>:rows.length?rows.map(row=><article key={`${row.kind}-${row.id}`}><div><b>{row.name}</b><span>{row.label}{typeof row.count==='number'?` · ${row.count} mục con`:''}</span></div><span></span><em>Production</em><button type="button" className="danger-action" disabled={Boolean(busy)} onClick={()=>void remove(row)}>{busy===`${row.kind}:${row.id}`?'Đang xóa...':'Xóa vĩnh viễn'}</button></article>):<div className="unit-empty">Chưa có Tour, sản phẩm hoặc bài viết trong dữ liệu production.</div>}</div></section>
}
