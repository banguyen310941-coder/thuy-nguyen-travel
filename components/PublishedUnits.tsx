'use client';

import {useEffect,useState} from 'react';

type Unit={id:string;code:string;name:string;capacity:string;area:string;view:string;meal:string;weekdayPrice:string;weekendPrice:string;holidayPrice:string;status:string};
type Product={slug:string;units?:Unit[]};

export function PublishedUnits({slug,label='Căn / hạng phòng'}:{slug:string;label?:string}){
 const [units,setUnits]=useState<Unit[]>([]);
 useEffect(()=>{try{const raw=localStorage.getItem('tn_cms_products_v3_units');if(!raw)return;const products:Product[]=JSON.parse(raw);const product=products.find(p=>p.slug===slug);setUnits((product?.units||[]).filter(u=>u.status!=='hidden'))}catch{}},[slug]);
 if(!units.length)return null;
 return <section className="detail-block live-units" id="units"><div className="live-units-head"><h2>{label} đang quản lý</h2><p>Giá hiển thị theo từng căn/phòng; ngày lễ và tình trạng trống cần xác nhận theo ngày thực tế.</p></div><div className="live-unit-list">{units.map(u=>{const available=u.status==='available';return <article key={u.id}><div><b>{u.name}</b><small>{u.code||'Chưa có mã'} · {u.capacity||'Sức chứa liên hệ'}{u.area?` · ${u.area}`:''}{u.view?` · ${u.view}`:''}</small>{u.meal&&<span>{u.meal}</span>}</div><div className="live-unit-prices"><span><small>Ngày thường</small><b>{u.weekdayPrice||'Liên hệ'}</b></span><span><small>Cuối tuần</small><b>{u.weekendPrice||u.weekdayPrice||'Liên hệ'}</b></span><span><small>Lễ/Tết</small><b>{u.holidayPrice||'Liên hệ'}</b></span></div><em className={`unit-public-status ${u.status}`}>{available?'Còn bán':u.status==='hold'?'Tạm giữ':u.status==='soldout'?'Hết phòng':'Ẩn'}</em>{available?<a href="#booking">Đặt căn này</a>:<span className="unit-unavailable">Chưa thể đặt</span>}</article>})}</div></section>;
}
