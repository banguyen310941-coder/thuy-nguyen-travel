'use client';

import {useEffect,useMemo,useState} from 'react';

export function UnitPhotoGallery({title,images,kind}:{title:string;images:string[];kind?:string}){
 const photos=useMemo(()=>{const unique:string[]=[];for(const raw of images){const src=String(raw||'').trim();if(src&&!unique.includes(src))unique.push(src)}return unique},[images]);
 const [open,setOpen]=useState(false);const [active,setActive]=useState(0);
 const show=(index:number)=>{setActive(Math.max(0,Math.min(index,photos.length-1)));setOpen(true)};
 const close=()=>setOpen(false);const move=(delta:number)=>setActive(i=>(i+delta+photos.length)%photos.length);
 useEffect(()=>{if(!open)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')close();if(event.key==='ArrowLeft')move(-1);if(event.key==='ArrowRight')move(1)};window.addEventListener('keydown',onKey);return()=>{document.body.style.overflow=old;window.removeEventListener('keydown',onKey)}},[open,photos.length]);
 if(!photos.length)return null;
 return <>
  <div className="unit-source-album" data-kind={kind||''} aria-label={`Toàn bộ ảnh đúng hạng ${title}`}>
   <div className="unit-source-head"><div><b>Ảnh đúng hạng phòng</b><small>{photos.length} ảnh nguồn · không dùng ảnh minh họa thay thế</small></div><button type="button" onClick={()=>show(0)}>Xem đủ {photos.length} ảnh</button></div>
   <div className="live-unit-gallery unit-source-gallery">
    {photos.map((src,index)=><button type="button" key={`${src}_${index}`} className={index===0?'unit-gallery-main':''} onClick={()=>show(index)} aria-label={`Mở ảnh ${index+1} của ${title}`}><img src={src} alt={`${title} - ảnh nguồn ${index+1}/${photos.length}`} loading="lazy"/><span>{index+1}</span></button>)}
   </div>
  </div>
  {open&&<div className="pg-modal" role="dialog" aria-modal="true" aria-label={`Album ảnh ${title}`} onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
   <div className="pg-modal-panel">
    <header><div><b>{title}</b><span>{active+1} / {photos.length} ảnh nguồn</span></div><button type="button" onClick={close} aria-label="Đóng album">✕</button></header>
    <div className="pg-stage"><button type="button" className="pg-arrow left" onClick={()=>move(-1)} aria-label="Ảnh trước">‹</button><img src={photos[active]} alt={`${title} - ảnh nguồn ${active+1}`}/><button type="button" className="pg-arrow right" onClick={()=>move(1)} aria-label="Ảnh sau">›</button></div>
    <div className="pg-thumbs">{photos.map((src,index)=><button type="button" className={index===active?'active':''} key={`${src}_${index}_thumb`} onClick={()=>setActive(index)} aria-label={`Xem ảnh ${index+1}`}><img src={src} alt="" loading="lazy"/></button>)}</div>
   </div>
  </div>}
 </>;
}
