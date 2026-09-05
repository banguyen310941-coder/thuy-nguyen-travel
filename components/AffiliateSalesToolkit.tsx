/* eslint-disable @next/next/no-img-element */
'use client';

import {useEffect,useMemo,useState} from 'react';

type Product={id:string;slug?:string;type?:string;name:string;place:string;cover?:string;publicPrice:number;affiliateLink:string;media?:string[];albumUrl?:string};
type Props={products:Product[];commissionRate:number;referralCode:string};
const money=(v:number)=>new Intl.NumberFormat('vi-VN').format(Math.round(v))+'đ';
const mediaId=(src:string)=>src.match(/\/d\/([^/=]+)(?:=|\/|$)/)?.[1]||new URLSearchParams(src.split('?')[1]||'').get('id')||'';
const downloadUrl=(src:string)=>{const id=mediaId(src);return id?`https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`:src};
const iconFor=(type?:string)=>/hotel|khách sạn/i.test(type||'')?'🏨':/cruise|du thuyền/i.test(type||'')?'🛳️':/tour/i.test(type||'')?'🧳':'🏡';

export function AffiliateSalesToolkit({products,commissionRate,referralCode}:Props){
 const[selectedId,setSelectedId]=useState(''),[copied,setCopied]=useState('');
 useEffect(()=>{if(!selectedId&&products[0])setSelectedId(products[0].id)},[selectedId,products]);
 const product=useMemo(()=>products.find(v=>v.id===selectedId)||products[0]||null,[selectedId,products]);
 const media=useMemo(()=>{const unique:string[]=[];for(const src of product?.media||[]){const value=String(src||'').trim();if(value&&!unique.includes(value))unique.push(value)}return unique},[product]);
 const caption=useMemo(()=>product?`${iconFor(product.type)} ${product.name}${product.place?` · ${product.place}`:''}\n${product.publicPrice?`Giá công khai từ ${money(product.publicPrice)}. `:''}HappyGo hỗ trợ tư vấn và đặt chỗ nhanh.\n\nXem chi tiết & đặt dịch vụ: ${product.affiliateLink}\n\nMã CTV: ${referralCode}`:'',[product,referralCode]);
 async function copy(kind:'caption'|'link'){
  if(!product)return;
  try{await navigator.clipboard.writeText(kind==='caption'?caption:product.affiliateLink);setCopied(kind);window.setTimeout(()=>setCopied(''),1600)}catch{setCopied('error');window.setTimeout(()=>setCopied(''),1800)}
 }
 return <section className="affiliate-panel affiliate-toolkit">
  <div className="affiliate-panel-head"><div><small>BỘ CÔNG CỤ BÁN HÀNG</small><h2>Caption, link và album ảnh sản phẩm</h2><p>Chọn sản phẩm, copy nội dung rồi tải đúng ảnh nguồn để gửi khách qua Zalo, Facebook hoặc kênh bán hàng của bạn.</p></div></div>
  <div className="affiliate-toolkit-grid">
   <div className="affiliate-toolkit-builder">
    <label>Chọn sản phẩm<select value={product?.id||''} onChange={e=>setSelectedId(e.target.value)} disabled={!products.length}>{products.map(v=><option key={v.id} value={v.id}>{v.name}{v.place?` · ${v.place}`:''}</option>)}</select></label>
    {product?<>
     <textarea readOnly value={caption}/>
     <div className="affiliate-toolkit-actions"><button type="button" onClick={()=>void copy('link')}>{copied==='link'?'✓ Đã copy link':'Copy link'}</button><button type="button" className="primary" onClick={()=>void copy('caption')}>{copied==='caption'?'✓ Đã copy caption':'Copy caption + link'}</button></div>
     {copied==='error'&&<span className="affiliate-form-hint">Trình duyệt không cho phép copy tự động. Bạn có thể bôi đen nội dung để sao chép.</span>}
     <div className="affiliate-media-head"><div><b>Album CTV tải về</b><small>{media.length?`${media.length} ảnh gốc đã gom từ ảnh đại diện, thư viện sản phẩm và từng hạng phòng/cabin.`:'Sản phẩm này chưa có ảnh nguồn.'}</small></div>{product.albumUrl&&<a href={product.albumUrl} target="_blank" rel="noreferrer">Tải cả album trên Drive ↗</a>}</div>
     {media.length?<div className="affiliate-media-grid">{media.map((src,index)=><article key={`${src}_${index}`}><a href={src} target="_blank" rel="noreferrer" className="affiliate-media-preview"><img src={src} alt={`${product.name} - ảnh ${index+1}`} loading="lazy"/></a><div><span>Ảnh {index+1}</span><a href={downloadUrl(src)} target="_blank" rel="noreferrer">Tải ảnh gốc</a></div></article>)}</div>:<div className="affiliate-empty">Chưa có album ảnh cho sản phẩm này.</div>}
    </>:<div className="affiliate-empty">Chưa có sản phẩm công khai để tạo nội dung chia sẻ.</div>}
   </div>
   <aside className="affiliate-policy-card">
    <small>CHÍNH SÁCH HOA HỒNG HIỆN TẠI</small>
    <strong>{commissionRate}%</strong>
    <ul><li>Chỉ sử dụng giá bán công khai và ảnh trong album nguồn của HappyGo.</li><li>Không chỉnh sửa hoặc tự thay ảnh sản phẩm không có trong nguồn.</li><li>Link giới thiệu được ghi nhận trong 30 ngày trên trình duyệt khách.</li><li>Hoa hồng chỉ phát sinh khi booking chuyển sang trạng thái hoàn tất.</li><li>Booking hủy hoặc không hoàn tất không được cộng hoa hồng.</li><li>Số tiền = giá trị bán của booking × tỷ lệ hoa hồng của CTV.</li><li>CTV gửi yêu cầu rút tiền; Admin đối soát rồi mới trừ số dư ví.</li></ul>
   </aside>
  </div>
 </section>;
}
