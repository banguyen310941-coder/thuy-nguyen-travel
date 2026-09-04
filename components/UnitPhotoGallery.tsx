'use client';

import {useEffect,useMemo,useState} from 'react';
import {SafeImage,travelFallback} from '@/components/SafeImage';

export function UnitPhotoGallery({title,images,kind}:{title:string;images:string[];kind?:string}){
 const fallback=travelFallback(kind||'hotel');
 const photos=useMemo(()=>{const unique:string[]=[];for(const raw of images){const src=String(raw||'').trim();if(src&&!unique.includes(src))unique.push(src)}return unique},[images]);
 const [open,setOpen]=useState(false);const [active,setActive]=useState(0);
 const show=(index:number)=>{setActive(Math.max(0,Math.min(index,photos.length-1)));setOpen(true)};
 const close=()=>setOpen(false);const move=(delta:number)=>setActive(i=>(i+delta+photos.length)%photos.length);
 useEffect(()=>{if(!open)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')close();if(event.key==='ArrowLeft')move(-1);if(event.key==='ArrowRight')move(1)};window.addEventListener('keydown',onKey);return()=>{document.body.style.overflow=old;window.removeEventListener('keydown',onKey)}},[open,photos.length]);
 if(!photos.length)return null;
 const preview=photos.slice(0,5);
 return <>
  <div className="live-unit-gallery" aria-label={`Ảnh ${title}`}>
   {preview.map((src,index)=><button type="button" key={`${src}_${index}`} className={index===0?'unit-gallery-main':''} onClick={()=>show(index)} aria-label={`Mở ảnh ${index+1} của ${title}`}><SafeImage src={src} fallback={fallback} alt={`${title} - ảnh ${index+1}`}/>{index===0&&<span>📷 Xem ảnh</span>}</button>)}
   {photos.length>preview.length&&<button type="button" className="unit-photo-count" onClick={()=>show(preview.length)} aria-label={`Xem tất cả ${photos.length} ảnh`}>+{photos.length-preview.length}<small>ảnh</small></button>}
  </div>
  {open&&<div className="pg-modal" role="dialog" aria-modal="true" aria-label={`Album ảnh ${title}`} onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
   <div className="pg-modal-panel">
    <header><div><b>{title}</b><span>{active+1} / {photos.length} ảnh</span></div><button type="button" onClick={close} aria-label="Đóng album">✕</button></header>
    <div className="pg-stage"><button type="button" className="pg-arrow left" onClick={()=>move(-1)} aria-label="Ảnh trước">‹</button><SafeImage src={photos[active]} fallback={fallback} alt={`${title} - ảnh ${active+1}`}/><button type="button" className="pg-arrow right" onClick={()=>move(1)} aria-label="Ảnh sau">›</button></div>
    <div className="pg-thumbs">{photos.map((src,index)=><button type="button" className={index===active?'active':''} key={`${src}_${index}_thumb`} onClick={()=>setActive(index)} aria-label={`Xem ảnh ${index+1}`}><SafeImage src={src} fallback={fallback} alt=""/></button>)}</div>
   </div>
  </div>}
 </>;
}
