'use client';

import {googleMapsEmbedUrl,googleMapsUrl,productCoordinates,productLocationLabel,type ProductLocationLike} from '@/lib/product-location';

type Props={name:string;product:ProductLocationLike;compact?:boolean};

export function ProductLocationMap({name,product,compact=false}:Props){
 const label=productLocationLabel(product),embed=googleMapsEmbedUrl(product),external=googleMapsUrl(product),coordinates=productCoordinates(product);
 if(!embed)return null;
 return <section id="location" className={`pd-block product-location-map ${compact?'compact':''}`}>
  <div className="product-location-head"><div><small>VỊ TRÍ SẢN PHẨM</small><h2>Vị trí trên bản đồ</h2><p>{label||String(product.place||'')}</p></div>{external&&<a href={external} target="_blank" rel="noreferrer">Mở Google Maps ↗</a>}</div>
  <div className="product-map-frame"><iframe title={`Bản đồ ${name}`} src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/></div>
  <div className="product-location-meta"><span>📍 {String(product.place||label||'Đang cập nhật khu vực')}</span>{coordinates?<span>✓ Đã ghim vị trí chính xác</span>:<span>Định vị theo địa chỉ đã đăng</span>}</div>
 </section>;
}
