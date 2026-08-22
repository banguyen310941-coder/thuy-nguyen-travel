'use client';

import {useEffect} from 'react';

function readArray(key:string){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return []}}
function writeArray(key:string,value:any[]){localStorage.setItem(key,JSON.stringify(value))}
function currentModule(){return (document.querySelector('.admin-top h1')?.textContent||'').trim()}

export function AdminDeleteEnhancer(){
 useEffect(()=>{
  const back=document.querySelector('.admin-back') as HTMLAnchorElement|null;
  if(back){
   const home=window.location.pathname.replace(/\/admin\/?(?:.*)?$/,'/')||'/';
   back.href=home;
  }

  const decorate=()=>{
   const module=currentModule();
   const isTour=module==='Tour du lịch';
   const isProduct=['Sản phẩm','Villa & Resort','Khách sạn','Du thuyền'].includes(module);
   if(!isTour&&!isProduct)return;

   document.querySelectorAll('.pm-list article').forEach((row)=>{
    const actions=row.querySelector('.pm-actions');
    if(!actions||actions.querySelector('[data-admin-delete]'))return;
    const btn=document.createElement('button');
    btn.type='button';btn.textContent='Xóa';btn.className='danger-action';btn.setAttribute('data-admin-delete','list');
    btn.onclick=()=>{
     const name=(row.querySelector('.pm-info b')?.textContent||'').trim();
     if(!name)return;
     if(isTour){
      const key='tn_cms_tours_v3';const alt='tn_cms_tours_v4';
      const data=readArray(localStorage.getItem(alt)?alt:key);const item=data.find((x:any)=>x.name===name);
      const days=Array.isArray(item?.days)?item.days.length:0;
      if(!window.confirm(`Xóa tour “${name}”${days?` và toàn bộ ${days} ngày lịch trình`:''}?`))return;
      writeArray(localStorage.getItem(alt)?alt:key,data.filter((x:any)=>x.name!==name));location.reload();
     }else{
      const key='tn_cms_products_v3_units';const data=readArray(key);const item=data.find((x:any)=>x.name===name);const units=Array.isArray(item?.units)?item.units.length:0;
      if(!window.confirm(`Xóa “${name}”${units?` và toàn bộ ${units} căn/phòng/cabin bên trong`:''}?`))return;
      writeArray(key,data.filter((x:any)=>x.name!==name));location.reload();
     }
    };
    actions.appendChild(btn);
   });

   const editorTitle=(document.querySelector('.post-title-input') as HTMLInputElement|null)?.value?.trim();
   const editorHead=document.querySelector('.editor-title-row');
   if(isProduct&&editorTitle&&editorHead&&!editorHead.querySelector('[data-admin-delete="editor"]')){
    const btn=document.createElement('button');btn.type='button';btn.textContent='Xóa sản phẩm';btn.className='danger-action';btn.setAttribute('data-admin-delete','editor');
    btn.onclick=()=>{const key='tn_cms_products_v3_units';const data=readArray(key);const item=data.find((x:any)=>x.name===editorTitle);const units=Array.isArray(item?.units)?item.units.length:0;if(!window.confirm(`Xóa “${editorTitle}”${units?` và toàn bộ ${units} căn/phòng/cabin`:''}?`))return;writeArray(key,data.filter((x:any)=>x.name!==editorTitle));location.reload()};
    editorHead.appendChild(btn);
   }

   const tourHeading=Array.from(document.querySelectorAll('.tour-editor-admin h2')).find(el=>(el.textContent||'').includes('Chỉnh sửa Tour'));
   const tourHead=tourHeading?.closest('.admin-panel-head');
   if(isTour&&tourHead&&!tourHead.querySelector('[data-admin-delete="editor"]')){
    const name=((tourHead.querySelector('h2')?.textContent||'').replace('Chỉnh sửa Tour','').trim())||'';
    const fallback=(document.querySelector('.tour-editor-grid input') as HTMLInputElement|null)?.value?.trim()||name;
    if(fallback){const btn=document.createElement('button');btn.type='button';btn.textContent='Xóa Tour';btn.className='danger-action';btn.setAttribute('data-admin-delete','editor');btn.onclick=()=>{const key=localStorage.getItem('tn_cms_tours_v4')?'tn_cms_tours_v4':'tn_cms_tours_v3';const data=readArray(key);const item=data.find((x:any)=>x.name===fallback);const days=Array.isArray(item?.days)?item.days.length:0;if(!window.confirm(`Xóa tour “${fallback}”${days?` và ${days} ngày lịch trình`:''}?`))return;writeArray(key,data.filter((x:any)=>x.name!==fallback));location.reload()};tourHead.appendChild(btn)}
   }
  };
  decorate();
  const observer=new MutationObserver(()=>decorate());observer.observe(document.body,{childList:true,subtree:true});
  return()=>observer.disconnect();
 },[]);
 return null;
}
