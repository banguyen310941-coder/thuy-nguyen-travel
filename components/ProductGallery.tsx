'use client';

import {useEffect,useMemo,useState} from 'react';

const lines=(value?:string)=>String(value||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);

export function ProductGallery({title,cover,gallery,kind}:{title:string;cover?:string;gallery?:string;kind?:string}){
  const images=useMemo(()=>{
    const unique:string[]=[];
    for(const src of [cover,...lines(gallery)]){
      const value=String(src||'').trim();
      if(value&&!unique.includes(value))unique.push(value);
    }
    return unique;
  },[cover,gallery]);
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState(0);
  const preview=images.slice(0,3);
  const show=(index:number)=>{if(!images.length)return;setActive(Math.max(0,Math.min(index,images.length-1)));setOpen(true)};
  const close=()=>setOpen(false);
  const move=(delta:number)=>setActive(i=>(i+delta+images.length)%images.length);

  useEffect(()=>{
    if(!open)return;
    const old=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape')close();
      if(event.key==='ArrowLeft')move(-1);
      if(event.key==='ArrowRight')move(1);
    };
    window.addEventListener('keydown',onKey);
    return()=>{document.body.style.overflow=old;window.removeEventListener('keydown',onKey)};
  },[open,images.length]);

  if(!images.length)return <section className="container pg-source-empty" data-kind={kind||''}><b>Album ảnh sản phẩm</b><span>Chưa có ảnh nguồn được xác nhận cho sản phẩm này.</span></section>;

  return <>
    <section className="container pd-gallery product-gallery" aria-label={`Album ảnh ${title}`} data-kind={kind||''}>
      {preview.map((src,index)=><button type="button" key={`${src}_${index}`} className={`pg-cell ${index===0?'pg-main':''}`} onClick={()=>show(index)} aria-label={`Mở ảnh ${index+1} của ${title}`}><img src={src} alt={`${title} - ảnh nguồn ${index+1}`} loading={index===0?'eager':'lazy'}/></button>)}
      <button type="button" className="pd-gallery-open pg-open" onClick={()=>show(0)}>📷 Xem tất cả {images.length} ảnh</button>
    </section>
    <section className="container pg-source-album" aria-label={`Toàn bộ ${images.length} ảnh nguồn của ${title}`}>
      <div className="pg-source-head"><div><small>ẢNH NGUỒN SẢN PHẨM</small><b>Album đầy đủ · {images.length} ảnh</b><span>Toàn bộ ảnh dưới đây lấy trực tiếp từ dữ liệu nguồn của sản phẩm, không dùng ảnh minh họa thay thế.</span></div><button type="button" onClick={()=>show(0)}>Xem toàn màn hình</button></div>
      <div className="pg-source-strip">{images.map((src,index)=><button type="button" key={`${src}_source_${index}`} onClick={()=>show(index)} aria-label={`Xem ảnh nguồn ${index+1} của ${title}`}><img src={src} alt={`${title} - ảnh ${index+1}/${images.length}`} loading="lazy"/><span>{index+1}</span></button>)}</div>
    </section>
    {open&&<div className="pg-modal" role="dialog" aria-modal="true" aria-label={`Album ảnh ${title}`} onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
      <div className="pg-modal-panel">
        <header><div><b>{title}</b><span>{active+1} / {images.length} ảnh nguồn</span></div><button type="button" onClick={close} aria-label="Đóng album">✕</button></header>
        <div className="pg-stage"><button type="button" className="pg-arrow left" onClick={()=>move(-1)} aria-label="Ảnh trước">‹</button><img src={images[active]} alt={`${title} - ảnh nguồn ${active+1}`}/><button type="button" className="pg-arrow right" onClick={()=>move(1)} aria-label="Ảnh sau">›</button></div>
        <div className="pg-thumbs" aria-label="Tất cả ảnh nguồn">{images.map((src,index)=><button type="button" className={index===active?'active':''} key={`${src}_thumb`} onClick={()=>setActive(index)} aria-label={`Xem ảnh ${index+1}`}><img src={src} alt="" loading="lazy"/></button>)}</div>
      </div>
    </div>}
  </>;
}
