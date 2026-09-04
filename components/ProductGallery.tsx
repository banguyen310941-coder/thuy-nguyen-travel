'use client';

import {useEffect,useMemo,useState} from 'react';
import {SafeImage,travelFallback} from '@/components/SafeImage';

const lines=(value?:string)=>String(value||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);

export function ProductGallery({title,cover,gallery,kind}:{title:string;cover?:string;gallery?:string;kind?:string}){
  const fallback=travelFallback(kind);
  const images=useMemo(()=>{
    const unique:string[]=[];
    for(const src of [cover,...lines(gallery)]){
      const value=String(src||'').trim();
      if(value&&!unique.includes(value))unique.push(value);
    }
    return unique.length?unique:[fallback];
  },[cover,gallery,fallback]);
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState(0);
  const preview=[images[0],images[1]||images[0],images[2]||images[0]];
  const show=(index:number)=>{setActive(Math.max(0,Math.min(index,images.length-1)));setOpen(true)};
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

  return <>
    <section className="container pd-gallery product-gallery" aria-label={`Album ảnh ${title}`}>
      {preview.map((src,index)=><button type="button" key={`${src}_${index}`} className={`pg-cell ${index===0?'pg-main':''}`} onClick={()=>show(index)} aria-label={`Mở ảnh ${index+1} của ${title}`}><SafeImage src={src} fallback={fallback} alt={`${title} - ảnh ${index+1}`}/></button>)}
      <button type="button" className="pd-gallery-open pg-open" onClick={()=>show(0)}>📷 Xem tất cả {images.length} ảnh</button>
    </section>
    {open&&<div className="pg-modal" role="dialog" aria-modal="true" aria-label={`Album ảnh ${title}`} onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
      <div className="pg-modal-panel">
        <header><div><b>{title}</b><span>{active+1} / {images.length} ảnh</span></div><button type="button" onClick={close} aria-label="Đóng album">✕</button></header>
        <div className="pg-stage"><button type="button" className="pg-arrow left" onClick={()=>move(-1)} aria-label="Ảnh trước">‹</button><SafeImage src={images[active]} fallback={fallback} alt={`${title} - ảnh ${active+1}`}/><button type="button" className="pg-arrow right" onClick={()=>move(1)} aria-label="Ảnh sau">›</button></div>
        <div className="pg-thumbs" aria-label="Tất cả ảnh">{images.map((src,index)=><button type="button" className={index===active?'active':''} key={`${src}_thumb`} onClick={()=>setActive(index)} aria-label={`Xem ảnh ${index+1}`}><SafeImage src={src} fallback={fallback} alt=""/></button>)}</div>
      </div>
    </div>}
  </>;
}
