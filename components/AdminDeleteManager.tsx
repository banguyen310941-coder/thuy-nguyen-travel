'use client';

import {useEffect,useState} from 'react';

type Row={id:string;name:string;kind:string;count?:number};

export function AdminDeleteManager(){
 const [rows,setRows]=useState<Row[]>([]);const [msg,setMsg]=useState('');
 const load=()=>{const out:Row[]=[];try{const ps=JSON.parse(localStorage.getItem('tn_cms_products_v3_units')||'[]');ps.forEach((p:any)=>out.push({id:p.id,name:p.name,kind:p.type,count:p.units?.length||0}))}catch{}try{const ts=JSON.parse(localStorage.getItem('tn_cms_tours_v3')||'[]');ts.forEach((t:any)=>out.push({id:t.id,name:t.name,kind:'Tour',count:t.days?.length||0}))}catch{}try{const as=JSON.parse(localStorage.getItem('tn_cms_articles_v3')||'[]');as.forEach((a:any)=>out.push({id:a.id,name:a.title,kind:'Bài viết'}))}catch{}setRows(out)};
 useEffect(load,[]);
 const remove=(r:Row)=>{const detail=r.kind==='Tour'?`${r.count||0} ngày lịch trình`:r.kind==='Bài viết'?'toàn bộ nội dung bài':`${r.count||0} căn/phòng/cabin`;if(!window.confirm(`Xóa “${r.name}”?\n\nSẽ xóa cả ${detail}. Thao tác này không thể hoàn tác.`))return;try{if(r.kind==='Tour'){const k='tn_cms_tours_v3';localStorage.setItem(k,JSON.stringify((JSON.parse(localStorage.getItem(k)||'[]')).filter((x:any)=>x.id!==r.id)))}else if(r.kind==='Bài viết'){const k='tn_cms_articles_v3';localStorage.setItem(k,JSON.stringify((JSON.parse(localStorage.getItem(k)||'[]')).filter((x:any)=>x.id!==r.id)))}else{const k='tn_cms_products_v3_units';localStorage.setItem(k,JSON.stringify((JSON.parse(localStorage.getItem(k)||'[]')).filter((x:any)=>x.id!==r.id)))}setMsg(`Đã xóa: ${r.name}`);load()}catch{setMsg('Không thể xóa dữ liệu.')}};
 return <section className="admin-panel"><div className="admin-panel-head"><div><h2>Thùng rác / Xóa dữ liệu</h2><p>Xóa Tour, Villa, khách sạn, du thuyền hoặc bài viết. Hệ thống luôn hỏi xác nhận trước khi xóa.</p></div></div>{msg&&<p className="admin-delete-message">{msg}</p>}<div className="wp-content-list">{rows.length?rows.map(r=><article key={`${r.kind}-${r.id}`}><div><b>{r.name}</b><span>{r.kind}{typeof r.count==='number'?` · ${r.count} mục con`:''}</span></div><span></span><em>Đang lưu</em><button type="button" className="danger-action" onClick={()=>remove(r)}>Xóa</button></article>):<div className="unit-empty">Chưa có dữ liệu đã lưu trên trình duyệt này.</div>}</div></section>;
}
